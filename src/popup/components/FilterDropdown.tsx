/**
 * FilterDropdown Component
 * Dropdown for filtering log entries by resource type
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <Filter className="mr-2 h-4 w-4" />
        <SelectValue placeholder="すべて" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="media">Media</SelectItem>
        <SelectItem value="xmlhttprequest">XHR</SelectItem>
        <SelectItem value="script">Script</SelectItem>
        <SelectItem value="stylesheet">Stylesheet</SelectItem>
        <SelectItem value="image">Image</SelectItem>
        <SelectItem value="font">Font</SelectItem>
        <SelectItem value="document">Document</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}
