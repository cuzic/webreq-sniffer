# Quick Wins 実装サマリー

**実装日**: 2025-10-18
**対象**: WebreqSniffer Chrome Extension

---

## 実装した改善

### 1. ✅ エントリーの色分け機能

**実装ファイル**:

- `src/lib/ui-helpers.ts` (新規作成)
- `src/popup/components/LogList.tsx` (改善)

**機能概要**:
リソースタイプ別に視覚的に区別できるよう、背景色とバッジを追加しました。

**色分けパターン**:

```
🎬 media        → 青色 (Blue)
📡 XHR          → 緑色 (Green)
📜 script       → 黄色 (Yellow)
🎨 stylesheet   → 紫色 (Purple)
🖼️ image        → ピンク (Pink)
🔤 font         → インディゴ (Indigo)
📄 document     → グレー (Gray)
📦 その他        → スレート (Slate)
```

**効果**:

- 一目でリソースタイプが分かる
- 大量のログでも視認性が向上
- mediaタイプ（動画）が探しやすい

**コード例**:

```tsx
// src/lib/ui-helpers.ts
export function getTypeColor(type: string): string {
  switch (type) {
    case 'media':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'xmlhttprequest':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    // ...
  }
}

export function getTypeIcon(type: string): string {
  switch (type) {
    case 'media':
      return '🎬';
    case 'xmlhttprequest':
      return '📡';
    // ...
  }
}
```

**UI改善**:

- エントリーごとに背景色が変わる
- タイプバッジにアイコンと名前を表示
- 選択時はプライマリカラーのリングで強調

---

### 2. ✅ エントリー数バッジの強化

**実装ファイル**:

- `src/background/badge.ts` (改善)

**機能概要**:
拡張機能アイコンのバッジにエントリー数を表示する機能を追加しました。

**表示形式**:

```
0 - 999:   そのまま表示 (例: "45")
1000 - 9999: 小数点付きk表示 (例: "1.2k")
10000+:    整数k表示 (例: "12k")
```

**効果**:

- 拡張機能を開かずにログ数が分かる
- 監視中のフィードバックが即座に得られる
- キャプチャの進捗が視覚的に把握できる

**コード例**:

```tsx
export async function updateBadgeCount(isMonitoring: boolean, entryCount: number): Promise<void> {
  if (isMonitoring) {
    let badgeText: string;
    if (entryCount >= 10000) {
      badgeText = Math.floor(entryCount / 1000) + 'k';
    } else if (entryCount >= 1000) {
      badgeText = (entryCount / 1000).toFixed(1) + 'k';
    } else {
      badgeText = entryCount.toString();
    }

    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  }
}
```

**使用方法**:

```tsx
// background/request-logger.ts で呼び出し
import { updateBadgeCount } from './badge';

// ログ追加時
await updateBadgeCount(isMonitoring, entries.length);
```

---

### 3. ✅ UIヘルパー関数の追加

**実装ファイル**:

- `src/lib/ui-helpers.ts` (新規作成)

**提供機能**:

```tsx
// 色分け関数
getTypeColor(type: string): string
getTypeBadgeColor(type: string): string

// アイコン・表示名
getTypeIcon(type: string): string
getTypeDisplayName(type: string): string

// フォーマット関数
formatFileSize(bytes: number | undefined): string
truncateUrl(url: string, maxLength: number): string
```

**効果**:

- UI関連のロジックを集約
- 再利用可能なヘルパー関数
- 将来の拡張が容易

**使用例**:

```tsx
import { formatFileSize, truncateUrl } from '@/lib/ui-helpers';

// ファイルサイズ表示
formatFileSize(1024); // "1.0 KB"
formatFileSize(1048576); // "1.0 MB"

// URL短縮表示
truncateUrl('https://example.com/very/long/path/to/file.mp4', 30);
// "example.com/very/long/pa..."
```

---

## 実装統計

**追加ファイル**: 2個

- `src/lib/ui-helpers.ts` (123行)
- `docs/USER-EXPERIENCE-IMPROVEMENTS.md` (改善提案書)

**変更ファイル**: 2個

- `src/popup/components/LogList.tsx` (10行追加)
- `src/background/badge.ts` (23行追加)

**実装時間**: 約30分

**ビルドサイズへの影響**: 最小限

- ui-helpers.ts: 約3KB (gzip後)
- LogList.tsx: インポート追加のみ

