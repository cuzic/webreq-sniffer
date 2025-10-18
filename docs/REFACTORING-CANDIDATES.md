# リファクタリング候補

**作成日**: 2025-10-18
**対象**: WebreqSniffer Chrome Extension

このドキュメントは、コードベースの品質向上のための具体的なリファクタリング候補をまとめています。

---

## 🔥 高優先度

### 1. Popup.tsxの分割（カスタムフック化）

**現状の問題**:

- Popup.tsx が398行と大きい
- 16個のハンドラー関数が1つのコンポーネントに集中
- 状態管理とビジネスロジックが混在

**提案**:
カスタムフックに分離して責務を明確化

#### 分割案

**useLogActions.ts** - ログアクション関連

```typescript
export function useLogActions() {
  const [loading, setLoading] = useState(false);

  async function handleExport(format: ExportFormat, selectedIds?: Set<string>) {
    // ... 既存のhandleExport実装
  }

  async function handleClear() {
    // ... 既存のhandleClear実装
  }

  return { loading, handleExport, handleClear };
}
```

**useEntryActions.ts** - エントリー別アクション

```typescript
export function useEntryActions() {
  async function handleCopyUrl(entry: LogEntry) {
    // ... 既存実装
  }

  async function handleCopyCurl(entry: LogEntry) {
    // ... 既存実装
  }

  async function handleCopyCurlWithHeaders(entry: LogEntry) {
    // ... 既存実装
  }

  async function handleCopyYtDlp(entry: LogEntry) {
    // ... 既存実装
  }

  async function handleDelete(entry: LogEntry) {
    // ... 既存実装
  }

  function handleOpenInTab(entry: LogEntry) {
    // ... 既存実装
  }

  async function handleExportSingle(entry: LogEntry) {
    // ... 既存実装
  }

  function handleShowDetails(entry: LogEntry) {
    // ... 既存実装
  }

  return {
    handleCopyUrl,
    handleCopyCurl,
    handleCopyCurlWithHeaders,
    handleCopyYtDlp,
    handleDelete,
    handleOpenInTab,
    handleExportSingle,
    handleShowDetails,
  };
}
```

**useSelection.ts** - 選択状態管理

```typescript
export function useSelection(entries: LogEntry[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function handleToggle(id: string) {
    // ... 既存実装
  }

  function handleSelectAll() {
    // ... 既存実装
  }

  function handleClearAll() {
    // ... 既存実装
  }

  function handleInvertSelection() {
    // ... 既存実装
  }

  return {
    selectedIds,
    handleToggle,
    handleSelectAll,
    handleClearAll,
    handleInvertSelection,
  };
}
```

**useMonitoring.ts** - 監視制御

```typescript
export function useMonitoring() {
  const [status, setStatus] = useState<Status>({
    isMonitoring: false,
    monitoringScope: 'activeTab',
    entryCount: 0,
    entries: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    // ... 既存実装
  }

  async function handleStartStop() {
    // ... 既存実装
  }

  async function handleScopeChange(checked: boolean) {
    // ... 既存実装
  }

  return {
    status,
    loading,
    handleStartStop,
    handleScopeChange,
  };
}
```

**効果**:

- ✅ コンポーネントが簡潔に（398行 → 約150行）
- ✅ 関心の分離（UI / ビジネスロジック）
- ✅ テストが容易
- ✅ 再利用性の向上

**実装難易度**: ⭐⭐⭐☆☆（中）
**所要時間**: 約2時間

---

### 2. LogList/LogEntryActionsのprops過多 ✅ **完了**

**現状の問題**:

- LogListPropsに14個のプロパティ
- LogEntryActionsPropsに11個のプロパティ
- propsドリリング（prop drilling）が発生

**提案**:
アクションを1つのオブジェクトにまとめる

#### リファクタリング案

**types/actions.ts** (新規作成)

```typescript
export interface EntryActions {
  onCopyUrl: (entry: LogEntry) => void;
  onOpenInTab: (entry: LogEntry) => void;
  onExport: (entry: LogEntry) => void;
  onShowDetails: (entry: LogEntry) => void;
  onDelete?: (entry: LogEntry) => void;
  onCopyCurl?: (entry: LogEntry) => void;
  onCopyCurlWithHeaders?: (entry: LogEntry) => void;
  onCopyYtDlp?: (entry: LogEntry) => void;
}

export interface SelectionActions {
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onInvertSelection: () => void;
}
```

**Before**:

```typescript
<LogList
  entries={filteredEntries}
  selectedIds={selectedIds}
  onToggle={handleToggle}
  onSelectAll={handleSelectAll}
  onClearAll={handleClearAll}
  onInvertSelection={handleInvertSelection}
  onCopyUrl={handleCopyUrl}
  onOpenInTab={handleOpenInTab}
  onExport={handleExportSingle}
  onShowDetails={handleShowDetails}
  onDelete={handleDelete}
  onCopyCurl={handleCopyCurl}
  onCopyCurlWithHeaders={handleCopyCurlWithHeaders}
  onCopyYtDlp={handleCopyYtDlp}
/>
```

