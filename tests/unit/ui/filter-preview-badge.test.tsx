/**
 * Filter Preview Badge Component Tests
 * TDD for real-time filter preview UI component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { LogEntry } from '@/types';
import { FilterPreviewBadge } from '@/popup/components/FilterPreviewBadge';

describe('FilterPreviewBadge Component', () => {
  const sampleEntries: LogEntry[] = [
    {
      id: '1',
      url: 'https://example.com/video.mp4',
      type: 'media',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '2',
      url: 'https://example.com/image.png',
      type: 'image',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '3',
      url: 'https://api.example.com/data.json',
      type: 'xmlhttprequest',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
  ];

  describe('Rendering', () => {
    it('should display match count', () => {
      render(<FilterPreviewBadge entries={sampleEntries} searchTerm="video" filterType="all" />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display "All" when no filters applied', () => {
      render(<FilterPreviewBadge entries={sampleEntries} searchTerm="" filterType="all" />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display 0 when no entries match', () => {
      render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="nonexistent" filterType="all" />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should update count when searchTerm changes', () => {
      const { rerender } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="video" filterType="all" />
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="example" filterType="all" />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should update count when filterType changes', () => {
      const { rerender } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="" filterType="all" />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(<FilterPreviewBadge entries={sampleEntries} searchTerm="" filterType="media" />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should update count when entries change', () => {
      const { rerender } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="" filterType="all" />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      const newEntries = [...sampleEntries, sampleEntries[0]];
      rerender(<FilterPreviewBadge entries={newEntries} searchTerm="" filterType="all" />);

      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show info variant when some entries match', () => {
      const { container } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="video" filterType="all" />
      );

      const badge = container.querySelector('[data-variant="info"]');
      expect(badge).toBeInTheDocument();
    });

    it('should show warning variant when no entries match', () => {
      const { container } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="nonexistent" filterType="all" />
      );

      const badge = container.querySelector('[data-variant="warning"]');
      expect(badge).toBeInTheDocument();
    });

    it('should show success variant when all entries match', () => {
      const { container } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="" filterType="all" />
      );

      const badge = container.querySelector('[data-variant="success"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label', () => {
      render(<FilterPreviewBadge entries={sampleEntries} searchTerm="video" filterType="all" />);

      const badge = screen.getByLabelText(/matching entries/i);
      expect(badge).toBeInTheDocument();
    });

    it('should have role="status" for screen readers', () => {
      const { container } = render(
        <FilterPreviewBadge entries={sampleEntries} searchTerm="video" filterType="all" />
      );

      const status = container.querySelector('[role="status"]');
      expect(status).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entries array', () => {
      render(<FilterPreviewBadge entries={[]} searchTerm="" filterType="all" />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle large entry counts', () => {
      const largeList: LogEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        url: `https://example.com/file${i}.mp4`,
        type: 'media',
        method: 'GET',
        timestamp: Date.now(),
        tabId: 1,
        headers: {},
      }));

      render(<FilterPreviewBadge entries={largeList} searchTerm="" filterType="all" />);

      expect(screen.getByText('1,000')).toBeInTheDocument(); // Should format with comma
    });
  });
});
