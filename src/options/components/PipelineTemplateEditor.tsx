/**
 * Pipeline Template Editor Component
 * Enhanced template input with validation, preview, and documentation
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateTemplate } from '@/lib/pipeline-template-parser';
import { safeEvaluateTemplate, type TemplateContext } from '@/lib/pipeline-template-engine';
import { AlertCircle, CheckCircle2, Info, FileCode } from 'lucide-react';

interface PipelineTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  previewContext?: Partial<TemplateContext>;
}

// Sample templates for quick insert
const SAMPLE_TEMPLATES = [
  {
    label: 'Simple',
    template: 'netlog_{date}_{domain}.{ext}',
    description: 'Basic template with date and domain',
  },
  {
    label: 'Video Title',
    template: '{videoTitle | slugify}_{date}.{ext}',
    description: 'Slugified video title with date',
  },
  {
    label: 'YouTube-style',
    template: '{videoTitle | lowercase | replace(" ", "_")}_{timestamp}.{ext}',
    description: 'Lowercase, underscores, with timestamp',
  },
  {
    label: 'Manifest',
    template: '{manifestType}_{manifestTitle | sanitize}_{domain}.{ext}',
    description: 'Manifest type and title',
  },
];

// Filter documentation
const FILTER_DOCS = [
  { name: 'lowercase', description: 'Convert to lowercase', example: '{videoTitle | lowercase}' },
  { name: 'uppercase', description: 'Convert to uppercase', example: '{domain | uppercase}' },
  {
    name: 'capitalize',
    description: 'Capitalize first letter',
    example: '{videoTitle | capitalize}',
  },
  {
    name: 'slugify',
    description: 'Convert to URL-friendly slug',
    example: '{videoTitle | slugify}',
  },
  {
    name: 'trim',
    description: 'Remove leading/trailing whitespace',
    example: '{videoTitle | trim}',
  },
  { name: 'truncate', description: 'Truncate to length', example: '{videoTitle | truncate(20)}' },
  { name: 'replace', description: 'Replace text', example: '{videoTitle | replace(" ", "_")}' },
  { name: 'remove', description: 'Remove text', example: '{videoTitle | remove("video")}' },
  {
    name: 'sanitize',
    description: 'Remove invalid filename chars',
    example: '{videoTitle | sanitize}',
  },
  {
    name: 'removeParens',
    description: 'Remove parentheses/brackets',
    example: '{videoTitle | removeParens}',
  },
  {
    name: 'default',
    description: 'Provide default value',
    example: '{videoTitle | default("untitled")}',
  },
  {
    name: 'ifEquals',
    description: 'Conditional replacement',
    example: '{manifestType | ifEquals("hls", "stream")}',
  },
  {
    name: 'ifContains',
    description: 'Check substring',
    example: '{videoTitle | ifContains("live", "LIVE")}',
  },
  { name: 'ifEmpty', description: 'Value if empty', example: '{videoTitle | ifEmpty("untitled")}' },
];

// Variable documentation
const VARIABLE_DOCS = {
  system: [
    { name: 'date', description: 'Current date (YYYY-MM-DD)', example: '2025-10-18' },
    { name: 'time', description: 'Current time (HH-mm-ss)', example: '14-30-45' },
    { name: 'timestamp', description: 'Unix timestamp (ms)', example: '1729259400000' },
    { name: 'domain', description: 'Hostname from URL', example: 'example.com' },
    { name: 'ext', description: 'File extension', example: 'sh' },
  ],
  page: [
    { name: 'pageTitle', description: 'Page <title> tag', example: 'Video Title - Site' },
    { name: 'ogTitle', description: 'Open Graph title', example: 'Video Title' },
    { name: 'videoTitle', description: 'Extracted video title', example: 'My Video' },
    { name: 'metaTitle', description: 'Meta title tag', example: 'Page Meta Title' },
  ],
  manifest: [
    { name: 'manifestTitle', description: 'HLS/DASH manifest title', example: 'Stream Title' },
    { name: 'manifestType', description: 'Manifest type (hls/dash)', example: 'hls' },
    { name: 'segmentPattern', description: 'Segment filename pattern', example: 'segment_%d.ts' },
    { name: 'programDate', description: 'Program date (YYYY-MM-DD)', example: '2025-10-18' },
  ],
};

export function PipelineTemplateEditor({
  value,
  onChange,
  previewContext,
}: PipelineTemplateEditorProps) {
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({
    valid: true,
  });
  const [preview, setPreview] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  // Validate and preview on change
  useEffect(() => {
    // Validate syntax
    const result = validateTemplate(value);
    setValidation(result);

    // Generate preview if valid
    if (result.valid) {
      const context: TemplateContext = {
        date: '2025-10-18',
        time: '14-30-45',
        timestamp: Date.now(),
        domain: 'example.com',
        ext: 'sh',
        videoTitle: 'My Awesome Video',
        pageTitle: 'Page Title - Website',
        ogTitle: 'OG Title',
        manifestType: 'hls',
        manifestTitle: 'Stream Title',
        ...previewContext,
      };

      const result = safeEvaluateTemplate(value, context, 'error.txt');
      setPreview(result);
    } else {
      setPreview('');
    }
  }, [value, previewContext]);

  function handleInsertSample(template: string) {
    onChange(template);
  }

  return (
    <div className="space-y-4">
      {/* Template Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pipeline-template">Filename Template</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="h-auto py-1 px-2 text-xs"
          >
            <Info className="mr-1 h-3 w-3" />
            {showHelp ? 'Hide Help' : 'Show Help'}
          </Button>
        </div>

        <Input
          id="pipeline-template"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="{videoTitle | slugify}_{date}.{ext}"
          className={validation.valid ? '' : 'border-destructive focus-visible:ring-destructive'}
        />

        {/* Validation Status */}
        {validation.valid ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            Valid template
          </div>
        ) : (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{validation.error}</AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {validation.valid && preview && (
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <code className="text-sm font-mono">{preview}</code>
          </div>
        )}
      </div>

      {/* Sample Templates */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Templates</Label>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_TEMPLATES.map((sample) => (
            <Button
              key={sample.label}
              variant="outline"
              size="sm"
              onClick={() => handleInsertSample(sample.template)}
              className="h-auto flex-col items-start py-2 px-3"
            >
              <div className="font-medium text-xs">{sample.label}</div>
              <div className="text-xs text-muted-foreground font-mono truncate w-full text-left">
                {sample.template}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Help Documentation */}
      {showHelp && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Template Help</CardTitle>
            <CardDescription className="text-xs">
              Available variables and filters for pipeline templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* System Variables */}
            <div>
              <h4 className="text-sm font-medium mb-2">System Variables</h4>
              <div className="space-y-1 text-xs">
                {VARIABLE_DOCS.system.map((variable) => (
                  <div key={variable.name} className="grid grid-cols-[100px_1fr_120px] gap-2">
                    <code className="font-mono text-blue-600">{`{${variable.name}}`}</code>
                    <span className="text-muted-foreground">{variable.description}</span>
                    <code className="font-mono text-xs text-right">{variable.example}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Variables */}
            <div>
              <h4 className="text-sm font-medium mb-2">Page Metadata</h4>
              <div className="space-y-1 text-xs">
                {VARIABLE_DOCS.page.map((variable) => (
                  <div key={variable.name} className="grid grid-cols-[100px_1fr_120px] gap-2">
                    <code className="font-mono text-blue-600">{`{${variable.name}}`}</code>
                    <span className="text-muted-foreground">{variable.description}</span>
                    <code className="font-mono text-xs text-right truncate">
                      {variable.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Manifest Variables */}
            <div>
              <h4 className="text-sm font-medium mb-2">Manifest Metadata</h4>
              <div className="space-y-1 text-xs">
                {VARIABLE_DOCS.manifest.map((variable) => (
                  <div key={variable.name} className="grid grid-cols-[120px_1fr_120px] gap-2">
                    <code className="font-mono text-blue-600">{`{${variable.name}}`}</code>
                    <span className="text-muted-foreground">{variable.description}</span>
                    <code className="font-mono text-xs text-right">{variable.example}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Filters</h4>
              <div className="space-y-1 text-xs">
                {FILTER_DOCS.map((filter) => (
                  <div key={filter.name} className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <code className="font-mono text-purple-600">{filter.name}</code>
                      <span className="text-muted-foreground">{filter.description}</span>
                    </div>
                    <code className="font-mono text-xs text-muted-foreground pl-4 block">
                      {filter.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Examples */}
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Pipeline Syntax</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Single variable:</div>
                  <code className="font-mono bg-muted px-2 py-1 rounded block">
                    {'{videoTitle}'}
                  </code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">With filter:</div>
                  <code className="font-mono bg-muted px-2 py-1 rounded block">
                    {'{videoTitle | lowercase}'}
                  </code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Multiple filters (pipeline):</div>
                  <code className="font-mono bg-muted px-2 py-1 rounded block">
                    {'{videoTitle | lowercase | replace(" ", "_") | truncate(50)}'}
                  </code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Complete template:</div>
                  <code className="font-mono bg-muted px-2 py-1 rounded block">
                    {'{videoTitle | slugify}_{date}.{ext}'}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
