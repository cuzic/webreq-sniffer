/**
 * Template Expression Help Dialog
 * Displays comprehensive help for filename template expressions
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateExpressionHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateExpressionHelp({ open, onOpenChange }: TemplateExpressionHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>テンプレート式ヘルプ</DialogTitle>
          <DialogDescription>
            ファイル名テンプレートで使用できる変数、演算子、ヘルパー関数の一覧
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="variables" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="variables">変数</TabsTrigger>
              <TabsTrigger value="operators">演算子</TabsTrigger>
              <TabsTrigger value="helpers">ヘルパー</TabsTrigger>
              <TabsTrigger value="examples">実用例</TabsTrigger>
            </TabsList>

            {/* Variables Tab */}
            <TabsContent value="variables" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">ページメタデータ</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <code className="bg-muted p-2 rounded">{'pageTitle'}</code>
                    <span className="text-muted-foreground">ページタイトル (&lt;title&gt;)</span>

                    <code className="bg-muted p-2 rounded">{'ogTitle'}</code>
                    <span className="text-muted-foreground">Open Graphタイトル</span>

                    <code className="bg-muted p-2 rounded">{'videoTitle'}</code>
                    <span className="text-muted-foreground">
                      動画タイトル（カスタムセレクター）
                    </span>

                    <code className="bg-muted p-2 rounded">{'metaTitle'}</code>
                    <span className="text-muted-foreground">メタタイトル</span>

                    <code className="bg-muted p-2 rounded">{'metaDescription'}</code>
                    <span className="text-muted-foreground">メタディスクリプション</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">マニフェストメタデータ</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <code className="bg-muted p-2 rounded">{'manifestTitle'}</code>
                    <span className="text-muted-foreground">マニフェストタイトル</span>

                    <code className="bg-muted p-2 rounded">{'manifestType'}</code>
                    <span className="text-muted-foreground">タイプ ("hls", "dash")</span>

                    <code className="bg-muted p-2 rounded">{'segmentPattern'}</code>
                    <span className="text-muted-foreground">セグメントパターン</span>

                    <code className="bg-muted p-2 rounded">{'programDate'}</code>
                    <span className="text-muted-foreground">プログラム日時</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">システム変数</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <code className="bg-muted p-2 rounded">{'date'}</code>
                    <span className="text-muted-foreground">現在日付 (YYYY-MM-DD)</span>

                    <code className="bg-muted p-2 rounded">{'time'}</code>
                    <span className="text-muted-foreground">現在時刻 (HH-mm-ss)</span>

                    <code className="bg-muted p-2 rounded">{'timestamp'}</code>
                    <span className="text-muted-foreground">Unixタイムスタンプ</span>

                    <code className="bg-muted p-2 rounded">{'domain'}</code>
                    <span className="text-muted-foreground">ドメイン名</span>

                    <code className="bg-muted p-2 rounded">{'ext'}</code>
                    <span className="text-muted-foreground">拡張子</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Operators Tab */}
            <TabsContent value="operators" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">文字列メソッド</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle.toLowerCase()'}</code>
                    <p className="text-muted-foreground mt-1">小文字に変換</p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle.toUpperCase()'}</code>
                    <p className="text-muted-foreground mt-1">大文字に変換</p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle.substring(0, 20)'}</code>
                    <p className="text-muted-foreground mt-1">部分文字列を抽出</p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle.trim()'}</code>
                    <p className="text-muted-foreground mt-1">前後の空白を削除</p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle.replace(/\\s+/g, "_")'}</code>
                    <p className="text-muted-foreground mt-1">正規表現で置換</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">演算子</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle?.toLowerCase()'}</code>
                    <p className="text-muted-foreground mt-1">
                      <strong>Optional Chaining:</strong> undefinedでもエラーにならない
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'videoTitle ?? pageTitle ?? "untitled"'}</code>
                    <p className="text-muted-foreground mt-1">
                      <strong>Null Coalescing:</strong> 最初の有効な値を使用
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <code>{'manifestType === "hls" ? "stream" : "video"'}</code>
                    <p className="text-muted-foreground mt-1">
                      <strong>Ternary:</strong> 条件分岐
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">メソッドチェーン</h3>
                <div className="bg-muted p-3 rounded text-sm">
                  <code>{'videoTitle.toLowerCase().replace(/\\s+/g, "_").substring(0, 50)'}</code>
                  <p className="text-muted-foreground mt-1">複数の操作を連続で実行</p>
                </div>
              </div>
            </TabsContent>

            {/* Helpers Tab */}
            <TabsContent value="helpers" className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">sanitize(str)</code>
                  <p className="text-muted-foreground mt-1">ファイル名として安全な文字列に変換</p>
                  <div className="mt-2 text-xs">
                    例: <code>sanitize("Video: Part 1")</code> → "Video Part 1"
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">truncate(str, len, suffix?)</code>
                  <p className="text-muted-foreground mt-1">指定した長さで文字列を切り詰め</p>
                  <div className="mt-2 text-xs">
                    例: <code>truncate(videoTitle, 30, "...")</code>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">slugify(str)</code>
                  <p className="text-muted-foreground mt-1">スラッグ化 (小文字、ハイフン区切り)</p>
                  <div className="mt-2 text-xs">
                    例: <code>slugify("My Video!")</code> → "my-video"
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">removeParens(str)</code>
                  <p className="text-muted-foreground mt-1">括弧【】[]()とその中身を削除</p>
                  <div className="mt-2 text-xs">
                    例: <code>removeParens("Title【予告】")</code> → "Title"
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">capitalize(str)</code>
                  <p className="text-muted-foreground mt-1">先頭を大文字、残りを小文字に</p>
                  <div className="mt-2 text-xs">
                    例: <code>capitalize("awesome VIDEO")</code> → "Awesome video"
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">remove(str, pattern)</code>
                  <p className="text-muted-foreground mt-1">指定したパターンを削除</p>
                  <div className="mt-2 text-xs">
                    例: <code>remove(videoTitle, " - YouTube")</code>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <code className="text-blue-600">lowercase(str) / uppercase(str)</code>
                  <p className="text-muted-foreground mt-1">大文字・小文字変換</p>
                </div>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">YouTube動画の整形</h4>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-blue-600">
                      {
                        '{videoTitle.replace(/\\s*-\\s*YouTube$/, "").toLowerCase().replace(/\\s+/g, "_")}_{date}.{ext}'
                      }
                    </code>
                    <p className="text-muted-foreground mt-2">
                      結果: <code>my_awesome_video_2025-10-18.sh</code>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">フォールバックチェーン</h4>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-blue-600">
                      {
                        '{slugify(truncate(videoTitle ?? ogTitle ?? pageTitle, 50))}_{timestamp}.{ext}'
                      }
                    </code>
                    <p className="text-muted-foreground mt-2">
                      結果: <code>my-awesome-video-episode-1_1729259445000.sh</code>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">マニフェストタイプによる分岐</h4>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-blue-600">
                      {
                        '{manifestType === "hls" ? "stream" : "video"}_{domain}_{programDate ?? date}.{ext}'
                      }
                    </code>
                    <p className="text-muted-foreground mt-2">
                      結果: <code>stream_example.com_2025-10-18.sh</code>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">括弧削除と日付挿入</h4>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-blue-600">
                      {'{removeParens(videoTitle)}_{programDate}.{ext}'}
                    </code>
                    <p className="text-muted-foreground mt-2">
                      結果: <code>Video_Title_2025-10-18.sh</code>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">ベストプラクティス</h4>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-blue-600">
                      {'{truncate(slugify(videoTitle ?? pageTitle), 100)}_{date}.{ext}'}
                    </code>
                    <p className="text-muted-foreground mt-2">
                      ・フォールバックで安全性確保
                      <br />
                      ・slugifyでファイル名として安全に
                      <br />
                      ・truncateで長さ制限
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">セキュリティ制限</h4>
                <p className="text-sm text-muted-foreground">
                  安全性のため、以下の機能は使用できません：
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
                  <li>
                    <code>eval()</code>, <code>Function()</code> の呼び出し
                  </li>
                  <li>
                    <code>window</code>, <code>document</code>, <code>chrome</code>{' '}
                    オブジェクトへのアクセス
                  </li>
                  <li>ネットワークアクセスやファイルシステムアクセス</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
