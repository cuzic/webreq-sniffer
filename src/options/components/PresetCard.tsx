/**
 * PresetCard Component
 * Display a custom preset card with actions
 */

import type { CustomPreset } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, Pencil, Trash2 } from 'lucide-react';

interface PresetCardProps {
  preset: CustomPreset;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PresetCard({ preset, onApply, onEdit, onDelete }: PresetCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Preset Name */}
            <div className="flex items-center gap-2 mb-2">
              {preset.icon && <span className="text-2xl">{preset.icon}</span>}
              <h3 className="text-lg font-semibold truncate">{preset.name}</h3>
            </div>

            {/* Preset Details */}
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Simple Filters: {preset.simpleFilters.length}件</div>
              <div>Regex Filters: {preset.regexFilters.length}件</div>
              <div>Resource Types: {preset.resourceTypes.length}件</div>
              <div>HLS/MPD Mode: {preset.hlsMpdMode}</div>
            </div>

            {/* Preview of filters */}
            {preset.simpleFilters.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="font-medium">Filters: </span>
                <span className="text-muted-foreground">
                  {preset.simpleFilters.slice(0, 3).join(', ')}
                  {preset.simpleFilters.length > 3 && ` +${preset.simpleFilters.length - 3}件`}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={onApply} size="sm" variant="default">
              <Check className="mr-2 h-4 w-4" />
              適用
            </Button>
            <Button onClick={onEdit} size="sm" variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>プリセットを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    「{preset.name}」を削除します。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>削除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