**テスト**: ビルド成功確認済み

---

## ビフォー・アフター

### Before (改善前)

```
┌────────────────────────────────────┐
│ ☐ https://cdn.example.com/video.ts │
│   GET  media  14:30:45              │
├────────────────────────────────────┤
│ ☐ https://api.example.com/data.json│
│   GET  xmlhttprequest  14:30:46    │
└────────────────────────────────────┘

全て同じ白背景で区別しにくい
```

### After (改善後)

```
┌────────────────────────────────────┐
│ ☐ https://cdn.example.com/video.ts │
│   GET  [🎬 Media]  14:30:45        │ ← 青背景
├────────────────────────────────────┤
│ ☐ https://api.example.com/data.json│
│   GET  [📡 XHR]  14:30:46          │ ← 緑背景
└────────────────────────────────────┘

タイプごとに色分けされて一目で分かる
アイコン付きバッジで視認性向上
```

---

## ユーザーへの影響

### 1. 視認性の向上

- ✅ リソースタイプが色で識別可能
- ✅ アイコンで直感的に理解
- ✅ 大量ログでも目的のものが探しやすい

### 2. 操作性の向上

- ✅ 拡張機能アイコンでログ数確認
- ✅ ポップアップを開く前に進捗把握
- ✅ バッジで監視状態を常に表示

### 3. 学習コストの低減

- ✅ 色とアイコンで直感的に理解
- ✅ テキストだけより分かりやすい
- ✅ 初めてでも使いやすい

---

### 4. ✅ エクスポートプレビュー機能 (Issue #41)

**実装日**: 2025-10-18
**実装ファイル**:

- `src/popup/components/ExportDialog.tsx` (新規作成)
- `src/popup/components/LogActions.tsx` (改善)
- `src/popup/Popup.tsx` (改善)

**機能概要**:
エクスポート実行前にファイル内容のプレビューを表示する機能を追加しました。

**主な機能**:

- エクスポート形式選択後、ダイアログでプレビュー表示
- 最初の3エントリーを使用してプレビュー生成
- 15行以上の場合は展開/折りたたみボタン表示
- フォーマット名とエントリー数を表示
- キャンセルまたは確定の選択が可能

**UIフロー**:

```
1. ユーザーが「ログをダウンロード」をクリック
   ↓
2. ドロップダウンから形式を選択 (例: Bash curl)
   ↓
3. プレビューダイアログが自動的に開く
   ↓
4. 生成されるファイルの内容を確認
   - フォーマット: Bash curl (.sh)
   - エントリー数: 45件 (最初の3件を表示)
   - プレビュー内容が表示される
   ↓
5. 「エクスポート」で確定 or 「キャンセル」で中止
```

**効果**:

- ✅ エクスポート前に内容を確認できる
- ✅ 誤った形式の選択を防止
- ✅ 期待通りの出力が得られることを事前に確認
- ✅ 大量エントリーでも最初の3件で十分な情報を得られる
- ✅ ユーザーの安心感向上

**コード例**:

```tsx
// src/popup/components/ExportDialog.tsx
export function ExportDialog({
  open,
  onOpenChange,
  format,
  entries,
  onConfirm,
}: ExportDialogProps) {
  const [preview, setPreview] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open && entries.length > 0) {
      // 最初の3エントリーでプレビュー生成
      const previewCount = Math.min(3, entries.length);
      const entriesToPreview = entries.slice(0, previewCount);

      const content = generateExportContent(entriesToPreview, format);
      setPreview(content);
    }
  }, [open, format, entries]);

  const previewLines = preview.split('\n');
  const displayedLines = expanded ? previewLines : previewLines.slice(0, 15);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>エクスポートプレビュー</DialogTitle>
          <DialogDescription>
            {formatLabel} • {entries.length}件のエントリー
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px]">
          <pre>{displayedLines.join('\n')}</pre>
        </ScrollArea>

        {hasMoreLines && (
          <Button onClick={() => setExpanded(!expanded)}>
            {expanded ? '一部を表示' : `すべて表示 (${previewLines.length}行)`}
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>エクスポート</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Popup.tsx の改善**:

```tsx
// エクスポート対象エントリーを計算
const entriesToExport = useMemo(() => {
  if (selectedIds.size > 0) {
    // 選択されたエントリーのみ
    return status.entries.filter((entry) => selectedIds.has(entry.id));
  }
  // 全エントリー
  return status.entries;
}, [status.entries, selectedIds]);

