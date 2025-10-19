/**
 * Quick Filters Component Tests
 * TDD for Quick Filter Presets UI component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Settings } from '@/types';
import { defaultSettings } from '@/types/schemas';
import { getFilterPresets } from '@/lib/filter-presets';

// Component to be implemented
import { QuickFilters } from '@/popup/components/QuickFilters';

describe('QuickFilters Component', () => {
  describe('Rendering', () => {
    it('should render all filter preset chips', () => {
      const mockOnApply = vi.fn();
      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      // Should have all 5 preset buttons
      expect(screen.getByText('すべて')).toBeInTheDocument();
      expect(screen.getByText('動画のみ')).toBeInTheDocument();
      expect(screen.getByText('画像のみ')).toBeInTheDocument();
      expect(screen.getByText('API (JSON/XML)')).toBeInTheDocument();
      expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    });

    it('should highlight active preset', () => {
      const mockOnApply = vi.fn();
      const presets = getFilterPresets();
      const videoPreset = presets.find((p) => p.id === 'video');

      const videoSettings: Settings = {
        ...defaultSettings,
        ...videoPreset?.settings,
      };

      render(<QuickFilters settings={videoSettings} onApplyPreset={mockOnApply} />);

      const videoChip = screen.getByText('動画のみ').closest('button');

      // Video preset should be highlighted (have specific class or attribute)
      expect(videoChip).toHaveClass('bg-primary');
    });

    it('should not highlight any preset when settings do not match', () => {
      const mockOnApply = vi.fn();
      const customSettings: Settings = {
        ...defaultSettings,
        resourceTypes: ['script'], // Custom filter
      };

      render(<QuickFilters settings={customSettings} onApplyPreset={mockOnApply} />);

      // None should be highlighted
      const allChip = screen.getByText('すべて').closest('button');
      const videoChip = screen.getByText('動画のみ').closest('button');

      expect(allChip).not.toHaveClass('bg-primary');
      expect(videoChip).not.toHaveClass('bg-primary');
    });
  });

  describe('User Interactions', () => {
    it('should call onApplyPreset when clicking video filter', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      const videoChip = screen.getByText('動画のみ');
      await user.click(videoChip);

      expect(mockOnApply).toHaveBeenCalledWith('video');
    });

    it('should call onApplyPreset when clicking images filter', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      const imagesChip = screen.getByText('画像のみ');
      await user.click(imagesChip);

      expect(mockOnApply).toHaveBeenCalledWith('images');
    });

    it('should call onApplyPreset when clicking API filter', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      const apiChip = screen.getByText('API (JSON/XML)');
      await user.click(apiChip);

      expect(mockOnApply).toHaveBeenCalledWith('api');
    });

    it('should call onApplyPreset when clicking all filter', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      const videoSettings: Settings = {
        ...defaultSettings,
        resourceTypes: ['media'],
      };

      render(<QuickFilters settings={videoSettings} onApplyPreset={mockOnApply} />);

      const allChip = screen.getByText('すべて');
      await user.click(allChip);

      expect(mockOnApply).toHaveBeenCalledWith('all');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button roles', () => {
      const mockOnApply = vi.fn();
      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      const buttons = screen.getAllByRole('button');

      expect(buttons.length).toBeGreaterThanOrEqual(5);
    });

    it('should have descriptive aria-labels', () => {
      const mockOnApply = vi.fn();
      render(<QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />);

      const videoChip = screen.getByText('動画のみ').closest('button');

      expect(videoChip).toHaveAttribute('aria-label');
    });
  });

  describe('Visual Design', () => {
    it('should render icons for each preset', () => {
      const mockOnApply = vi.fn();
      const { container } = render(
        <QuickFilters settings={defaultSettings} onApplyPreset={mockOnApply} />
      );

      // Check for SVG icons (Lucide icons render as SVGs)
      const svgs = container.querySelectorAll('svg');

      expect(svgs.length).toBeGreaterThanOrEqual(5); // At least one icon per preset
    });
  });
});
