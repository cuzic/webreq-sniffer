/**
 * MonitoringControl Color System Tests
 * TDD approach for Issue #66 - Phase 3: Monitoring Status Colors
 *
 * These tests ensure:
 * 1. Monitoring status uses semantic colors
 * 2. Active state uses success color
 * 3. Inactive state uses muted color
 * 4. No hardcoded color values
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonitoringControl } from '@/popup/components/MonitoringControl';

describe('MonitoringControl - Color System Integration', () => {
  const defaultProps = {
    isMonitoring: false,
    monitoringScope: 'activeTab' as const,
    loading: false,
    onStartStop: vi.fn(),
    onScopeChange: vi.fn(),
  };

  describe('Status Indicator Colors', () => {
    it('should use success color when monitoring is active', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      // Find the status indicator (the colored dot)
      const statusIndicator = container.querySelector('.rounded-full');
      expect(statusIndicator).toBeTruthy();

      const classes = statusIndicator?.className || '';

      // Should use success semantic color
      expect(classes).toMatch(/bg-success/);

      // Should NOT use hardcoded green color
      expect(classes).not.toMatch(/bg-green-\d+/);
    });

    it('should use muted color when monitoring is inactive', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={false} />);

      // Find the status indicator
      const statusIndicator = container.querySelector('.rounded-full');
      expect(statusIndicator).toBeTruthy();

      const classes = statusIndicator?.className || '';

      // Should use muted semantic color
      expect(classes).toMatch(/bg-muted/);

      // Should NOT use hardcoded gray color
      expect(classes).not.toMatch(/bg-gray-\d+/);
    });

    it('should animate when monitoring is active', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      const statusIndicator = container.querySelector('.rounded-full');
      const classes = statusIndicator?.className || '';

      // Should have pulse animation
      expect(classes).toContain('animate-pulse');
    });

    it('should not animate when monitoring is inactive', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={false} />);

      const statusIndicator = container.querySelector('.rounded-full');
      const classes = statusIndicator?.className || '';

      // Should NOT have pulse animation
      expect(classes).not.toContain('animate-pulse');
    });
  });

  describe('Status Text', () => {
    it('should display "監視中" when monitoring is active', () => {
      render(<MonitoringControl {...defaultProps} isMonitoring={true} />);
      expect(screen.getByText('監視中')).toBeInTheDocument();
    });

    it('should display "停止中" when monitoring is inactive', () => {
      render(<MonitoringControl {...defaultProps} isMonitoring={false} />);
      expect(screen.getByText('停止中')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should display stop button when monitoring is active', () => {
      render(<MonitoringControl {...defaultProps} isMonitoring={true} />);
      expect(screen.getByText('監視ストップ')).toBeInTheDocument();
    });

    it('should display start button when monitoring is inactive', () => {
      render(<MonitoringControl {...defaultProps} isMonitoring={false} />);
      expect(screen.getByText('監視スタート')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<MonitoringControl {...defaultProps} loading={true} />);
      const button = screen.getByRole('button', { name: /監視/ });
      expect(button).toBeDisabled();
    });
  });

  describe('Color System Consistency', () => {
    it('should not use any hardcoded Tailwind color values', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const classes = element.className;
        if (typeof classes === 'string') {
          // Check for hardcoded numeric colors (except for border, shadow, etc.)
          const hasHardcodedBg = classes.match(/bg-(green|gray|blue|red|yellow)-\d+/);
          const hasHardcodedText = classes.match(/text-(green|gray|blue|red|yellow)-\d+/);

          expect(hasHardcodedBg).toBeNull();
          expect(hasHardcodedText).toBeNull();
        }
      });
    });

    it('should use semantic colors for all colored elements', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      const statusIndicator = container.querySelector('.rounded-full');
      const classes = statusIndicator?.className || '';

      // Should use one of our semantic color classes
      const usesSemanticColor = classes.match(
        /(bg|text|border)-(success|error|warning|info|muted|primary|secondary|accent)/
      );
      expect(usesSemanticColor).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should provide visual feedback for monitoring state', () => {
      const { container, rerender } = render(
        <MonitoringControl {...defaultProps} isMonitoring={false} />
      );

      const statusIndicator = container.querySelector('.rounded-full');
      const inactiveClasses = statusIndicator?.className || '';

      // Re-render with monitoring active
      rerender(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      const activeClasses = statusIndicator?.className || '';

      // Classes should be different to provide visual feedback
      expect(inactiveClasses).not.toBe(activeClasses);
    });

    it('should use WCAG AA compliant colors from the color system', () => {
      const { container } = render(<MonitoringControl {...defaultProps} isMonitoring={true} />);

      const statusIndicator = container.querySelector('.rounded-full');
      const classes = statusIndicator?.className || '';

      // Our color system ensures WCAG AA compliance
      // Success color should be used for active state
      expect(classes).toMatch(/bg-success/);
    });
  });
});
