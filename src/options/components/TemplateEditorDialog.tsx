/**
 * TemplateEditorDialog Component
 * Dialog for creating and editing custom export templates
 */

import type { ExportTemplate } from '@/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { validateTemplate } from '@/lib/template';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ExportTemplate;
  onSave: (template: ExportTemplate) => void;
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileExtension, setFileExtension] = useState('.txt');
  const [templateContent, setTemplateContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form when template changes or dialog opens
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setFileExtension(template.fileExtension);
        setTemplateContent(template.template);
      } else {
        // Reset form for new template
        setName('');
        setDescription('');
        setFileExtension('.txt');
        setTemplateContent('');
      }
      setError(null);
    }
  }, [open, template]);

  function handleSave() {
    // Validate inputs
    if (!name.trim()) {
      setError('テンプレート名を入力してください');
      return;
    }

    if (!templateContent.trim()) {
      setError('テンプレート内容を入力してください');
      return;
    }

    // Validate template syntax
    const validation = validateTemplate(templateContent);
    if (!validation.valid) {
      setError(validation.error || 'テンプレートの構文エラー');
      return;
    }

    // Ensure file extension starts with dot
    const ext = fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`;

    const newTemplate: ExportTemplate = {
      id: template?.id || `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      fileExtension: ext,
      template: templateContent,
      isBuiltIn: false,
    };

    onSave(newTemplate);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'テンプレートを編集' : '新規テンプレートを作成'}</DialogTitle>
          <DialogDescription>
            Handlebarsテンプレートを使ってカスタムエクスポート形式を作成できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">テンプレート名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Template"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このテンプレートの説明"
            />
          </div>

          {/* File Extension */}
          <div className="space-y-2">
            <Label htmlFor="extension">ファイル拡張子 *</Label>
            <Input
              id="extension"
              value={fileExtension}
              onChange={(e) => setFileExtension(e.target.value)}
              placeholder=".txt"
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">例: .txt, .sh, .json, .csv</p>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <Label htmlFor="template">テンプレート *</Label>
            <Textarea
              id="template"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="{{#each entries}}&#10;{{url}}&#10;{{/each}}"
              rows={15}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Handlebars構文を使用できます。変数リファレンスは下部をご覧ください。
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
