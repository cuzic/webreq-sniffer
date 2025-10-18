/**
 * Export Tab Component
 * Template management and preview
 */

import type { Settings, ExportTemplate, LogEntry } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TemplateSelector } from '../components/TemplateSelector';
import { TemplatePreview } from '../components/TemplatePreview';
import { TemplateEditorDialog } from '../components/TemplateEditorDialog';
import { CustomSelectorManager } from '../components/CustomSelectorManager';
import { TemplateEvaluationPreview } from '../components/TemplateEvaluationPreview';
import { getAllTemplates } from '@/lib/builtinTemplates';
import { getStatus } from '../messaging';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | undefined>(undefined);

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

  function handleCreateTemplate() {
    setEditingTemplate(undefined);
    setEditorOpen(true);
  }

  function handleEditTemplate() {
    if (currentTemplate && !currentTemplate.isBuiltIn) {
      setEditingTemplate(currentTemplate);
      setEditorOpen(true);
    }
  }

  function handleDeleteTemplate() {
    if (currentTemplate && !currentTemplate.isBuiltIn) {
      if (confirm(`テンプレート「${currentTemplate.name}」を削除しますか？`)) {
        const newCustomTemplates = settings.exportSettings.customTemplates.filter(
          (t) => t.id !== currentTemplate.id
        );

        // If deleting the currently selected template, switch to default
        const newDefaultId =
          selectedTemplateId === currentTemplate.id ? 'url-list' : selectedTemplateId;

        onSettingsChange({
          ...settings,
          exportSettings: {
            ...settings.exportSettings,
            customTemplates: newCustomTemplates,
            defaultTemplateId: newDefaultId,
          },
        });

        setSelectedTemplateId(newDefaultId);
      }
    }
  }

  function handleSaveTemplate(template: ExportTemplate) {
    const existingIndex = settings.exportSettings.customTemplates.findIndex(
      (t) => t.id === template.id
    );

    let newCustomTemplates: ExportTemplate[];
    if (existingIndex >= 0) {
      // Update existing template
      newCustomTemplates = [...settings.exportSettings.customTemplates];
      newCustomTemplates[existingIndex] = template;
    } else {
      // Add new template
      newCustomTemplates = [...settings.exportSettings.customTemplates, template];
    }

    onSettingsChange({
      ...settings,
      exportSettings: {
        ...settings.exportSettings,
        customTemplates: newCustomTemplates,
        defaultTemplateId: template.id,
      },
    });

    // Select the newly created/edited template
    setSelectedTemplateId(template.id);
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Export Template</CardTitle>
              <CardDescription>
                テンプレートを使ってエクスポート形式をカスタマイズできます
              </CardDescription>
            </div>
            <Button onClick={handleCreateTemplate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>
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
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Template Source</CardTitle>
                <CardDescription>
                  {currentTemplate.isBuiltIn
                    ? 'ビルトインテンプレート（読み取り専用）'
                    : 'カスタムテンプレート'}
                </CardDescription>
              </div>
              {!currentTemplate.isBuiltIn && (
                <div className="flex gap-2">
                  <Button onClick={handleEditTemplate} size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                  <Button
                    onClick={handleDeleteTemplate}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Handlebars Template</Label>
              <Textarea
                value={currentTemplate.template}
                readOnly
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

      {/* Filename Template Section */}
      <Card>
        <CardHeader>
          <CardTitle>ファイル名テンプレート</CardTitle>
          <CardDescription>
            エクスポート時のファイル名を設定します。JavaScript式を使用できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename-template">テンプレート</Label>
              <Textarea
                id="filename-template"
                value={settings.exportSettings.filenameTemplate}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    exportSettings: {
                      ...settings.exportSettings,
                      filenameTemplate: e.target.value,
                    },
                  })
                }
                placeholder="{videoTitle ?? pageTitle}_{date}.{ext}"
                className="font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                例: {'{videoTitle?.toLowerCase().replace(/\\s+/g, "_")}_{date}.{ext}'}
              </p>
            </div>

            {/* Live Preview */}
            <TemplateEvaluationPreview
              template={settings.exportSettings.filenameTemplate}
              format="bash-curl"
            />

            {/* Available Variables & Helpers */}
            <div className="space-y-4 text-sm border-t pt-4">
              <div>
                <h4 className="font-medium mb-2">📋 利用可能な変数</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-muted p-3 rounded">
                  <div>
                    <span className="text-muted-foreground">// Page</span>
                  </div>
                  <div></div>
                  <div></div>
                  <div>{'pageTitle'}</div>
                  <div>{'ogTitle'}</div>
                  <div>{'videoTitle'}</div>
                  <div>{'metaTitle'}</div>
                  <div>{'metaDescription'}</div>
                  <div></div>
                  <div>
                    <span className="text-muted-foreground">// Manifest</span>
                  </div>
                  <div></div>
                  <div></div>
                  <div>{'manifestTitle'}</div>
                  <div>{'manifestType'}</div>
                  <div>{'segmentPattern'}</div>
                  <div>{'programDate'}</div>
                  <div></div>
                  <div></div>
                  <div>
                    <span className="text-muted-foreground">// System</span>
                  </div>
                  <div></div>
                  <div></div>
                  <div>{'date'}</div>
                  <div>{'time'}</div>
                  <div>{'timestamp'}</div>
                  <div>{'domain'}</div>
                  <div>{'ext'}</div>
                  <div></div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🛠️ ヘルパー関数</h4>
                <div className="space-y-1 text-xs font-mono bg-muted p-3 rounded">
                  <div>
                    <span className="text-blue-600">sanitize</span>
                    {'(str)'} - ファイル名用にサニタイズ
                  </div>
                  <div>
                    <span className="text-blue-600">truncate</span>
                    {'(str, len, suffix?)'} - 指定長で切り詰め
                  </div>
                  <div>
                    <span className="text-blue-600">slugify</span>
                    {'(str)'} - スラッグ化 (lowercase + dashes)
                  </div>
                  <div>
                    <span className="text-blue-600">removeParens</span>
                    {'(str)'} - 括弧【】[]()内を削除
                  </div>
                  <div>
                    <span className="text-blue-600">capitalize</span>
                    {'(str)'} - 先頭大文字化
                  </div>
                  <div>
                    <span className="text-blue-600">remove</span>
                    {'(str, pattern)'} - パターン削除
                  </div>
                  <div>
                    <span className="text-blue-600">lowercase</span>
                    {'(str)'} / <span className="text-blue-600">uppercase</span>
                    {'(str)'} - 大文字小文字変換
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">💡 サンプル</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <div className="font-mono text-blue-600 mb-1">
                      {'{videoTitle?.toLowerCase().replace(/\\s+/g, "_")}_{date}.{ext}'}
                    </div>
                    <div className="text-muted-foreground">→ my_awesome_video_2025-10-18.sh</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="font-mono text-blue-600 mb-1">
                      {'{slugify(truncate(videoTitle ?? pageTitle, 50))}_{timestamp}.{ext}'}
                    </div>
                    <div className="text-muted-foreground">
                      → my-awesome-video-episode-1_1729259445000.sh
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="font-mono text-blue-600 mb-1">
                      {'{manifestType === "hls" ? "stream" : "video"}_{domain}.{ext}'}
                    </div>
                    <div className="text-muted-foreground">→ stream_example.com.sh</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="font-mono text-blue-600 mb-1">
                      {'{removeParens(videoTitle)}_{programDate}.{ext}'}
                    </div>
                    <div className="text-muted-foreground">→ Video Title_2025-10-18.sh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Selector Manager */}
      <CustomSelectorManager settings={settings} onSettingsChange={onSettingsChange} />

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
