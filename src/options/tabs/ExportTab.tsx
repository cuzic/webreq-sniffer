/**
 * Export Tab Component
 * Template management and preview
 */

import type { Settings, ExportTemplate, LogEntry } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TemplateSelector } from '../components/TemplateSelector';
import { TemplatePreview } from '../components/TemplatePreview';
import { getAllTemplates } from '@/lib/builtinTemplates';
import { getStatus } from '../messaging';

interface ExportTabProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function ExportTab({ settings, onSettingsChange }: ExportTabProps) {
  const allTemplates = getAllTemplates(settings.exportSettings.customTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    settings.exportSettings.defaultTemplateId || 'json'
  );
  const [currentTemplate, setCurrentTemplate] = useState<ExportTemplate | undefined>(
    allTemplates.find((t) => t.id === selectedTemplateId)
  );
  const [previewEntries, setPreviewEntries] = useState<LogEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Load entries for preview
  useEffect(() => {
    const loadEntries = async () => {
      setLoadingEntries(true);
      try {
        const status = await getStatus();
        setPreviewEntries(status.entries);
      } catch (error) {
        console.error('Failed to load entries:', error);
        setPreviewEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    };

    loadEntries();
  }, []);

  // Update current template when selection changes
  useEffect(() => {
    const template = allTemplates.find((t) => t.id === selectedTemplateId);
    setCurrentTemplate(template);
  }, [selectedTemplateId, allTemplates]);

  function handleSelectTemplate(id: string) {
    setSelectedTemplateId(id);
    onSettingsChange({
      ...settings,
      exportSettings: {
        ...settings.exportSettings,
        defaultTemplateId: id,
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Export Template</CardTitle>
          <CardDescription>
            テンプレートを使ってエクスポート形式をカスタマイズできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateSelector
            templates={allTemplates}
            selectedId={selectedTemplateId}
            onSelect={handleSelectTemplate}
          />
        </CardContent>
      </Card>

      {/* Template Viewer (Read-only for built-in templates) */}
      {currentTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Template Source</CardTitle>
            <CardDescription>
              {currentTemplate.isBuiltIn
                ? 'ビルトインテンプレート（読み取り専用）'
                : 'カスタムテンプレート'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Handlebars Template</Label>
              <Textarea
                value={currentTemplate.template}
                readOnly={currentTemplate.isBuiltIn}
                rows={12}
                className="font-mono text-xs"
                placeholder="{{#each entries}}&#10;{{{url}}}&#10;{{/each}}"
              />
              {currentTemplate.isBuiltIn && (
                <p className="text-xs text-muted-foreground">
                  ビルトインテンプレートは編集できません。カスタムテンプレートを作成してください。
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {currentTemplate && (
        <TemplatePreview
          template={currentTemplate.template}
          entries={previewEntries}
          loading={loadingEntries}
        />
      )}

      {/* Template Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>利用可能な変数</CardTitle>
          <CardDescription>テンプレートで使用できる変数とヘルパー関数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">エントリ変数 {'({{#each entries}}内)'}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-muted p-3 rounded">
                <div>{'{{url}}'}</div>
                <div>{'{{method}}'}</div>
                <div>{'{{type}}'}</div>
                <div>{'{{timestamp}}'}</div>
                <div>{'{{domain}}'}</div>
                <div>{'{{path}}'}</div>
                <div>{'{{query}}'}</div>
                <div>{'{{protocol}}'}</div>
                <div>{'{{filename}}'}</div>
                <div>{'{{fileExtension}}'}</div>
                <div>{'{{index}}'}</div>
                <div>{'{{index1}}'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">グローバル変数</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-muted p-3 rounded">
                <div>{'{{totalEntries}}'}</div>
                <div>{'{{exportDate}}'}</div>
                <div>{'{{exportDateISO}}'}</div>
                <div>{'{{domain}}'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">ヘルパー関数</h4>
              <div className="space-y-1 text-xs font-mono bg-muted p-3 rounded">
                <div>{'{{formatDate timestamp "YYYY-MM-DD HH:mm:ss"}}'}</div>
                <div>{'{{escapeShell url}}'}</div>
                <div>{'{{urlEncode query}}'}</div>
                <div>{'{{upper string}}'}</div>
                <div>{'{{lower string}}'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
