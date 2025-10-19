# Content Security Policy (CSP) 違反の修正

## 問題の概要

エクスポート機能を使用した際に、以下のCSPエラーが発生する：

```
Failed to export logs: Error: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*".
```

## 原因

**ファイル**: `src/lib/template.ts:194`

```typescript
compiled = Handlebars.compile(template);
```

Handlebars.js は、テンプレートをコンパイルする際に `new Function()` を使用して動的にJavaScript関数を生成します。これはChrome拡張のContent Security Policy (CSP) で禁止されています。

### CSPとは

Chrome拡張（Manifest V3）では、セキュリティ上の理由から以下が禁止されています：

- `eval()`
- `new Function()`
- `setTimeout(string)` / `setInterval(string)`
- インラインイベントハンドラ

参考: [Chrome Extensions - Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#content-security-policy)

## 影響範囲

### 影響を受ける機能

1. **エクスポート機能**: 全てのエクスポートフォーマット
   - Bash batch download
   - yt-dlp batch
   - wget batch
   - aria2 batch
   - curl command
   - JSON export
   - カスタムテンプレート

2. **プレビュー機能**: オプションページでのテンプレートプレビュー

### 使用箇所

- `src/lib/template.ts` - Handlebarsテンプレートエンジン
- `src/lib/builtinTemplates.ts` - 組み込みテンプレート
- `src/lib/export/generator-factory.ts` - エクスポートジェネレーター
- `src/options/components/TemplatePreview.tsx` - プレビューコンポーネント

## 解決策

### 選択肢1: CSP準拠のテンプレートエンジンに移行（推奨）

**mustache.js** などのCSP準拠のテンプレートエンジンに移行する。

#### メリット

- ✅ CSPに準拠（`new Function()` を使用しない）
- ✅ Handlebarsと構文が類似（移行が比較的容易）
- ✅ 軽量（~3KB gzipped）
- ✅ 実績が豊富

#### デメリット

- ⚠️ Handlebarsのヘルパー機能を再実装する必要がある
- ⚠️ 既存テンプレートの書き換えが必要（一部）

#### 実装タスク

- [ ] mustache.js をインストール
- [ ] Handlebarsヘルパーをmustache互換のフィルターに移行
- [ ] テンプレート構文を変換
- [ ] 既存のテストを更新
- [ ] 新しいテストを追加

---

### 選択肢2: 事前コンパイル

ビルド時にHandlebarsテンプレートを事前コンパイルする。

#### メリット

- ✅ 既存のHandlebarsテンプレートをそのまま使用可能
- ✅ ランタイムパフォーマンスの向上

#### デメリット

- ❌ ユーザー定義のカスタムテンプレートに対応できない
- ❌ ビルドプロセスが複雑化

#### 実装タスク

- [ ] Vite plugin for Handlebars precompilation
- [ ] ビルド時コンパイルスクリプト
- [ ] 動的テンプレート対応の別エンジン

---

### 選択肢3: 独自テンプレートエンジンの拡張（最も安全）

既存の `pipeline-template-engine.ts` を拡張して、Handlebarsの機能を再現する。

#### メリット

- ✅ CSPに完全準拠（文字列操作のみ）
- ✅ 既に実装済みの基盤を活用
- ✅ 外部依存を増やさない
- ✅ フルコントロール

#### デメリット

- ⚠️ Handlebarsの全機能を再実装するには時間がかかる
- ⚠️ メンテナンスコストが増加

#### 実装タスク

- [ ] pipeline-template-engineにループ機能を追加
- [ ] 条件分岐機能を追加
- [ ] ヘルパー関数の実装
- [ ] Handlebarsテンプレートを新構文に変換
- [ ] 既存テストの更新

---

## 推奨アプローチ

**選択肢1: mustache.js への移行**

### 理由

1. **CSP準拠**: Chrome拡張で安全に動作
2. **実績**: 多くのプロジェクトで使用されている
3. **学習コスト**: Handlebarsと構文が似ている
4. **メンテナンス**: 外部ライブラリとして保守される

### 移行計画

#### Phase 1: 基盤整備

1. mustache.js のインストール
2. ラッパー関数の作成（`src/lib/mustache-template.ts`）
3. ヘルパー関数の実装（Handlebarsヘルパーをmustacheフィルターに変換）

#### Phase 2: テンプレート移行

1. 組み込みテンプレートの変換
2. カスタムテンプレートの構文ガイド作成
3. バリデーション機能の更新

#### Phase 3: テスト & 統合

1. ユニットテストの更新
2. E2Eテストの実行
3. 互換性チェック

#### Phase 4: クリーンアップ

1. Handlebars依存の削除
2. 古いコードの削除
3. ドキュメント更新

---

## 実装詳細

### mustache.js テンプレート構文

#### 変数展開

```handlebars
<!-- Handlebars -->
{{url}}

<!-- Mustache (同じ) -->
{{url}}
```

#### ループ

```handlebars
<!-- Handlebars -->
{{#each entries}}
  {{url}}
{{/each}}

<!-- Mustache (同じ) -->
{{#entries}}
  {{url}}
{{/entries}}
```

#### ヘルパー関数の代替

Handlebarsヘルパーはmustacheの「ラムダ」機能で実装：

```typescript
// Handlebars helper
Handlebars.registerHelper('upper', (str) => str.toUpperCase());

// Mustache lambda
const data = {
  entries: [...],
  upper: () => (text, render) => render(text).toUpperCase()
};
```

---

## テンプレート変換例

### Before (Handlebars)

```handlebars
#!/bin/bash

# Exported from WebreqSniffer
# Date: {{exportDate}}
# Total entries: {{totalEntries}}

{{#each entries}}
# Entry {{index1}}: {{filename}}
wget "{{url}}" \
  {{#if requestHeaders.referer}}--referer "{{requestHeaders.referer}}" \{{/if}}
  -O "{{formatDate timestamp 'YYYY-MM-DD'}}_{{filename}}"
{{/each}}
```

### After (Mustache)

```mustache
#!/bin/bash

# Exported from WebreqSniffer
# Date: {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
# Entry {{index1}}: {{filename}}
wget "{{url}}" \
  {{#referer}}--referer "{{.}}" \{{/referer}}
  -O "{{formattedDate}}_{{filename}}"
{{/entries}}
```

**注意**: データを事前処理して、mustacheテンプレートに渡す前に整形する。

---

## データ変換レイヤー

mustacheに渡す前に、データを変換する：

```typescript
import Mustache from 'mustache';

function enrichForMustache(entries: LogEntry[]): MustacheData {
  return {
    entries: entries.map((entry, index) => ({
      ...entry,
      index1: index + 1,
      formattedDate: formatDate(entry.timestamp, 'YYYY-MM-DD'),
      referer: entry.requestHeaders?.referer || entry.requestHeaders?.Referer,
      // その他のヘルパー処理をここで実行
    })),
    totalEntries: entries.length,
    exportDate: new Date().toLocaleString('ja-JP'),
    domain: getMostCommonDomain(entries),
  };
}

export function renderTemplate(template: string, entries: LogEntry[]): string {
  const data = enrichForMustache(entries);
  return Mustache.render(template, data);
}
```

---

## セキュリティ考慮事項

### XSS対策

Mustacheはデフォルトでエスケープを行います：

- `{{variable}}` - HTMLエスケープされる
- `{{{variable}}}` - エスケープなし（注意が必要）

拡張機能では主にシェルスクリプトを生成するため、HTMLエスケープは不要ですが、
XSSリスクを避けるために適切なエスケープを実装する必要があります。

---

## 移行チェックリスト

### コード変更

- [ ] mustache.js のインストール (`npm install mustache`)
- [ ] 型定義のインストール (`npm install --save-dev @types/mustache`)
- [ ] `src/lib/mustache-template.ts` の作成
- [ ] データ変換関数の実装
- [ ] `src/lib/template.ts` の置き換え
- [ ] 組み込みテンプレートの更新 (`src/lib/builtinTemplates.ts`)

### テスト

- [ ] `tests/unit/template.test.ts` の更新
- [ ] 新しいエッジケースのテスト追加
- [ ] エクスポート機能のE2Eテスト

### ドキュメント

- [ ] テンプレート構文ガイドの更新
- [ ] カスタムテンプレート作成ガイド
- [ ] 移行ガイド（既存ユーザー向け）

### クリーンアップ

- [ ] Handlebars依存の削除 (`npm uninstall handlebars @types/handlebars`)
- [ ] 未使用コードの削除
- [ ] コードレビュー

---

## 参考リンク

- [Mustache.js 公式ドキュメント](https://github.com/janl/mustache.js)
- [Mustache Manual](https://mustache.github.io/mustache.5.html)
- [Chrome Extensions - CSP](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#content-security-policy)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

## 期待される成果

- ✅ すべてのエクスポート機能が動作する
- ✅ CSP違反エラーが解消される
- ✅ Chrome Web Store審査を通過できる
- ✅ パフォーマンスの向上（事前処理により）
- ✅ セキュリティの向上

---

## タイムライン

- **Week 1**: mustache.js統合 + データ変換レイヤー
- **Week 2**: 組み込みテンプレート移行 + テスト
- **Week 3**: ドキュメント + クリーンアップ
- **Week 4**: E2Eテスト + リリース準備

---

## 注意事項

### 下位互換性

既存のカスタムテンプレートを使用しているユーザーに対して：

1. 移行ガイドを提供
2. テンプレート変換ツールを提供（オプション）
3. バージョンアップ時に警告を表示

### フォールバック

移行期間中は、両方のエンジンをサポートすることも検討：

- 新しいテンプレートは mustache
- 古いテンプレートは読み取り専用で表示（変換を促す）
