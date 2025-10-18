# テンプレート式評価ガイド

WebreqSnifferのファイル名テンプレートでは、JavaScript式を使用して柔軟なファイル名生成が可能です。

## 基本構文

テンプレート内で `{expression}` の形式で式を記述します。

```
{videoTitle}_{date}.{ext}
```

## 利用可能な変数

### ページメタデータ

| 変数              | 説明                               | 例                        |
| ----------------- | ---------------------------------- | ------------------------- |
| `pageTitle`       | ページタイトル (`<title>`)         | "Video Page - YouTube"    |
| `ogTitle`         | Open Graphタイトル                 | "My Awesome Video"        |
| `videoTitle`      | 動画タイトル（カスタムセレクター） | "Episode 1: Introduction" |
| `metaTitle`       | メタタイトル                       | "Watch Now - Video Site"  |
| `metaDescription` | メタディスクリプション             | "Learn about..."          |

### マニフェストメタデータ

| 変数             | 説明                               | 例              |
| ---------------- | ---------------------------------- | --------------- |
| `manifestTitle`  | マニフェストから抽出されたタイトル | "HLS Stream"    |
| `manifestType`   | マニフェストタイプ                 | "hls", "dash"   |
| `segmentPattern` | セグメントパターン                 | "segment-\*.ts" |
| `programDate`    | プログラム日時                     | "2025-10-18"    |

### システム変数

| 変数        | 説明                        | 例                 |
| ----------- | --------------------------- | ------------------ |
| `date`      | 現在日付 (YYYY-MM-DD)       | "2025-10-18"       |
| `time`      | 現在時刻 (HH-mm-ss)         | "14-30-45"         |
| `timestamp` | Unixタイムスタンプ (ミリ秒) | 1729259445000      |
| `domain`    | ドメイン名                  | "example.com"      |
| `ext`       | 拡張子                      | "sh", "ps1", "txt" |

## JavaScript式のサポート

### 文字列メソッド

標準のJavaScript文字列メソッドが使用できます：

```javascript
{
  videoTitle.toLowerCase();
}
{
  pageTitle.toUpperCase();
}
{
  videoTitle.substring(0, 20);
}
{
  videoTitle.trim();
}
{
  videoTitle.replace(/\s+/g, '_');
}
```

### 演算子

#### Optional Chaining (`?.`)

存在しない可能性のあるプロパティに安全にアクセス：

```javascript
{
  videoTitle?.toLowerCase();
}
```

#### Null Coalescing (`??`)

undefinedやnullの場合のフォールバック値：

```javascript
{
  videoTitle ?? pageTitle ?? 'untitled';
}
```

#### Ternary Operator (`? :`)

条件分岐：

```javascript
{
  manifestType === 'hls' ? 'stream' : 'video';
}
{
  videoTitle ? videoTitle : 'no-title';
}
```

### メソッドチェーン

複数のメソッドを組み合わせ可能：

```javascript
{
  videoTitle.toLowerCase().replace(/\s+/g, '_').substring(0, 50);
}
```

## ヘルパー関数

### sanitize(str)

ファイル名として安全な文字列に変換します。

```javascript
{
  sanitize(videoTitle);
}
// "My Video: Part 1" → "My Video Part 1"
```

### truncate(str, len, suffix?)

指定した長さで文字列を切り詰めます。

```javascript
{
  truncate(videoTitle, 30);
}
// "Very Long Video Title Episode 1" → "Very Long Video Title Episo"

{
  truncate(videoTitle, 30, '...');
}
// "Very Long Video Title Episode 1" → "Very Long Video Title Episo..."
```

### slugify(str)

URL/ファイル名用のスラッグを生成します（小文字、ハイフン区切り）。

```javascript
{
  slugify(videoTitle);
}
// "My Awesome Video!" → "my-awesome-video"
```

### removeParens(str)

括弧（【】、[]、()）とその中身を削除します。

```javascript
{
  removeParens(videoTitle);
}
// "Video Title【予告】(HD)" → "Video Title"
```

