/**
 * Built-in Export Templates
 * Mustache templates for common export formats (CSP-compliant)
 */

import type { ExportTemplate } from '@/types';

export const BUILTIN_TEMPLATES: ExportTemplate[] = [
  {
    id: 'url-list',
    name: 'URL List',
    template: `{{#entries}}
{{{url}}}
{{/entries}}`,
    fileExtension: '.txt',
    isBuiltIn: true,
    description: 'Simple list of URLs, one per line',
  },
  {
    id: 'bash-curl',
    name: 'Bash curl',
    template: `#!/bin/bash
# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
curl {{{urlEscaped}}}
{{/entries}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with curl commands',
  },
  {
    id: 'bash-curl-headers',
    name: 'Bash curl (with headers)',
    template: `#!/bin/bash
# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
curl {{{urlEscaped}}} \\
  -H "User-Agent: {{headers.User-Agent}}" \\
{{#headers.Referer}}
  -H "Referer: {{{.}}}" \\
{{/headers.Referer}}
{{#headers.Origin}}
  -H "Origin: {{{.}}}" \\
{{/headers.Origin}}
  -H "Accept: {{headers.Accept}}"
{{/entries}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with curl commands including headers',
  },
  {
    id: 'bash-yt-dlp',
    name: 'Bash yt-dlp',
    template: `#!/bin/bash
# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
yt-dlp {{{urlEscaped}}} \\
  --user-agent "{{headers.User-Agent}}" \\
{{#headers.Referer}}
  --referer "{{{.}}}" \\
{{/headers.Referer}}
  -o "{{index1}}_%(title)s.%(ext)s"
{{/entries}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with yt-dlp commands',
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    template: `# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
Invoke-WebRequest -Uri "{{{urlEscapedPowerShell}}}" \`
  -UserAgent "{{headers.User-Agent}}" \`
{{#headers.Referer}}
  -Headers @{"Referer"="{{{.}}}"} \`
{{/headers.Referer}}
  -OutFile "{{index1}}_{{filename}}"
{{/entries}}`,
    fileExtension: '.ps1',
    isBuiltIn: true,
    description: 'PowerShell script with Invoke-WebRequest commands',
  },
  {
    id: 'json',
    name: 'JSON',
    template: `{
  "exportDate": "{{exportDateISO}}",
  "totalEntries": {{totalEntries}},
  "entries": [
{{#entries}}
    {
      "index": {{index}},
      "url": "{{{url}}}",
      "method": "{{method}}",
      "type": "{{type}}",
      "timestamp": {{timestamp}},
      "domain": "{{domain}}",
      "path": "{{{path}}}",
      "query": "{{{query}}}"
    }{{#isNotLast}},{{/isNotLast}}
{{/entries}}
  ]
}`,
    fileExtension: '.json',
    isBuiltIn: true,
    description: 'Structured JSON format with metadata',
  },
  {
    id: 'csv',
    name: 'CSV',
    template: `Index,URL,Method,Type,Timestamp,Domain
{{#entries}}
{{index1}},"{{{url}}}","{{method}}","{{type}}",{{timestamp}},"{{domain}}"
{{/entries}}`,
    fileExtension: '.csv',
    isBuiltIn: true,
    description: 'Comma-separated values format',
  },
  {
    id: 'markdown',
    name: 'Markdown',
    template: `# Captured URLs

**Exported:** {{exportDate}}
**Total:** {{totalEntries}} entries

{{#entries}}
## {{index1}}. {{domain}}

- **URL**: {{{url}}}
- **Method**: {{method}}
- **Type**: {{type}}
- **Time**: {{formattedDateTime}}

{{/entries}}`,
    fileExtension: '.md',
    isBuiltIn: true,
    description: 'Markdown formatted document',
  },
  {
    id: 'wget',
    name: 'wget Script',
    template: `#!/bin/bash
# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#entries}}
wget {{{urlEscaped}}} \\
  -O "{{index1}}_{{filename}}" \\
  --user-agent="{{headers.User-Agent}}"
{{/entries}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with wget commands',
  },
  {
    id: 'aria2c',
    name: 'aria2c Input File',
    template: `{{#entries}}
{{{url}}}
  out={{index1}}_{{filename}}
  user-agent={{headers.User-Agent}}
{{#headers.Referer}}
  referer={{{.}}}
{{/headers.Referer}}
{{/entries}}`,
    fileExtension: '.txt',
    isBuiltIn: true,
    description: 'aria2c input file format',
  },
];

export function getBuiltInTemplate(id: string): ExportTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

export function getAllTemplates(customTemplates: ExportTemplate[] = []): ExportTemplate[] {
  return [...BUILTIN_TEMPLATES, ...customTemplates];
}
