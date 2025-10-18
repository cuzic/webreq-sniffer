/**
 * TemplateSelector Component
 * Dropdown to select export template
 */

import type { ExportTemplate } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectorProps {
  templates: ExportTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ templates, selectedId, onSelect }: TemplateSelectorProps) {
  const selectedTemplate = templates.find((t) => t.id === selectedId);

  return (
    <div className="space-y-3">
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue>
            {selectedTemplate ? (
              <div className="flex items-center gap-2">
                <span>{selectedTemplate.name}</span>
                {selectedTemplate.isBuiltIn && (
                  <Badge variant="secondary" className="text-xs">
                    Built-in
                  </Badge>
                )}
              </div>
            ) : (
              'Select a template'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Built-in templates */}
          {templates
            .filter((t) => t.isBuiltIn)
            .map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <span>{template.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {template.fileExtension}
                  </Badge>
                </div>
              </SelectItem>
            ))}

          {/* Separator if custom templates exist */}
          {templates.some((t) => !t.isBuiltIn) && templates.some((t) => t.isBuiltIn) && (
            <div className="h-px bg-border my-1" />
          )}

          {/* Custom templates */}
          {templates
            .filter((t) => !t.isBuiltIn)
            .map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <span>{template.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Custom
                  </Badge>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Description */}
      {selectedTemplate?.description && (
        <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
      )}
    </div>
  );
}
