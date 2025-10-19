/**
 * Duplicate Control Component Tests
 * TDD for duplicate request detection UI component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LogEntry } from '@/types';
import { DuplicateControl } from '@/popup/components/DuplicateControl';
import { DuplicateStrategy } from '@/lib/duplicate-detector';

describe('DuplicateControl Component', () => {
  const sampleEntries: LogEntry[] = [
    {
      id: '1',
      url: 'https://api.example.com/data',
      type: 'xmlhttprequest',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '2',
      url: 'https://api.example.com/data',
      type: 'xmlhttprequest',
      method: 'GET',
      timestamp: Date.now() + 100,
      tabId: 1,
      headers: {},
    },
    {
      id: '3',
      url: 'https://api.example.com/other',
      type: 'xmlhttprequest',
      method: 'GET',
      timestamp: Date.now() + 200,
      tabId: 1,
      headers: {},
    },
  ];

  describe('Rendering', () => {
    it('should display duplicate count', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByText(/2/)).toBeInTheDocument(); // 2 duplicates (entries 1 and 2)
    });

    it('should display zero when no duplicates', () => {
      const uniqueEntries: LogEntry[] = [
        {
          id: '1',
          url: 'https://api.example.com/data',
          type: 'xmlhttprequest',
          method: 'GET',
          timestamp: Date.now(),
          tabId: 1,
          headers: {},
        },
        {
          id: '2',
          url: 'https://api.example.com/other',
          type: 'xmlhttprequest',
          method: 'GET',
          timestamp: Date.now() + 100,
          tabId: 1,
          headers: {},
        },
      ];

      render(
        <DuplicateControl
          entries={uniqueEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should display toggle button for showing duplicates', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /duplicates only/i })).toBeInTheDocument();
    });

    it('should display strategy selector when duplicates exist', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByRole('combobox', { name: /strategy/i })).toBeInTheDocument();
    });

    it('should not display strategy selector when no duplicates', () => {
      const uniqueEntries: LogEntry[] = [
        {
          id: '1',
          url: 'https://api.example.com/data',
          type: 'xmlhttprequest',
          method: 'GET',
          timestamp: Date.now(),
          tabId: 1,
          headers: {},
        },
      ];

      render(
        <DuplicateControl
          entries={uniqueEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.queryByRole('combobox', { name: /strategy/i })).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onToggleDuplicates when toggle button clicked', async () => {
      const user = userEvent.setup();
      const onToggleDuplicates = vi.fn();

      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={onToggleDuplicates}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /duplicates only/i });
      await user.click(toggleButton);

      expect(onToggleDuplicates).toHaveBeenCalledTimes(1);
      expect(onToggleDuplicates).toHaveBeenCalledWith(true);
    });

    it('should call onToggleDuplicates with false when already showing duplicates', async () => {
      const user = userEvent.setup();
      const onToggleDuplicates = vi.fn();

      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={true}
          onToggleDuplicates={onToggleDuplicates}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /duplicates only/i });
      await user.click(toggleButton);

      expect(onToggleDuplicates).toHaveBeenCalledTimes(1);
      expect(onToggleDuplicates).toHaveBeenCalledWith(false);
    });

    it('should call onStrategyChange when strategy selected', async () => {
      const user = userEvent.setup();
      const onStrategyChange = vi.fn();

      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={onStrategyChange}
        />
      );

      const strategySelect = screen.getByRole('combobox', { name: /strategy/i });
      await user.selectOptions(strategySelect, DuplicateStrategy.KEEP_LAST);

      expect(onStrategyChange).toHaveBeenCalledTimes(1);
      expect(onStrategyChange).toHaveBeenCalledWith(DuplicateStrategy.KEEP_LAST);
    });

    it('should display selected strategy', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_LAST}
          onStrategyChange={vi.fn()}
        />
      );

      const strategySelect = screen.getByRole('combobox', { name: /strategy/i });
      expect(strategySelect).toHaveValue(DuplicateStrategy.KEEP_LAST);
    });
  });

  describe('Visual States', () => {
    it('should highlight toggle button when duplicates only mode active', () => {
      const { container } = render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={true}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /duplicates only/i });
      expect(toggleButton).toHaveClass('bg-primary');
    });

    it('should use default styling when duplicates only mode inactive', () => {
      const { container } = render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /duplicates only/i });
      expect(toggleButton).not.toHaveClass('bg-primary');
    });

    it('should show warning variant when duplicates found', () => {
      const { container } = render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const badge = container.querySelector('[data-variant="warning"]');
      expect(badge).toBeInTheDocument();
    });

    it('should show success variant when no duplicates', () => {
      const uniqueEntries: LogEntry[] = [
        {
          id: '1',
          url: 'https://api.example.com/data',
          type: 'xmlhttprequest',
          method: 'GET',
          timestamp: Date.now(),
          tabId: 1,
          headers: {},
        },
      ];

      const { container } = render(
        <DuplicateControl
          entries={uniqueEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      const badge = container.querySelector('[data-variant="success"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label for duplicate count', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/2 duplicate/i)).toBeInTheDocument();
    });

    it('should have descriptive label for strategy select', () => {
      render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/duplicate strategy/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entries array', () => {
      render(
        <DuplicateControl
          entries={[]}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should update count when entries change', () => {
      const { rerender } = render(
        <DuplicateControl
          entries={sampleEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByText(/2/)).toBeInTheDocument();

      // Add new entries with different IDs but same URLs
      const newEntries = [
        ...sampleEntries,
        {
          id: '4',
          url: 'https://api.example.com/data',
          type: 'xmlhttprequest' as const,
          method: 'GET',
          timestamp: Date.now() + 300,
          tabId: 1,
          headers: {},
        },
        {
          id: '5',
          url: 'https://api.example.com/data',
          type: 'xmlhttprequest' as const,
          method: 'GET',
          timestamp: Date.now() + 400,
          tabId: 1,
          headers: {},
        },
      ];
      rerender(
        <DuplicateControl
          entries={newEntries}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      expect(screen.getByText(/4/)).toBeInTheDocument();
    });

    it('should handle large duplicate counts', () => {
      const largeList: LogEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        url: `https://api.example.com/data${i % 100}`,
        type: 'xmlhttprequest' as const,
        method: 'GET',
        timestamp: Date.now() + i,
        tabId: 1,
        headers: {},
      }));

      render(
        <DuplicateControl
          entries={largeList}
          showDuplicatesOnly={false}
          onToggleDuplicates={vi.fn()}
          duplicateStrategy={DuplicateStrategy.KEEP_FIRST}
          onStrategyChange={vi.fn()}
        />
      );

      // Should display formatted number (all 1000 entries are duplicates since each URL appears 10 times)
      expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });
  });
});
