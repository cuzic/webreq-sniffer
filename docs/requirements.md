
**バージョン:** 2.0  
**作成日:** 2025年10月18日  
**最終更新者:** Gemini  
**ステータス:** 設計確定

### 0\. 目的と背景

#### 0.1. 目的

ブラウジング中に発生するネットワークリクエストをユーザーの明示的な操作により収集し、URLおよび主要なHTTPヘッダを安全に記録する。特にm3u8/MPD等のストリーミングプレイリストの効率的な収集を可能にし、収集したデータをBash (curl, yt-dlp) やPowerShellなど、再利用性の高いスクリプト形式でエクスポートできるようにする。

#### 0.2. 重視する原則

  * **Manifest V3への完全準拠:** Service WorkerのライフサイクルやAPIの制約を考慮する。
  * **プライバシー保護の徹底:** CookieやAuthorizationヘッダなどの機微な情報は、既定で収集せず、ユーザーの明確なオプトインがない限り扱わない。
  * **CWS審査への対応:** 権限の使用目的を明確にし、プライバシーポリシーを整備する。
  * **パフォーマンス:** HLS/DASHの大量セグメントリクエストによるパフォーマンス低下を回避する設計を採用する。

### 1\. アーキテクチャ概要

本拡張機能は、Manifest V3のイベント駆動モデルに基づき、以下のコンポーネントで構成される。

  * **Service Worker (`background.js`):**
      * すべてのビジネスロジックの中核。
      * `webRequest` APIのリスナーを常時登録し、内部フラグ（`storage`に保存）によって監視のON/OFFを制御する。
      * リクエストのフィルタリング、データの整形・保存（リングバッファ）、拡張機能バッジの制御、エクスポート用スクリプトの生成を担当する。
  * **Action Popup (`popup.html`/`js`):**
      * ユーザーの主要な操作インターフェース。
      * 監視の開始・停止、監視対象スコープ（アクティブタブ/全タブ）の切り替え、ログ件数の表示、データのエクスポートとクリアを行う。
  * **Options Page (`options.html`/`js`):**
      * 拡張機能の永続的な設定を行うための独立したページ。
      * フィルター条件、ヘッダ収集ポリシー、上限設定などを定義する。
  * **Storage:**
      * `chrome.storage.sync`: ユーザー設定を保存。アカウント間で同期される。
      * `chrome.storage.local`: 収集したログデータを保存。大容量を扱うため、将来的には`IndexedDB`への移行も視野に入れる。

### 2\. 権限・Manifest設計 (`manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "WebreqSniffer",
  "version": "1.0.0",
  "description": "Monitors network requests and generates download scripts.",
  "permissions": [
    "webRequest",
    "storage",
    "downloads",
    "activeTab",
    "unlimitedStorage"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "WebreqSniffer"
  },
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "incognito": "split"
}
```

  * **`host_permissions`**: `<all_urls>`は、サイトを横断するリダイレクトや、別ドメインから配信されるリソース（動画セグメント等）を捕捉するために必須。
  * **`webRequest`リスナーの`opt_extraInfoSpec`**:
      * `onBeforeSendHeaders`: ヘッダ情報を取得するため、`["requestHeaders", "extraHeaders"]`が必須。

### 3\. データモデル

#### 3.1. 設定 (`storage.sync`)

```typescript
// in storage.sync
interface Settings {
  targetScope: "activeTab" | "allTabs";
  presets: { video: boolean; document: boolean; image: boolean; };
  simpleFilters: string[];      // e.g., ".m3u8", ".pdf", "segment"
  regexFilters: string[];       // e.g., "/(master|index)\\.m3u8/i"
  resourceTypes: string[];      // e.g., ["xmlhttprequest", "media", "image"]
  allowList: string[];          // e.g., "https://*.example.com/*"
  denyList: string[];
  headerPolicy: {
    basic: boolean;             // Collect User-Agent, Referer, Origin
    sensitiveEnabled: boolean;  // Collect Cookie, Authorization, etc. (Default: false)
  };
  hlsMpdMode: "playlistOnly" | "all"; // Default: "playlistOnly"
  limits: { maxEntries: number; }; // e.g., 3000
  exportSettings: {
    filenameTemplate: string;   // e.g., "netlog_{date}_{domain}.{ext}"
    newline: "LF" | "CRLF";
  };
  ui: { showBadge: boolean; };
}
```

#### 3.2. ログ (`storage.local`)

```typescript
// in storage.local
interface LogEntry {
  id: string;                   // Internal unique ID (e.g., UUID)
  requestId: string;            // From webRequest API
  url: string;                  // Final URL after redirects
  method: string;               // "GET", "POST", etc.
  type: string;                 // ResourceType
  tabId: number;
  frameId: number;
  timestamp: number;            // Epoch milliseconds
  initiator?: string;           // e.g., "https://example.com"
  headers?: {
    "User-Agent"?: string;
    "Referer"?: string;
    "Origin"?: string;
    // Sensitive headers are only held in memory temporarily if enabled, NOT saved to storage.
  };
  dedupeKey: string;            // Hash of (url + key headers) for deduplication
}

