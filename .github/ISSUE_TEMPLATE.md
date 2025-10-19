# UI/UX デザイン改善

## 概要

現在のUIデザインを改善し、Tailwind CSS を活用したモダンで美麗なインターフェースに刷新する。

## 問題点

### 1. ポップアップUI

- **カラースキーム**: 単調で視覚的な階層が弱い
- **スペーシング**: padding/margin が不統一
- **タイポグラフィ**: フォントサイズと重みの使い分けが不十分
- **アイコン**: lucide-react を使っているが活用が限定的
- **alert()使用**: モダンなトースト通知ではなく、ブラウザの alert() を使用

### 2. オプションページ

- **レイアウト**: タブベースだが視覚的な区切りが弱い
- **フォーム要素**: 入力フィールドのスタイルが基本的
- **視覚的フィードバック**: hover/focus 状態の表現が弱い

### 3. 全体的な問題

- **ダークモード対応**: 未実装
- **アニメーション**: トランジション効果がほぼない
- **レスポンシブ**: ポップアップは固定幅のみ

## 改善提案

### Phase 1: カラーシステムの刷新 (優先度: 高)

**目標**: 視覚的階層とブランディングの確立

#### タスク

- [ ] ブランドカラーの定義（Primary/Secondary/Accent）
- [ ] セマンティックカラーの定義（Success/Warning/Error/Info）
- [ ] グレースケールの最適化（背景/テキスト/ボーダー）
- [ ] ダークモード対応のカラーパレット
- [ ] tailwind.config.js でカスタムカラーを定義

#### 実装ファイル

- `tailwind.config.js`
- `src/styles/globals.css`

#### デザイン例

```css
/* 例: ブランドカラー */
--primary: 220 90% 56%; /* 鮮やかなブルー */
--primary-foreground: 0 0% 100%;
--accent: 340 82% 52%; /* アクセントレッド */
--accent-foreground: 0 0% 100%;
```

---

### Phase 2: ポップアップUIの改善 (優先度: 高)

**目標**: 使いやすく視覚的に魅力的なポップアップ

#### タスク

- [ ] ヘッダーの改善
  - グラデーション背景
  - アイコン付きタイトル
  - アクションボタンのグループ化
- [ ] モニタリングコントロールの改善
  - トグルボタンのビジュアル強化
  - ステータスインジケーター（アニメーション付き）
  - スコープ選択のUI改善
- [ ] ログ統計の改善
  - 数字の強調表示
  - アイコン付き統計カード
  - プログレスバーやチャート（オプション）
- [ ] 検索・フィルターUIの改善
  - 検索バーのプレースホルダーアニメーション
  - フィルタードロップダウンのビジュアル
- [ ] ログリストの改善
  - ホバーエフェクト
  - 選択状態の視覚化
  - リソースタイプ別アイコン
  - タイムスタンプのフォーマット改善
- [ ] アクションボタンの改善
  - ボタングループのスタイリング
  - アイコン付きボタン
  - ローディング状態の表現

#### 実装ファイル

- `src/popup/Popup.tsx`
- `src/popup/components/MonitoringControl.tsx`
- `src/popup/components/LogList.tsx`
- `src/popup/components/SearchBar.tsx`
- `src/popup/components/FilterDropdown.tsx`
- `src/popup/components/LogActions.tsx`

---

### Phase 3: オプションページの改善 (優先度: 中)

**目標**: 直感的で設定しやすいオプションページ

#### タスク

- [ ] レイアウトの改善
  - サイドバーナビゲーション（縦型タブ）
  - コンテンツエリアのカード化
  - ブレッドクラム表示
- [ ] タブUIの改善
  - タブのアクティブ状態の強調
  - アニメーション付き遷移
  - アイコン付きタブラベル
- [ ] フォーム要素の改善
  - 入力フィールドのスタイル統一
  - ラベルと説明文のタイポグラフィ
  - バリデーションエラーの表示
- [ ] プリセット管理UIの改善
  - カードベースのプリセット表示
  - ドラッグ&ドロップ対応（オプション）
  - プレビュー機能の強化

#### 実装ファイル

- `src/options/Options.tsx`
- `src/options/tabs/*.tsx`
- `src/options/components/*.tsx`

---

### Phase 4: コンポーネントの洗練 (優先度: 中)

**目標**: 既存shadcn/uiコンポーネントのカスタマイズ

#### タスク

