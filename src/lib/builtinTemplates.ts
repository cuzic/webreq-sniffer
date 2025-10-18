/**
 * Built-in Export Templates
 * Pre-defined Handlebars templates for common export formats
 */

import type { ExportTemplate } from '@/types';

export const BUILTIN_TEMPLATES: ExportTemplate[] = [
  {
    id: 'url-list',
    name: 'URL List',
    template: `{{#each entries}}
{{{url}}}
{{/each}}`,
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

{{#each entries}}
curl "{{{escapeShell url}}}"
{{/each}}`,
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

{{#each entries}}
curl "{{{escapeShell url}}}" \\
  -H "User-Agent: {{headers.User-Agent}}" \\
{{#if headers.Referer}}
  -H "Referer: {{headers.Referer}}" \\
{{/if}}
{{#if headers.Origin}}
  -H "Origin: {{headers.Origin}}" \\
{{/if}}
  -H "Accept: {{headers.Accept}}"
{{/each}}`,
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

{{#each entries}}
yt-dlp "{{{escapeShell url}}}" \\
  --user-agent "{{headers.User-Agent}}" \\
{{#if headers.Referer}}
  --referer "{{headers.Referer}}" \\
{{/if}}
  -o "{{index1}}_%(title)s.%(ext)s"
{{/each}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with yt-dlp commands',
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    template: `# Generated on {{exportDate}}
# Total entries: {{totalEntries}}

{{#each entries}}
Invoke-WebRequest -Uri "{{{escapePowershell url}}}" \\
  -UserAgent "{{headers.User-Agent}}" \\
{{#if headers.Referer}}
  -Headers @{"Referer"="{{headers.Referer}}"} \\
{{/if}}
  -OutFile "{{index1}}_{{filename}}"
{{/each}}`,
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
{{#each entries}}
    {
      "index": {{index}},
      "url": "{{{url}}}",
      "method": "{{method}}",
      "type": "{{type}}",
      "timestamp": {{timestamp}},
      "domain": "{{domain}}",
      "path": "{{{path}}}",
      "query": "{{{query}}}"
    }{{#unless @last}},{{/unless}}
{{/each}}
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
{{#each entries}}
{{index1}},"{{{url}}}","{{method}}","{{type}}",{{timestamp}},"{{domain}}"
{{/each}}`,
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

{{#each entries}}
## {{index1}}. {{domain}}

- **URL**: {{{url}}}
- **Method**: {{method}}
- **Type**: {{type}}
- **Time**: {{formatDate timestamp "YYYY-MM-DD HH:mm:ss"}}

{{/each}}`,
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

{{#each entries}}
wget "{{{escapeShell url}}}" \\
  -O "{{index1}}_{{filename}}" \\
  --user-agent="{{headers.User-Agent}}"
{{/each}}`,
    fileExtension: '.sh',
    isBuiltIn: true,
    description: 'Bash script with wget commands',
  },
  {
    id: 'aria2c',
    name: 'aria2c Input File',
    template: `{{#each entries}}
{{{url}}}
  out={{index1}}_{{filename}}
  user-agent={{headers.User-Agent}}
{{#if headers.Referer}}
  referer={{headers.Referer}}
{{/if}}
{{/each}}`,
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
