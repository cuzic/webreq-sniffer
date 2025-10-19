# デザインパターン実装ガイド

**最終更新**: 2025-10-19
**対象**: WebreqSniffer Chrome Extension
**Issue**: #64

このドキュメントは、WebreqSnifferに実装された5つのデザインパターンの詳細ガイドです。

---

## 📋 目次

1. [Factory Pattern](#1-factory-pattern)
2. [Observer Pattern](#2-observer-pattern)
3. [Chain of Responsibility Pattern](#3-chain-of-responsibility-pattern)
4. [Builder Pattern](#4-builder-pattern)
5. [Template Method Pattern](#5-template-method-pattern)
6. [アーキテクチャ概要](#アーキテクチャ概要)
7. [ベストプラクティス](#ベストプラクティス)

---

## 1. Factory Pattern

### 概要

**目的**: エクスポートフォーマットごとのジェネレータを動的に生成する

**問題**:

- 以前は大きなif-elseチェーンで各フォーマットを処理
- Cyclomatic Complexity: 4
- 新しいフォーマット追加時に既存コード修正が必要

**解決策**: Factory Patternでジェネレータの生成を抽象化

### 実装ファイル

```
src/lib/export/
├── generator-factory.ts          # Factoryクラス
└── generators/
    ├── bash-generator.ts          # Bashジェネレータ
    ├── powershell-generator.ts    # PowerShellジェネレータ
    ├── url-generator.ts           # URLジェネレータ
    └── script-generator-template.ts # スクリプトジェネレータ

tests/unit/
└── export-generator-factory.test.ts  # 19テスト
```

### クラス図

```
┌─────────────────────────────┐
│  IExportGenerator           │
│  <<interface>>              │
├─────────────────────────────┤
│ + canHandle(format)         │
│ + generate(entries)         │
└─────────────────────────────┘
         △
         │ implements
         │
    ┌────┴────────────────────────────┐
    │                                  │
┌───▽──────────────┐    ┌──────▽──────────────┐
│ BashGenerator    │    │ PowerShellGenerator │
├──────────────────┤    ├─────────────────────┤
│ + canHandle()    │    │ + canHandle()       │
│ + generate()     │    │ + generate()        │
└──────────────────┘    └─────────────────────┘

┌─────────────────────────────┐
│  ExportGeneratorFactory     │
├─────────────────────────────┤
│ - generators: Generator[]   │
├─────────────────────────────┤
│ + getGenerator(format)      │
│ + registerGenerator(gen)    │
└─────────────────────────────┘
```

### 使用方法

**Before (以前の実装)**:

```typescript
// export-orchestrator.ts (35行、複雑度4)
export async function generateExportContent(
  entries: LogEntry[],
  format: ExportFormat
): Promise<string> {
  if (format === 'bash-batch-download') {
    if (entries.length === 0) throw new Error('...');
    return generateBashBatchDownload(entries[0]);
  }
  if (format === 'powershell-batch-download') {
    // ...
  }
  if (format === 'bash-yt-dlp-cookies') {
    // ...
  }
  const template = getBuiltInTemplate(format);
  if (!template) throw new Error('...');
  return renderTemplate(template.template, entries);
}
```

**After (Factory Pattern適用後)**:

```typescript
// export-orchestrator.ts (4行、複雑度1)
export async function generateExportContent(
  entries: LogEntry[],
  format: ExportFormat
): Promise<string> {
  const factory = new ExportGeneratorFactory();
  const generator = factory.getGenerator(format);
  return await generator.generate(entries);
}
```

**新しいフォーマット追加**:

```typescript
// 1. 新しいジェネレータクラスを作成
export class CustomGenerator implements IExportGenerator {
  canHandle(format: ExportFormat): boolean {
    return format === 'my-custom-format';
  }

  async generate(entries: LogEntry[]): Promise<string> {
    // カスタムロジック
    return result;
  }
}

// 2. Factoryに登録（generator-factory.ts）
constructor() {
  this.generators = [
    new BashGenerator(),
    new PowerShellGenerator(),
    new CustomGenerator(),  // 追加
  ];
}
```

### 効果

- ✅ **コード行数**: 35行 → 4行（89%削減）
- ✅ **Cyclomatic Complexity**: 4 → 1
- ✅ **Open/Closed Principle**: 新規追加時に既存コード修正不要
- ✅ **テスト**: 19テスト追加

---

## 2. Observer Pattern

### 概要

**目的**: 状態変更時のリアルタイム通知

**問題**:

- 以前は1秒ごとのポーリングでUI更新
- CPU/バッテリー消費
- リアルタイム性に欠ける

**解決策**: Observer Patternでイベント駆動アーキテクチャ

### 実装ファイル

```
src/lib/
└── state-change-emitter.ts       # Observerクラス

src/background/
└── index.ts                      # Publisherとして機能

src/popup/hooks/
└── useMonitoring.ts              # Subscriberとして機能

tests/unit/
└── state-change-emitter.test.ts  # 13テスト
```

### シーケンス図

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│  chrome  │         │StateChange   │         │useMonitoring│
│ .storage │         │  Emitter     │         │   Hook      │
└────┬─────┘         └──────┬───────┘         └──────┬──────┘
     │                      │                        │
     │ onChanged            │                        │
     ├─────────────────────>│                        │
     │                      │                        │
     │                      │ emit('logData:changed')│
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │                        │ loadStatus()
     │                      │                        ├──────────┐
     │                      │                        │          │
     │                      │                        │<─────────┘
     │                      │                        │
```

### 使用方法

**Before (ポーリング方式)**:

```typescript
// useMonitoring.ts
useEffect(() => {
  loadStatus();
  const interval = setInterval(loadStatus, 1000); // 1秒ごとにポーリング
  return () => clearInterval(interval);
}, []);
```

**After (Observer Pattern)**:

```typescript
// useMonitoring.ts
import { stateEmitter } from '@/lib/state-change-emitter';

useEffect(() => {
  loadStatus();

  // イベントをサブスクライブ
  const unsubscribe = stateEmitter.subscribe('logData:changed', () => {
    loadStatus();
  });

  return unsubscribe; // クリーンアップ時にアンサブスクライブ
}, []);
```

**Publisher側（Background）**:

```typescript
// background/index.ts
import { stateEmitter } from '@/lib/state-change-emitter';

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.logData) {
    stateEmitter.emit('logData:changed'); // 変更を通知
  }
  if (areaName === 'sync' && changes.settings) {
    stateEmitter.emit('settings:changed');
  }
});
```

### 効果

- ✅ **ポーリング廃止**: 1秒ごとのsetIntervalを削除
- ✅ **リアルタイム更新**: chrome.storage変更時に即座に反映
- ✅ **パフォーマンス**: CPU/バッテリー使用量削減
- ✅ **メモリ管理**: unsubscribe機能でリーク防止
- ✅ **テスト**: 13テスト（1000サブスクライバーのストレステスト含む）

---

## 3. Chain of Responsibility Pattern

### 概要

**目的**: リクエスト処理の責任を複数のハンドラーに分散

**問題**:

- 以前は1つの関数で全処理（監視確認、フィルタリング、ログ記録）
- 74行の大きな関数
- 責任が混在

**解決策**: Chain of Responsibilityで処理を分離

### 実装ファイル

```
src/background/
├── request-handler-chain.ts      # Chainクラス
└── request-processor.ts          # Chainを使用（74行 → 42行）

tests/unit/
└── request-handler-chain.test.ts # 19テスト
```

### クラス図

```
┌─────────────────────────┐
│  RequestHandler         │
│  <<interface>>          │
├─────────────────────────┤
│ + setNext(handler)      │
│ + handle(context)       │
└─────────────────────────┘
         △
         │ implements
         │
    ┌────┴──────────────────────────┐
    │              │                 │
┌───▽────────────┐ │  ┌──────▽──────────┐
│ MonitoringCheck│ │  │ LoggingHandler  │
│ Handler        │ │  │                 │
└────────────────┘ │  └─────────────────┘
                   │
         ┌─────────▽─────────┐
         │ FilteringHandler  │
         └───────────────────┘

   Chain: MonitoringCheck → Filtering → Logging
```

### 処理フロー

```
Request
   │
   v
┌─────────────────────────┐
│MonitoringCheckHandler   │  監視中？
│ • isMonitoring?         │  ├─ NO  → 終了
│ • activeTab check?      │  └─ YES → 次へ
└───────────┬─────────────┘
            v
┌─────────────────────────┐
│FilteringHandler         │  フィルタに一致？
│ • URL pattern match?    │  ├─ NO  → 終了
│ • Resource type match?  │  └─ YES → 次へ
└───────────┬─────────────┘
            v
┌─────────────────────────┐
│LoggingHandler           │  ログに記録
│ • Build log entry       │
│ • Save to storage       │
└─────────────────────────┘
```

### 使用方法

**Before (シーケンシャル処理)**:

```typescript
// request-processor.ts (74行)
async processRequest(details, headers?, pageMetadata?) {
  try {
    // 1. 監視チェック
    if (!(await this.shouldMonitor(details))) {
      return;
    }

    // 2. フィルタリング
    const settings = await this.stateManager.getSettings();
    if (!shouldLogRequest(details.url, details.type, settings)) {
      return;
    }

    // 3. ログ記録
    await this.logger.logRequest(details, headers, pageMetadata);
  } catch (error) {
    Logger.error('request-processor', error);
  }
}
```

**After (Chain of Responsibility)**:

```typescript
// request-processor.ts (42行)
export class RequestProcessor {
  private chain: RequestHandlerChain;

  constructor(stateManager: StateManager, logger: RequestLogger) {
    this.chain = new RequestHandlerChain(stateManager, logger);
  }

  async processRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[],
    pageMetadata?: PageMetadata
  ): Promise<void> {
    await this.chain.handle({ details, headers, pageMetadata });
  }
}
```

**新しいハンドラー追加**:

```typescript
// 1. 新しいハンドラークラス作成
class CustomHandler extends BaseHandler {
  async handle(context: RequestContext): Promise<void> {
    // カスタムチェック
    if (customCondition) {
      await this.callNext(context);
    }
  }
}

// 2. チェーンに挿入
monitoringCheck.setNext(customHandler).setNext(filtering).setNext(logging);
```

### 効果

- ✅ **コード行数**: 74行 → 42行（43%削減）
- ✅ **単一責任原則**: 各ハンドラーが1つの責任のみ
- ✅ **柔軟性**: ハンドラーの追加/削除/並び替えが容易
- ✅ **テスト**: 19テスト（個別ハンドラーとチェーン統合）

---

## 4. Builder Pattern

### 概要

**目的**: 複雑な`LogEntry`オブジェクトの構築を簡潔に

**問題**:

- 以前は手動でプロパティを設定
- バリデーションロジックが散在
- オプショナルフィールドの追加が煩雑

**解決策**: Builder Patternでfluent APIを提供

### 実装ファイル

```
src/background/
├── log-entry-builder.ts          # Builderクラス
└── logging.ts                    # Builder使用（77行 → 48行）

tests/unit/
└── log-entry-builder.test.ts     # 25テスト
```

### クラス図

```
┌─────────────────────────────┐
│  LogEntryBuilder            │
├─────────────────────────────┤
│ - details: WebRequest       │
│ - headers: HttpHeader[]     │
│ - pageMetadata: PageMeta    │
├─────────────────────────────┤
│ + fromWebRequest(details)   │  ← Fluent API
│ + withHeaders(headers)      │  ← Fluent API
│ + withPageMetadata(meta)    │  ← Fluent API
│ + build(): LogEntry         │
│ + reset(): this             │
├─────────────────────────────┤
│ + static fromRequest(...)   │  ← Static Factory
└─────────────────────────────┘
```

### 使用方法

**Before (手動構築)**:

```typescript
// logging.ts (77行)
export function createLogEntry(details, headers?, pageMetadata?): LogEntry {
  // 1. ヘッダーマップ作成
  const headerMap: Record<string, string> = {};
  if (headers) {
    for (const header of headers) {
      if (header.name && header.value) {
        headerMap[header.name] = header.value;
      }
    }
  }

  // 2. DedupeKey生成
  const dedupeKey = generateDedupeKey(details.url, headerMap);

  // 3. LogEntry構築（20+行の手動プロパティ設定）
  return {
    id: generateId(),
    requestId: details.requestId,
    url: details.url,
    method: details.method,
    type: details.type,
    tabId: details.tabId,
    frameId: details.frameId,
    timestamp: details.timeStamp,
    initiator: details.initiator,
    headers: Object.keys(headerMap).length > 0 ? headerMap : undefined,
    dedupeKey,
    pageMetadata,
  };
}
```

**After (Builder Pattern)**:

```typescript
// logging.ts (48行)
export function createLogEntry(details, headers?, pageMetadata?): LogEntry {
  return LogEntryBuilder.fromRequest(details, headers, pageMetadata).build();
}
```

**詳細な使用例**:

```typescript
// Method 1: Static Factory (推奨)
const entry = LogEntryBuilder.fromRequest(details, headers, pageMetadata).build();

// Method 2: Fluent API
const entry = new LogEntryBuilder()
  .fromWebRequest(details)
  .withHeaders(headers)
  .withPageMetadata(pageMetadata)
  .build();

// Method 3: オプショナルフィールドの部分指定
const entry = new LogEntryBuilder()
  .fromWebRequest(details)
  .withHeaders(headers) // pageMetadataはスキップ
  .build();

// Builder再利用
const builder = new LogEntryBuilder();
const entry1 = builder.fromWebRequest(details1).build();
builder.reset();
const entry2 = builder.fromWebRequest(details2).build();
```

### バリデーション

```typescript
// build()メソッド内で自動バリデーション
build(): LogEntry {
  // 必須フィールドチェック
  if (!this.details) {
    throw new Error('Web request details are required');
  }

  // WebRequest必須フィールド検証
  if (!this.details.requestId || !this.details.url ||
      !this.details.method || !this.details.type) {
    throw new Error('Web request details are missing required fields');
  }

  // LogEntry構築
  return { /* ... */ };
}
```

### 効果

- ✅ **コード行数**: 77行 → 48行（38%削減）
- ✅ **可読性**: Fluent APIで読みやすいコード
- ✅ **バリデーション**: build時に自動検証
- ✅ **再利用**: reset()でBuilder再利用可能
- ✅ **テスト**: 25テスト（バリデーション、ヘッダー処理、DedupeKey等）

---

## 5. Template Method Pattern

### 概要

**目的**: スクリプト生成アルゴリズムの骨格を定義し、サブクラスで詳細を実装

**問題**:

- 各スクリプトジェネレータで重複コード
- ヘッダー/フッター/エントリー処理が混在
- 新しいスクリプト形式追加時に多くのコード重複

**解決策**: Template Method Patternでアルゴリズム骨格を共有

### 実装ファイル

```
src/lib/export/generators/
└── script-generator-template.ts  # Template + 具象クラス

tests/unit/
└── script-generator-template.test.ts  # 23テスト
```

### クラス図

```
┌─────────────────────────────────┐
│  ScriptGenerator (Abstract)     │
├─────────────────────────────────┤
│ # abstract generateHeader()     │  ← 抽象メソッド
│ # abstract processEntry()       │  ← 抽象メソッド
│ # generateFooter(): string[]    │  ← フック
│ # beforeGenerate(entries): void │  ← フック
│ # afterGenerate(result): void   │  ← フック
│ # joinLines(lines): string      │  ← 共通メソッド
├─────────────────────────────────┤
│ + generate(entries): string     │  ← テンプレートメソッド
└─────────────────────────────────┘
         △
         │ extends
         │
    ┌────┴──────────────────────────┐
    │              │                 │
┌───▽────────────┐ │  ┌──────▽──────────────┐
│ BashCurl       │ │  │ PowerShell          │
│ Generator      │ │  │ Generator           │
└────────────────┘ │  └─────────────────────┘
                   │
         ┌─────────▽─────────┐
         │ BashYtDlp         │
         │ Generator         │
         └───────────────────┘
```

### テンプレートメソッドアルゴリズム

```typescript
// ScriptGenerator.generate() - テンプレートメソッド
generate(entries: LogEntry[]): string {
  // 1. Hook: 生成前処理
  this.beforeGenerate(entries);

  const lines: string[] = [];

  // 2. Step: ヘッダー生成（抽象メソッド）
  lines.push(...this.generateHeader());

  // 3. Step: 各エントリー処理（抽象メソッド）
  for (let i = 0; i < entries.length; i++) {
    if (entries[i]) {
      lines.push(...this.processEntry(entries[i], i));
    }
  }

  // 4. Hook: フッター生成（オプション）
  lines.push(...this.generateFooter());

  // 5. Step: 行の結合（共通メソッド）
  const result = this.joinLines(lines);

  // 6. Hook: 生成後処理
  this.afterGenerate(result);

  return result;
}
```

### 使用方法

**具象クラスの実装例**:

```typescript
// BashCurlScriptGenerator
export class BashCurlScriptGenerator extends ScriptGenerator {
  constructor(options = { includeHeaders: false }) {
    super();
    this.options = options;
  }

  // 抽象メソッドの実装
  protected generateHeader(): string[] {
    return ['#!/bin/bash', '# Generated by WebreqSniffer', ''];
  }

  // 抽象メソッドの実装
  protected processEntry(entry: LogEntry): string[] {
    const url = escapeShellArg(entry.url);
    let command = 'curl -L';

    if (this.options.includeHeaders && entry.headers) {
      command += this.formatHeadersForCurl(entry.headers);
    }

    command += ` ${url}`;
    return [command];
  }

  // プライベートヘルパーメソッド
  private formatHeadersForCurl(headers: LogHeaders): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(headers)) {
      const headerValue = escapeShellArg(`${key}: ${value}`);
      parts.push(` -H ${headerValue}`);
    }
    return parts.join('');
  }
}
```

**新しいスクリプトジェネレータの追加**:

```typescript
// Custom Script Generator
export class CustomScriptGenerator extends ScriptGenerator {
  protected generateHeader(): string[] {
    return ['# My Custom Script', ''];
  }

  protected processEntry(entry: LogEntry, index: number): string[] {
    return [`# Entry ${index + 1}: ${entry.url}`];
  }

  // オプション: フッターを追加
  protected generateFooter(): string[] {
    return ['', '# End of script'];
  }

  // オプション: 生成前処理
  protected beforeGenerate(entries: LogEntry[]): void {
    console.log(`Generating script for ${entries.length} entries`);
  }
}
```

### 効果

- ✅ **コード再利用**: ヘッダー/フッター/結合ロジックを共有
- ✅ **一貫性**: すべてのジェネレータが同じアルゴリズム構造
- ✅ **拡張性**: 新しいジェネレータの追加が容易（2メソッドの実装のみ）
- ✅ **フック機能**: beforeGenerate/afterGenerateで柔軟なカスタマイズ
- ✅ **テスト**: 23テスト（基底クラス、具象クラス、カスタマイズ、後方互換性）

---

## アーキテクチャ概要

### システム全体のデザインパターン配置

```
┌─────────────────────────────────────────────────────────┐
│                     Popup UI (React)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  useMonitoring Hook                               │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Observer Pattern                          │  │  │
│  │  │  • Subscribe to 'logData:changed'         │  │  │
│  │  │  • Subscribe to 'settings:changed'        │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ chrome.storage
┌────────────────────────▼────────────────────────────────┐
│              Background Service Worker                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  StateChangeEmitter (Observer)                    │  │
│  │  • emit('logData:changed')                       │  │
│  │  • emit('settings:changed')                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  RequestProcessor                                 │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Chain of Responsibility                   │  │  │
│  │  │  MonitoringCheck → Filtering → Logging    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LogEntryBuilder (Builder)                        │  │
│  │  • fromWebRequest().withHeaders().build()        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Export System                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ExportGeneratorFactory (Factory)                 │  │
│  │  • getGenerator(format)                          │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Template Method                           │  │  │
│  │  │  ScriptGenerator                           │  │  │
│  │  │  • BashCurlScriptGenerator                │  │  │
│  │  │  • BashYtDlpScriptGenerator               │  │  │
│  │  │  • PowerShellScriptGenerator              │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### パターン間の協調動作

1. **リクエスト処理フロー**:

   ```
   WebRequest
      ↓
   Chain of Responsibility (監視チェック → フィルタリング → ログ記録)
      ↓
   Builder Pattern (LogEntry構築)
      ↓
   chrome.storage保存
      ↓
   Observer Pattern (変更通知)
      ↓
   UI更新
   ```

2. **エクスポートフロー**:
   ```
   ユーザーがエクスポート実行
      ↓
   Factory Pattern (フォーマットに応じたジェネレータ取得)
      ↓
   Template Method Pattern (スクリプト生成)
      ↓
   ファイルダウンロード
   ```

---

## ベストプラクティス

### 1. パターン選択のガイドライン

**Factory Pattern を使用するケース**:

- オブジェクト生成ロジックが複雑
- 生成するクラスが実行時に決まる
- 複数の類似クラスから選択する必要がある

**Observer Pattern を使用するケース**:

- 状態変更を複数のコンポーネントに通知
- イベント駆動アーキテクチャ
- リアルタイム更新が必要

**Chain of Responsibility を使用するケース**:

- 複数のステップで処理が必要
- 各ステップの責任を分離したい
- 処理の順序を柔軟に変更したい

**Builder Pattern を使用するケース**:

- オブジェクト構築が複雑（多数のパラメータ）
- オプショナルなフィールドが多い
- バリデーションが必要

**Template Method Pattern を使用するケース**:

- アルゴリズムの骨格は共通
- 詳細な実装をサブクラスで変更
- コードの重複を減らしたい

### 2. テスト戦略

各パターンに対するテストアプローチ:

**Factory Pattern**:

```typescript
// テストすべき項目
✓ 正しいジェネレータが返される
✓ 未知のフォーマットでエラー
✓ すべてのフォーマットに対応するジェネレータが存在
✓ Open/Closed Principle（新規追加時に既存テスト変更不要）
```

**Observer Pattern**:

```typescript
// テストすべき項目
✓ サブスクライブ/アンサブスクライブ
✓ イベント発行時にリスナー呼び出し
✓ 複数リスナー対応
✓ メモリリーク防止（unsubscribe）
✓ パフォーマンス（1000+サブスクライバー）
```

**Chain of Responsibility**:

```typescript
// テストすべき項目
✓ 各ハンドラーの個別動作
✓ チェーン全体の統合テスト
✓ 途中で停止する場合
✓ すべて通過する場合
✓ エラーハンドリング
```

**Builder Pattern**:

```typescript
// テストすべき項目
✓ 必須フィールドのバリデーション
✓ オプショナルフィールドの処理
✓ Fluent APIのチェーン
✓ reset()での再利用
✓ エッジケース（空ヘッダー、長いURL等）
```

**Template Method Pattern**:

```typescript
// テストすべき項目
✓ テンプレートメソッドの実行順序
✓ 抽象メソッドの実装
✓ フックメソッドの呼び出し
✓ 具象クラスの出力検証
✓ 後方互換性
```

### 3. コード品質チェックリスト

デザインパターン実装時の確認事項:

- [ ] **SOLID原則**の遵守
  - [ ] Single Responsibility: 各クラス/メソッドは1つの責任のみ
  - [ ] Open/Closed: 拡張に開き、修正に閉じている
  - [ ] Liskov Substitution: サブクラスは基底クラスの代替可能
  - [ ] Interface Segregation: 不要なメソッドを持たない小さなインターフェース
  - [ ] Dependency Inversion: 抽象に依存、具象に依存しない

- [ ] **テスト**
  - [ ] ユニットテスト（各クラス/メソッド）
  - [ ] インテグレーションテスト（パターン間の協調）
  - [ ] エッジケースのテスト

- [ ] **ドキュメント**
  - [ ] JSDocコメント
  - [ ] 使用例
  - [ ] アーキテクチャ図

- [ ] **パフォーマンス**
  - [ ] メモリリークなし
  - [ ] 不要なオブジェクト生成なし
  - [ ] 適切なキャッシング

### 4. よくある落とし穴と対策

**Factory Pattern**:

- ❌ Factory内に複雑なロジック → ⭕ ジェネレータクラスに移動
- ❌ Factoryのシングルトン化 → ⭕ 必要に応じてインスタンス化

**Observer Pattern**:

- ❌ unsubscribeし忘れ → ⭕ useEffect cleanup関数で必ずunsubscribe
- ❌ 無限ループ（emit内でsubscribe） → ⭕ 依存関係を明確化

**Chain of Responsibility**:

- ❌ チェーンが複雑すぎる → ⭕ ハンドラーは3-5個程度に
- ❌ エラー時の処理漏れ → ⭕ 各ハンドラーでtry-catch

**Builder Pattern**:

- ❌ バリデーション漏れ → ⭕ build()で必ず検証
- ❌ 不変性の欠如 → ⭕ built後は変更不可にする

**Template Method Pattern**:

- ❌ テンプレートメソッドのオーバーライド → ⭕ finalにする（TypeScriptでは文書化）
- ❌ フックメソッドの多用 → ⭕ 必要最小限のフックのみ

---

## まとめ

WebreqSnifferに実装された5つのデザインパターンにより、以下を達成しました:

✅ **コード品質**: SOLID原則の適用、読みやすく保守しやすいコード
✅ **テストカバレッジ**: +99テスト、すべて合格
✅ **パフォーマンス**: ポーリング廃止、Cyclomatic Complexity削減
✅ **拡張性**: 新機能追加が容易、Open/Closed Principleの適用
✅ **保守性**: 責任の分離、コード行数削減（-330行以上）

**次のステップ**:

1. 継続的なリファクタリング
2. パフォーマンス最適化（React.memo等）
3. テストカバレッジの向上
4. ユーザーフィードバックに基づく改善

---

**最終更新日**: 2025-10-19
**ステータス**: 全5パターン実装完了 ✅