// LogActionsに渡す
<LogActions
  entryCount={status.entryCount}
  selectedCount={selectedIds.size}
  entries={entriesToExport}
  onExport={handleExport}
  onClear={handleClear}
/>;
```

**実装時間**: 約40分

---

### 5. ✅ 選択的エクスポート機能 (Issue #40)

**実装日**: 2025-10-18
**実装ファイル**:

- `src/popup/components/LogList.tsx` (改善)
- `src/popup/Popup.tsx` (改善)

**機能概要**:
選択反転ボタンを追加し、エクスポート時の選択操作を改善しました。

**追加機能**:

- 「選択を反転」ボタン
- 選択されたエントリーのみエクスポート可能
- ボタンラベルの動的変更（選択時: "選択をダウンロード (N件)"）

**効果**:

- ✅ 不要なエントリーを除外しやすい
- ✅ 大量エントリーから一部を選択するのが簡単
- ✅ 選択状態が明確に表示される

**実装時間**: 約15分

---

### 6. ✅ 拡張コピー機能 (Issue #43)

**実装日**: 2025-10-18
**実装ファイル**:

- `src/lib/command-generators.ts` (新規作成)
- `src/popup/components/LogEntryActions.tsx` (改善)
- `src/popup/components/LogList.tsx` (改善)
- `src/popup/Popup.tsx` (改善)

**機能概要**:
エントリーのコピー機能を大幅に拡張し、curl/yt-dlpコマンドを直接生成できるようにしました。

**追加されたコピーオプション**:

1. **URLをコピー**（既存機能）
2. **curl コマンドをコピー**（新規）
   - 基本的なcurlコマンド生成
   - シェル安全なエスケープ処理
3. **curl（ヘッダー付き）をコピー**（新規）
   - リクエストヘッダー付きcurlコマンド
   - メソッド（GET/POST等）も含む
4. **yt-dlp コマンドをコピー**（新規）
   - yt-dlpコマンド生成
   - referer/user-agent対応

**UIの変更**:

```
Before:
[📋] [🔗] [⬇️] [ℹ️]

After:
[📋▼] [🔗] [⬇️] [ℹ️] [🗑️]
  ↓ クリックでドロップダウン
  • URLをコピー
  • curl コマンドをコピー
  • curl（ヘッダー付き）をコピー
  ────────────
  • yt-dlp コマンドをコピー
```

**コマンド生成例**:

**基本的なcurl**:

```bash
curl 'https://example.com/video.mp4'
```

**ヘッダー付きcurl**:

```bash
curl 'https://example.com/video.mp4' \
  -H 'Referer: https://example.com/page' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...' \
  -X GET
```

**yt-dlp**:

```bash
yt-dlp 'https://example.com/video' \
  --referer 'https://example.com/page' \
  --user-agent 'Mozilla/5.0...'
```

**実装の工夫**:

1. **シェルインジェクション対策**
   - 単一引用符でエスケープ
   - 引用符内の単一引用符を`'\''`に置換

2. **HTTP/2 疑似ヘッダーのスキップ**
   - `:authority`, `:method`, `:path`, `:scheme`などを除外

3. **条件付きヘッダー出力**
   - referer/user-agentが存在する場合のみ追加

**コード例**:

```typescript
// src/lib/command-generators.ts
export function generateCurlWithHeaders(entry: LogEntry): string {
  const url = escapeShellArg(entry.url);
  let command = `curl ${url}`;

  if (entry.requestHeaders) {
    for (const [name, value] of Object.entries(entry.requestHeaders)) {
      // Skip HTTP/2 pseudo-headers
      if (name.startsWith(':')) continue;

      command += ` \\\n  -H ${escapeShellArg(`${name}: ${value}`)}`;
    }
  }

  if (entry.method && entry.method !== 'GET') {
    command += ` \\\n  -X ${entry.method}`;
  }

  return command;
}