- [ ] Buttonコンポーネント
  - サイズバリエーションの追加
  - アイコン付きボタンのスタイル
  - ローディング状態の実装
- [ ] Cardコンポーネント
  - ホバーエフェクト
  - 影の調整
  - ボーダーのカスタマイズ
- [ ] Dialogコンポーネント
  - オーバーレイのブラー効果
  - アニメーション改善
  - サイズバリエーション
- [ ] Selectコンポーネント
  - ドロップダウンのスタイル
  - 選択状態の視覚化
- [ ] Switchコンポーネント
  - アニメーション改善
  - サイズバリエーション

#### 実装ファイル

- `src/components/ui/*.tsx`

---

### Phase 5: アニメーションとトランジション (優先度: 低)

**目標**: スムーズなUXのためのマイクロインタラクション

#### タスク

- [ ] ページ遷移アニメーション
- [ ] ボタンクリックのフィードバック
- [ ] リストアイテムのホバーエフェクト
- [ ] ローディングアニメーション
- [ ] トースト通知のスライドイン
- [ ] モーダルの開閉アニメーション

#### 実装方法

- Tailwind CSSのtransitionユーティリティ
- framer-motion（必要に応じて）
- CSS animations

---

### Phase 6: ダークモード対応 (優先度: 低)

**目標**: システム設定に応じた自動切り替え

#### タスク

- [ ] ダークモードカラーパレットの定義
- [ ] システム設定の検出
- [ ] 手動切り替えUI（トグルボタン）
- [ ] ローカルストレージへの保存
- [ ] すべてのコンポーネントのダークモード対応

#### 実装ファイル

- `tailwind.config.js`
- `src/hooks/useDarkMode.ts`（新規）
- すべての`.tsx`ファイル

---

## デザインリファレンス

### カラーパレット案

- **Primary**: `#3b82f6` (Blue-500) - 信頼性、技術的
- **Accent**: `#ec4899` (Pink-500) - 活発、注目
- **Success**: `#10b981` (Green-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)
- **Background**: `#ffffff` / `#0f172a` (Dark)
- **Surface**: `#f8fafc` / `#1e293b` (Dark)

### タイポグラフィ案

- **Heading 1**: `text-3xl font-bold`
- **Heading 2**: `text-2xl font-semibold`
- **Heading 3**: `text-xl font-semibold`
- **Body**: `text-base font-normal`
- **Caption**: `text-sm text-muted-foreground`

### スペーシング案

- **Container padding**: `p-6`
- **Card padding**: `p-4`
- **Section gap**: `space-y-6`
- **Element gap**: `space-y-4`

---

## 参考デザイン

### Chrome拡張の良デザイン例

- [Grammarly](https://chrome.google.com/webstore/detail/grammarly) - クリーンなポップアップUI
- [Notion Web Clipper](https://chrome.google.com/webstore/detail/notion-web-clipper) - カードベースのレイアウト
- [Honey](https://chrome.google.com/webstore/detail/honey) - ブランディングが効いたUI

### UIライブラリ・デザインシステム

- [shadcn/ui](https://ui.shadcn.com/) - 既に使用中
- [Tailwind UI](https://tailwindui.com/) - プロフェッショナルなコンポーネント
- [Radix UI](https://www.radix-ui.com/) - アクセシブルなプリミティブ

---

## 実装戦略

### Step 1: 基盤整備

1. カラーシステムの定義（`tailwind.config.js`）
2. グローバルスタイルの設定（`globals.css`）
3. タイポグラフィスケールの確立

### Step 2: コンポーネント単位で改善

1. 小さいコンポーネントから始める（Button, Card など）
2. ポップアップの主要セクションを順次改善
3. オプションページへ展開

### Step 3: 統合とテスト

1. すべてのページで一貫性を確認
2. アクセシビリティチェック
3. パフォーマンステスト

---

## 成功指標

### 定量的指標

- [ ] Lighthouse Accessibility スコア 95+
- [ ] バンドルサイズの増加 < 10%
- [ ] ページロード時間の維持

### 定性的指標

- [ ] ユーザーテストでの満足度向上
- [ ] ビジュアルの一貫性
- [ ] ブランディングの強化

---

## 関連Issue

- (関連するissueがあればリンク)

## 備考

- Tailwind CSS v4 を使用
- shadcn/ui をベースに拡張
- アクセシビリティを最優先
- パフォーマンスを損なわない範囲で改善