### capitalize(str)

先頭文字を大文字に、残りを小文字にします。

```javascript
{
  capitalize(videoTitle);
}
// "awesome VIDEO" → "Awesome video"
```

### remove(str, pattern)

指定したパターンを削除します。

```javascript
{
  remove(videoTitle, ' - YouTube');
}
// "My Video - YouTube" → "My Video"
```

### lowercase(str) / uppercase(str)

大文字・小文字変換：

```javascript
{
  lowercase(videoTitle);
}
// "My Video" → "my video"

{
  uppercase(videoTitle);
}
// "My Video" → "MY VIDEO"
```

## 実用例

### 例1: YouTube動画の整形

```javascript
{videoTitle.replace(/\s*-\s*YouTube$/, "").toLowerCase().replace(/\s+/g, "_")}_{date}.{ext}
```

**結果**: `my_awesome_video_2025-10-18.sh`

### 例2: フォールバックチェーン

```javascript
{slugify(truncate(videoTitle ?? ogTitle ?? pageTitle, 50))}_{timestamp}.{ext}
```

**結果**: `my-awesome-video-episode-1_1729259445000.sh`

### 例3: マニフェストタイプによる分岐

```javascript
{manifestType === "hls" ? "stream" : "video"}_{domain}_{programDate ?? date}.{ext}
```

**結果**: `stream_example.com_2025-10-18.sh`

### 例4: 括弧削除と日付挿入

```javascript
{removeParens(videoTitle)}_{programDate}.{ext}
```

**結果**: `Video_Title_2025-10-18.sh`

### 例5: 複雑な変換

```javascript
{slugify(remove(videoTitle, /[【\[\(].*?[】\]\)]/g))}_{time}.{ext}
```

**結果**: `video-title_14-30-45.sh`

## セキュリティ制限

安全性のため、以下の機能は使用できません：

- `eval()`, `Function()` の呼び出し
- `window`, `document`, `chrome` オブジェクトへのアクセス
- `setTimeout`, `setInterval`, `fetch`, `XMLHttpRequest`
- ネットワークアクセスやファイルシステムアクセス

## エラーハンドリング

- 式の評価に失敗した場合、元の `{expression}` がそのまま使用されます
- 最大1000文字の式制限
- 100msのタイムアウト制限

## ベストプラクティス

### 1. フォールバックを活用

複数の候補を`??`で繋ぐと、最初に有効な値が使用されます：

```javascript
{
  videoTitle ?? manifestTitle ?? pageTitle ?? 'untitled';
}
```

### 2. Optional Chainingで安全にアクセス

存在しないプロパティでもエラーにならない：

```javascript
{
  videoTitle?.toLowerCase();
}
```

### 3. ヘルパー関数を組み合わせる

可読性の高い簡潔な式：

```javascript
{
  slugify(truncate(removeParens(videoTitle), 50));
}
```

### 4. 正規表現で柔軟な置換

```javascript
{
  videoTitle.replace(/[^a-z0-9]+/gi, '_');
}
```

### 5. 長さ制限を考慮

ファイル名が長すぎないように `truncate()` を使用：

```javascript
{truncate(slugify(videoTitle ?? pageTitle), 100)}_{date}.{ext}
```

## トラブルシューティング

### Q: 式が評価されず `{expression}` がそのまま表示される

A: 式に構文エラーがある可能性があります。プレビューでエラーメッセージを確認してください。

### Q: `undefined` という文字列が出力される

A: 変数が存在しません。`??` でフォールバック値を指定してください。

```javascript
// ❌ Bad
{
  manifestTitle;
}

// ✅ Good
{
  manifestTitle ?? 'untitled';
}
```

### Q: 特殊文字がファイル名に含まれる

A: `sanitize()` または `slugify()` を使用してください。

```javascript
{
  sanitize(videoTitle);
}
{
  slugify(videoTitle);
}
```

## 参考リンク

- [JavaScript String Methods (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [Optional Chaining (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Nullish Coalescing (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