**After**:

```typescript
<LogList
  entries={filteredEntries}
  selection={{ selectedIds, ...selectionActions }}
  entryActions={entryActions}
/>
```

**効果**:

- ✅ propsの数が3個に削減（14個 → 3個）
- ✅ 可読性の向上
- ✅ 型安全性の維持

**実装難易度**: ⭐⭐☆☆☆（簡単）
**所要時間**: 約30分

**実装完了 (2025-10-18)**:

- ✅ `/src/types/actions.ts` を作成
  - `EntryActions` インターフェース（エントリー別アクション）
  - `SelectionActions` インターフェース（選択アクション）
- ✅ `/src/types/index.ts` にエクスポート追加
- ✅ `LogEntryActions.tsx` を更新
  - props: 9個 → 2個（entry + actions）
- ✅ `LogList.tsx` を更新
  - props: 14個 → 4個（entries + selectedIds + selectionActions + entryActions）
  - `LogEntryItem` のprops削減
- ✅ `Popup.tsx` を更新
  - アクションをグループ化してオブジェクトで渡す
- ✅ ビルド成功確認済み

---

### 3. 定数の一元管理 ✅ **完了**

**現状の問題**:

- マジックナンバーが散在
- 設定値がハードコード
- 変更時に複数ファイルを修正

**問題箇所の例**:

```typescript
// Popup.tsx
const interval = setInterval(loadStatus, 1000); // 1000msがハードコード

// ExportDialog.tsx
const previewCount = Math.min(3, entries.length); // 3がハードコード
const displayedLines = expanded ? previewLines : previewLines.slice(0, 15); // 15がハードコード

// badge.ts
if (entryCount >= 10000) {
  // 10000がハードコード
  badgeText = Math.floor(entryCount / 1000) + 'k';
} else if (entryCount >= 1000) {
  // 1000がハードコード
  badgeText = (entryCount / 1000).toFixed(1) + 'k';
}
```

**提案**:
定数ファイルを作成して一元管理

**lib/constants.ts** (新規作成)

```typescript
/**
 * Application Constants
 */

// UI Refresh Intervals
export const REFRESH_INTERVALS = {
  STATUS_POLLING: 1000, // 1秒ごとにステータス更新
  LOG_UPDATE: 500, // ログ更新間隔
} as const;

// Export Preview Settings
export const EXPORT_PREVIEW = {
  ENTRY_COUNT: 3, // プレビューに表示するエントリー数
  LINE_LIMIT: 15, // 折りたたみ時の行数
} as const;

// Badge Display Settings
export const BADGE = {
  THRESHOLD_K: 1000, // k表示の閾値
  THRESHOLD_10K: 10000, // 10k以上の閾値
  COLOR_MONITORING: '#4CAF50', // 監視中の色
  COLOR_STOPPED: '#757575', // 停止中の色
} as const;

// UI Dimensions
export const UI = {
  POPUP_WIDTH: 400, // ポップアップの幅（px）
  LOG_LIST_HEIGHT: 300, // ログリスト の高さ（px）
} as const;

// Filtering
export const FILTERS = {
  ALL: 'all',
  MEDIA: 'media',
  XHR: 'xmlhttprequest',
  SCRIPT: 'script',
  STYLESHEET: 'stylesheet',
  IMAGE: 'image',
  FONT: 'font',
  DOCUMENT: 'document',
  OTHER: 'other',
} as const;

// Type Guards
export function isFilterType(value: string): value is keyof typeof FILTERS {
  return Object.values(FILTERS).includes(value as any);
}
```

**使用例**:

```typescript
// Before
const interval = setInterval(loadStatus, 1000);

// After
import { REFRESH_INTERVALS } from '@/lib/constants';
const interval = setInterval(loadStatus, REFRESH_INTERVALS.STATUS_POLLING);
```

**効果**:

- ✅ 設定値の変更が容易
- ✅ マジックナンバーの排除
- ✅ 保守性の向上
- ✅ 型安全性の向上（as const）

**実装難易度**: ⭐☆☆☆☆（非常に簡単）
**所要時間**: 約1時間

**実装完了 (2025-10-18)**:

- ✅ `/src/lib/constants.ts` を作成
- ✅ `REFRESH_INTERVALS` - UI更新間隔（Popup.tsxで使用）
- ✅ `EXPORT_PREVIEW` - プレビュー設定（ExportDialog.tsxで使用）
- ✅ `MONITORING` - 監視設定（badge.tsで使用）
- ✅ `BADGE` - バッジ表示設定（badge.tsで使用）
- ✅ `UI` - UI寸法設定
- ✅ `STORAGE` - ストレージ設定（schemas.tsで使用）
- ✅ `EXPORT` - エクスポート設定（schemas.tsで使用）
- ✅ `FILTERING` - フィルタリングパターン（filtering.tsで使用）
- ✅ ビルド成功確認済み

---

## ⭐ 中優先度

### 4. エラーハンドリングの統一 ✅ **完了**

**現状の問題**:

