/**
 * Custom Selector Manager Component
 * Manages CSS selectors for extracting video titles from specific sites
 */

import type { CustomSelector } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface EditorState {
  isOpen: boolean;
  selector: CustomSelector | null;
  isNew: boolean;
}

export function CustomSelectorManager() {
  const { settings, updateSettings } = useSettings();
  const [editor, setEditor] = useState<EditorState>({
    isOpen: false,
    selector: null,
    isNew: false,
  });

  const [formData, setFormData] = useState<Partial<CustomSelector>>({});

  function handleAdd() {
    setFormData({
      id: `custom-${Date.now()}`,
      name: '',
      pattern: '',
      selector: '',
      attribute: '',
      enabled: true,
    });
    setEditor({ isOpen: true, selector: null, isNew: true });
  }

  function handleEdit(selector: CustomSelector) {
    setFormData({ ...selector });
    setEditor({ isOpen: true, selector, isNew: false });
  }

  function handleDelete(id: string) {
    const updated = settings.customSelectors.filter((s) => s.id !== id);
    updateSettings({
      customSelectors: updated,
    });
  }

  function handleToggle(id: string) {
    const updated = settings.customSelectors.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateSettings({
      customSelectors: updated,
    });
  }

  function handleSave() {
    if (!formData.name || !formData.pattern || !formData.selector) {
      alert('Please fill in all required fields');
      return;
    }

    const newSelector: CustomSelector = {
      id: formData.id || `custom-${Date.now()}`,
      name: formData.name,
      pattern: formData.pattern,
      selector: formData.selector,
      attribute: formData.attribute || undefined,
      enabled: formData.enabled ?? true,
    };

    let updated: CustomSelector[];
    if (editor.isNew) {
      updated = [...settings.customSelectors, newSelector];
    } else {
      updated = settings.customSelectors.map((s) => (s.id === newSelector.id ? newSelector : s));
    }

    updateSettings({
      customSelectors: updated,
    });

    handleCancel();
  }

  function handleCancel() {
    setEditor({ isOpen: false, selector: null, isNew: false });
    setFormData({});
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Selectors</CardTitle>
            <CardDescription>
              Configure CSS selectors to extract video titles from specific websites. These
              selectors are used for the {'{videoTitle}'} template variable.
            </CardDescription>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Selector
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editor.isOpen ? (
          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <h3 className="font-semibold">{editor.isNew ? 'Add' : 'Edit'} Custom Selector</h3>

            <div className="space-y-2">
              <Label htmlFor="selector-name">Name *</Label>
              <Input
                id="selector-name"
                placeholder="e.g., YouTube, Netflix, etc."
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selector-pattern">URL Pattern *</Label>
              <Input
                id="selector-pattern"
                placeholder="e.g., youtube.com, *.example.com/*"
                value={formData.pattern || ''}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Supports wildcards: * matches any characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selector-css">CSS Selector *</Label>
              <Input
                id="selector-css"
                placeholder="e.g., h1.video-title, div.player-title"
                value={formData.selector || ''}
                onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Standard CSS selector to find the video title element
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selector-attribute">Attribute (Optional)</Label>
              <Input
                id="selector-attribute"
                placeholder="Leave empty to use textContent"
                value={formData.attribute || ''}
                onChange={(e) => setFormData({ ...formData, attribute: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Attribute name to extract (e.g., 'title', 'data-title'). Leave empty to use
                element's text content.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {settings.customSelectors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No custom selectors configured. Click "Add Selector" to create one.
              </p>
            ) : (
              settings.customSelectors.map((selector) => (
                <div
                  key={selector.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Switch
                      checked={selector.enabled}
                      onCheckedChange={() => handleToggle(selector.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{selector.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Pattern: {selector.pattern} | Selector: {selector.selector}
                        {selector.attribute && ` | Attribute: ${selector.attribute}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(selector)}
                      disabled={selector.id.startsWith('youtube') && selector.id.length < 10}
                      title={
                        selector.id.startsWith('youtube') && selector.id.length < 10
                          ? 'Built-in selectors cannot be edited, but can be disabled'
                          : 'Edit selector'
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(selector.id)}
                      disabled={selector.id.startsWith('youtube') && selector.id.length < 10}
                      title={
                        selector.id.startsWith('youtube') && selector.id.length < 10
                          ? 'Built-in selectors cannot be deleted, but can be disabled'
                          : 'Delete selector'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