function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}
```

**効果**:

- ✅ ターミナルで即座に再現可能なコマンドを生成
- ✅ デバッグやテストが容易
- ✅ ヘッダー情報を含めた正確な再現
- ✅ yt-dlpユーザーの利便性向上
- ✅ シェルインジェクション攻撃を防止

**実装時間**: 約30分

**削除ボタンについて**:

- UI上に削除ボタンを追加
- 現在は「実装中です」トーストを表示
- バックエンドのdeleteEntry APIが必要（今後実装予定）

---

## 次のステップ

以下のQuick Winsも短時間で実装可能です：

### A. ログのソート機能（30分）

```tsx
// ヘッダークリックでソート
<th onClick={() => setSortBy('timestamp')}>Timestamp {sortBy === 'timestamp' && '↓'}</th>
```

### B. ドメインでグループ化（30分）

```tsx
{
  Object.entries(groupByDomain(entries)).map(([domain, entries]) => (
    <details key={domain}>
      <summary>
        {domain} ({entries.length})
      </summary>
      <EntryList entries={entries} />
    </details>
  ));
}
```

### C. 統計情報の表示（1時間）

```tsx
<Card>
  <CardTitle>Statistics</CardTitle>
  <div>Total: {entries.length}</div>
  <div>By Type:</div>
  <ul>
    <li>Media: {countByType('media')}</li>
    <li>XHR: {countByType('xmlhttprequest')}</li>
  </ul>
</Card>
```

---

## 提案書リンク

詳細な改善提案は以下のドキュメントを参照：

📄 **[USER-EXPERIENCE-IMPROVEMENTS.md](./USER-EXPERIENCE-IMPROVEMENTS.md)**

**優先度別の改善提案**:

- 🔴 **高**: 選択的エクスポート、プレビュー機能など (5項目)
- 🟡 **中**: エクスポート履歴、設定の共有など (5項目)
- 🟢 **低**: ダークモード、多言語対応など (5項目)

**Quick Wins一覧**:

- ✅ ワンクリックコピー（既存実装済み）
- ✅ エントリー数バッジ（2025-10-18実装）
- ✅ エントリーの色分け（2025-10-18実装）
- ✅ 選択的エクスポート（2025-10-18実装 - Issue #40）
- ✅ エクスポートプレビュー（2025-10-18実装 - Issue #41）
- ✅ 拡張コピー機能（2025-10-18実装 - Issue #43）
- ⬜ ログのソート
- ⬜ ドメインでグループ化

---

## まとめ

今回実装したQuick Winsにより、以下の改善が達成されました：

### Phase 1: 基本UI改善 (2025-10-18 午前)

1. **視覚的なフィードバック強化**
   - 色分けによる視認性向上（リソースタイプ別）
   - アイコンによる直感的理解

2. **情報の可視化**
   - バッジによるログ数表示
   - 拡張機能外からの状態確認

3. **再利用可能な基盤**
   - ui-helpers.tsで他の機能でも使える
   - 将来の拡張が容易

**所要時間**: 約30分
**効果**: ユーザー体験の大幅向上

### Phase 2: エクスポート機能強化 (2025-10-18 午後)

4. **選択的エクスポート機能** (Issue #40)
   - 選択反転ボタンの追加
   - 選択状態の可視化
   - 効率的な選択操作

**所要時間**: 約15分
**効果**: 大量ログからの部分エクスポートが容易に

5. **エクスポートプレビュー機能** (Issue #41)
   - エクスポート前の内容確認
   - 誤操作の防止
   - ユーザーの安心感向上

**所要時間**: 約40分
**効果**: エクスポートの確実性と信頼性が向上

### Phase 3: クイックアクション拡張 (2025-10-18 午後)

6. **拡張コピー機能** (Issue #43)
   - curl/yt-dlpコマンド生成
   - ドロップダウンメニューUI
   - シェル安全なエスケープ処理
   - ヘッダー情報の保持

**所要時間**: 約30分
**効果**: 開発者/パワーユーザーの生産性が大幅向上

### 累計実装時間と効果

**合計実装時間**: 約115分（2時間未満）
**実装機能数**: 6機能
**修正ファイル数**: 10ファイル（新規4、既存6）
**投資対効果**: 非常に高い

**ユーザー体験向上の効果**:

- ✅ 視認性が大幅に向上
- ✅ 操作の効率化
- ✅ エラーの防止
- ✅ 安心感の向上
- ✅ 学習コストの低減
- ✅ 開発者ツールとの連携強化（curl/yt-dlp）

---

**次回の改善**: Issue #42以降の高優先度機能を実装予定

- ログのソート機能
- ドメインでグループ化
- 統計情報ダッシュボード
