/**
 * FilterPreview Component
 * Shows real-time preview of filter matches
 */

import type { PreviewResult } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterPreviewProps {
  result: PreviewResult | null;
  loading: boolean;
  error?: string;
}

export function FilterPreview({ result, loading, error }: FilterPreviewProps) {
  if (loading) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>プレビューを計算中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">エラー</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const matchRate = result.total > 0 ? ((result.matched / result.total) * 100).toFixed(1) : '0';
  const hasMatches = result.matched > 0;

  return (
    <Card className={hasMatches ? 'border-success/50 bg-success/10' : 'border-muted'}>
      <CardContent className="pt-6">
        {/* Match Summary */}
        <div className="flex items-start gap-2 mb-3">
          <CheckCircle2
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${hasMatches ? 'text-success' : 'text-muted-foreground'}`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${hasMatches ? 'text-success' : 'text-muted-foreground'}`}
            >
              プレビュー: {result.matched}件マッチ
              {result.total > 0 && (
                <span className="ml-2 text-xs">
                  （全{result.total}件中 {matchRate}%）
                </span>
              )}
            </p>

            {/* Sample URLs */}
            {result.samples.length > 0 && (
              <ScrollArea className="h-[120px] mt-2">
                <div className="space-y-1">
                  {result.samples.map((url: string, index: number) => {
                    // Extract just the path for display
                    let displayUrl = url;
                    try {
                      const urlObj = new URL(url);
                      displayUrl = urlObj.hostname + urlObj.pathname;
                    } catch {
                      // Keep original if URL parsing fails
                    }

                    return (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {displayUrl}
                        </p>
                      </div>
                    );
                  })}
                  {result.matched > result.samples.length && (
                    <p className="text-xs text-muted-foreground italic pl-5">
                      ... 他{result.matched - result.samples.length}件
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}

            {result.matched === 0 && result.total > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                現在のログにマッチするエントリがありません
              </p>
            )}

            {result.total === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                ログがありません。監視を開始してリクエストをキャプチャしてください
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