interface LogData {
  isMonitoring: boolean;
  monitoringScope: "activeTab" | "allTabs";
  activeTabId?: number;
  entries: LogEntry[]; // Managed as a ring buffer
}
```

### 4\. 画面仕様

#### 4.1. ポップアップ画面 (`popup.html`)

  * **ヘッダ:** タイトル、ステータス表示（`● 監視中` / `◯ 停止中`）。
  * **操作エリア:**
      * **監視コントロール:**
          * `[監視スタート]` / `[監視ストップ]` ボタン。
          * 監視対象スコープの切り替えスイッチ: `[アクティブタブのみ]` / `[すべてのタブ]`。
      * **データ操作:**
          * `[ログをダウンロード]` ボタン: クリックで形式選択ドロップダウンを表示。
              * 形式: URLリスト(.txt), Bash(curl), Bash(curl+Headers), Bash(yt-dlp), PowerShell。
          * `[ログをクリア]` ボタン (ゴミ箱アイコン): 確認ダイアログを経てログを削除。
  * **情報エリア:**
      * ログ件数を表示。
      * `[設定 ⚙]` リンク: オプションページを開く。

#### 4.2. オプション画面 (`options.html`)

  * **フィルター設定:**
      * プリセットボタン: `[動画ストリーミング]`, `[ドキュメント]`, `[画像]`。
      * カスタムフィルター: 簡易指定（テキストエリア）、正規表現（テキストエリア）、`resourceType`（チェックボックス群）。
      * ドメインフィルター: Allow/Denyリスト（テキストエリア）。
  * **収集ポリシー設定:**
      * **HLS/MPDモード:** ラジオボタン `[プレイリスト/メタデータのみ (推奨)]` / `[すべてのセグメントを含む]`。
      * **ヘッダ収集ポリシー:**
          * `[✓] 基本ヘッダ (User-Agent, Referer, Origin) を収集する` (デフォルトON)。
          * `[ ] 機微なヘッダ (Cookie, Authorization等) を収集する` (デフォルトOFF、強い警告文を併記)。
  * **上限設定:**
      * 最大ログ件数（数値入力）。
  * **エクスポート設定:**
      * ファイル名テンプレート（テキスト入力）。
  * **操作:**
      * `[保存]` ボタン、設定のインポート/エクスポート機能。

### 5\. 機能仕様・振る舞い

#### 5.1. 監視フロー (Start/Stop)

1.  **起動時:** `background.js`は`onBeforeRequest`と`onBeforeSendHeaders`のリスナーを**常時登録**しておく。
2.  **監視スタート:**
      * Popupから`start`メッセージを受信。
      * `storage.local`に `{ isMonitoring: true, ... }` フラグをセット。
      * 拡張機能バッジに "REC" を表示。
3.  **監視ストップ:**
      * Popupから`stop`メッセージを受信。
      * `storage.local`の`isMonitoring`を`false`にセット。
      * バッジを消灯。

#### 5.2. リクエスト捕捉・フィルタリング

1.  `webRequest`リスナーが発火。
2.  まず`storage.local`の`isMonitoring`フラグをチェック。`false`なら即時`return`。
3.  **フィルタリング処理（評価順）:**
    1.  **Denyリスト**に合致すれば除外。
    2.  **Allowリスト**が存在し、それに合致しなければ除外。
    3.  \*\*`resourceType`\*\*が設定と合致しなければ除外。
    4.  **HLS/MPDモード (`playlistOnly`)** の場合、`.ts`, `.m4s`等のセグメントパターンに合致すれば除外。
    5.  **正規表現**または**簡易フィルター**に合致すれば採用。
4.  **データ保存:**
      * 採用されたリクエストの情報を`LogEntry`として整形。
      * 重複排除キー(`dedupeKey`)を生成し、既存ログに存在しないかチェック。
      * 上限件数を超えていれば、最も古いエントリを削除（LRU）。
      * `storage.local`に保存（パフォーマンスのため250ms程度のデバウンス処理を挟む）。

#### 5.3. データエクスポート

1.  Popupから`export`メッセージ（フォーマット指定付き）を受信。
2.  `storage.local`からログを取得。
3.  **機微ヘッダの扱い:** ヘッダ付きスクリプトが要求され、かつオプションで許可されている場合のみ、`onBeforeSendHeaders`で一時的に保持した機微ヘッダをエクスポート直前に付与する（**ストレージには決して保存しない**）。
4.  指定されたフォーマットに従い、文字列を生成。URLやヘッダ値は各シェルの仕様に合わせて適切にエスケープする。
5.  `chrome.downloads.download()` APIを使い、生成した文字列をBlobとしてファイルに保存する。

### 6\. プライバシーとセキュリティ

  * **データ最小化:** 収集するデータは目的達成に必要な最小限に留める。
  * **機微ヘッダの既定OFF:** プライバシー侵害リスクの高いCookie/Authorizationヘッダは、ユーザーがリスクを理解した上で明示的に有効化しない限り、一切収集・保持しない。
  * **ユーザーコントロール:** 監視の開始・停止は常にユーザーの操作に依存する。ログのクリアも容易に行える。
  * **プライバシーポリシー:** CWSの要件に従い、収集するデータ、その目的、保存場所、共有の有無（共有しない）を明記したプライバシーポリシーを公開する。

### 7\. リスクと対応策

| リスク | 対応策 |
| :--- | :--- |
| **CWS審査でのリジェクト** | プライバシーポリシーを整備し、`host_permissions`の使用目的（サイト横断リソースの捕捉）を明確に説明。機微データの扱いが安全であることを強調する。 |
| **大量データによるパフォーマンス低下** | HLS/MPDの`playlistOnly`モードをデフォルトONにする。ログ保存にデバウンス処理を導入。上限設定とLRUによる自動削除を実装する。 |
| **サイト互換性の問題** | 一部のサイトで必要な`Referer`, `Origin`ヘッダは基本ヘッダとして収集可能にする。より複雑な認証が必要な場合は対象外とする。 |