- try-catchが各所に散在
- エラーメッセージが統一されていない
- エラーログの形式が不統一

**提案**:
エラーハンドリングユーティリティを作成

**lib/error-handling.ts** (新規作成)

```typescript
/**
 * Error Handling Utilities
 */

import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, userMessage?: string): void {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    toast.error(userMessage || error.message);
  } else if (error instanceof Error) {
    toast.error(userMessage || 'エラーが発生しました');
  } else {
    toast.error('不明なエラーが発生しました');
  }
}

export async function tryCatch<T>(fn: () => Promise<T>, errorMessage: string): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}
```

**使用例**:

```typescript
// Before
async function handleCopyUrl(entry: LogEntry) {
  try {
    await navigator.clipboard.writeText(entry.url);
    toast.success('URLをコピーしました');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    toast.error('URLのコピーに失敗しました');
  }
}

// After
async function handleCopyUrl(entry: LogEntry) {
  const success = await tryCatch(
    () => navigator.clipboard.writeText(entry.url),
    'URLのコピーに失敗しました'
  );
  if (success) {
    toast.success('URLをコピーしました');
  }
}
```

**効果**:

- ✅ エラー処理の一貫性
- ✅ コードの簡潔化
- ✅ エラーログの統一

**実装難易度**: ⭐⭐☆☆☆（簡単）
**所要時間**: 約1.5時間

**実装完了 (2025-10-18)**:

- ✅ `/src/lib/error-handling.ts` を作成（98行）
  - `AppError` クラス - コンテキスト付きカスタムエラー
  - `handleError` 関数 - エラー処理とトースト通知
  - `tryCatch` 関数 - 非同期エラーハンドリングラッパー
  - `tryCatchSync` 関数 - 同期エラーハンドリングラッパー
  - `isAppError` 型ガード
  - `ErrorCode` 定数 - 共通エラーコード
- ✅ `Popup.tsx` を更新
  - `handleCopyUrl` - tryCatch使用に変更
  - `handleOpenInTab` - tryCatchSync使用に変更
  - `handleExportSingle` - tryCatch使用に変更
  - `handleCopyCurl` - tryCatch使用に変更
  - `handleCopyCurlWithHeaders` - tryCatch使用に変更
  - `handleCopyYtDlp` - tryCatch使用に変更
- ✅ ビルド成功確認済み

**効果**:

- コード行数削減（try-catch-finallyブロックの簡略化）
- エラーログの統一
- エラーメッセージの一貫性向上
- 再利用可能なエラーハンドリングロジック

---

### 5. 型定義の改善

**現状の問題**:

- interfaceとtypeの使い分けが不統一
- 一部の型定義が冗長

**提案**:
型定義のガイドラインを策定し、リファクタリング

**ガイドライン**:

- オブジェクトの形状: `interface`
- ユニオン型、交差型: `type`
- 公開API: `interface`（拡張可能性）
- 内部実装: `type`

**Before**:

```typescript
// 複数の場所で同じ型を定義
type Status = {
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  entryCount: number;
  entries: LogEntry[];
};
```

**After**:

```typescript
// types/state.ts (新規作成)
export interface MonitoringStatus {
  isMonitoring: boolean;
  monitoringScope: MonitoringScope;
  entryCount: number;
  entries: LogEntry[];
}

export type MonitoringScope = 'activeTab' | 'allTabs';
```

**効果**:

- ✅ 型の再利用性向上
- ✅ 一貫性の確保
- ✅ ドキュメンテーション性の向上

**実装難易度**: ⭐⭐☆☆☆（簡単）
**所要時間**: 約1時間

---

## 💡 低優先度（今後の検討）

### 6. コンポーネントの最適化

**提案**:

- React.memoの適用
- useMemoの最適化
- useCallbackの適用

### 7. イベント駆動アーキテクチャの導入

**提案**:

- EventEmitterパターンの導入
- リスナーの疎結合化

### 8. テストカバレッジの向上

**提案**:

- カスタムフックのユニットテスト
- コンポーネントのインテグレーションテスト

---

## 📋 実装順序の推奨

1. **定数の一元管理** (1時間) - 影響範囲が小さく、効果が大きい
2. **props過多の解消** (30分) - 型安全性を保ちながら簡単に実装
3. **エラーハンドリングの統一** (1.5時間) - コード品質の向上
4. **Popup.tsxの分割** (2時間) - 最も影響が大きいリファクタリング
5. **型定義の改善** (1時間) - 継続的な改善

**合計所要時間**: 約6時間

---

## ✅ チェックリスト

リファクタリング実施前に確認：

- [ ] すべてのテストが通過している
- [ ] ブランチを作成している（feature/refactor-xxx）
- [ ] 変更内容を小さく保つ（1PRあたり1リファクタリング）
- [ ] リファクタリング後にテストを追加
- [ ] ビルドが成功する
- [ ] 既存機能が動作する（手動テスト）

---

**次のアクション**:

1. 定数の一元管理から着手することを推奨
2. 各リファクタリングごとに個別のissueを作成
3. 段階的に実施して、リスクを最小化
