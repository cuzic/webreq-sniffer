/**
 * Unit Tests for State Change Emitter (Observer Pattern)
 * Testing TDD approach for Issue #64 Priority 2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateChangeEmitter } from '@/lib/state-change-emitter';

describe('State Change Emitter (Observer Pattern)', () => {
  let emitter: StateChangeEmitter;

  beforeEach(() => {
    emitter = new StateChangeEmitter();
  });

  describe('subscribe', () => {
    it('should allow subscribing to events', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.subscribe('logData:changed', callback);

      expect(unsubscribe).toBeTypeOf('function');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call subscriber when event is emitted', () => {
      const callback = vi.fn();
      emitter.subscribe('logData:changed', callback);

      emitter.emit('logData:changed');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call multiple subscribers for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      emitter.subscribe('logData:changed', callback1);
      emitter.subscribe('logData:changed', callback2);
      emitter.subscribe('logData:changed', callback3);

      emitter.emit('logData:changed');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should support multiple different events', () => {
      const logDataCallback = vi.fn();
      const settingsCallback = vi.fn();

      emitter.subscribe('logData:changed', logDataCallback);
      emitter.subscribe('settings:changed', settingsCallback);

      emitter.emit('logData:changed');

      expect(logDataCallback).toHaveBeenCalledTimes(1);
      expect(settingsCallback).not.toHaveBeenCalled();

      emitter.emit('settings:changed');

      expect(logDataCallback).toHaveBeenCalledTimes(1);
      expect(settingsCallback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function that removes listener', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.subscribe('logData:changed', callback);

      emitter.emit('logData:changed');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      emitter.emit('logData:changed');
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle multiple unsubscribes safely', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.subscribe('logData:changed', callback);

      unsubscribe();
      unsubscribe(); // Should not throw
      unsubscribe();

      emitter.emit('logData:changed');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not affect other subscribers when one unsubscribes', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = emitter.subscribe('logData:changed', callback1);
      emitter.subscribe('logData:changed', callback2);

      unsubscribe1();

      emitter.emit('logData:changed');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit', () => {
    it('should do nothing when emitting event with no subscribers', () => {
      expect(() => {
        emitter.emit('nonexistent:event');
      }).not.toThrow();
    });

    it('should emit events multiple times', () => {
      const callback = vi.fn();
      emitter.subscribe('logData:changed', callback);

      emitter.emit('logData:changed');
      emitter.emit('logData:changed');
      emitter.emit('logData:changed');

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback = vi.fn();

      emitter.subscribe('logData:changed', errorCallback);
      emitter.subscribe('logData:changed', successCallback);

      // Should not throw even if one callback throws
      expect(() => {
        emitter.emit('logData:changed');
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('memory management', () => {
    it('should not leak memory when subscribing and unsubscribing', () => {
      const callbacks: (() => void)[] = [];
      const unsubscribes: (() => void)[] = [];

      // Subscribe 100 listeners
      for (let i = 0; i < 100; i++) {
        const callback = vi.fn();
        callbacks.push(callback);
        unsubscribes.push(emitter.subscribe('logData:changed', callback));
      }

      // Unsubscribe all
      unsubscribes.forEach((unsub) => unsub());

      // Emit event - no callbacks should be called
      emitter.emit('logData:changed');

      callbacks.forEach((callback) => {
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('event naming conventions', () => {
    it('should support common event names', () => {
      const events = [
        'logData:changed',
        'settings:changed',
        'monitoring:started',
        'monitoring:stopped',
        'entries:cleared',
      ];

      events.forEach((eventName) => {
        const callback = vi.fn();
        emitter.subscribe(eventName, callback);
        emitter.emit(eventName);
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('performance', () => {
    it('should handle many simultaneous subscribers efficiently', () => {
      const callbacks = Array.from({ length: 1000 }, () => vi.fn());

      callbacks.forEach((callback) => {
        emitter.subscribe('logData:changed', callback);
      });

      const start = performance.now();
      emitter.emit('logData:changed');
      const duration = performance.now() - start;

      // Should complete in less than 100ms for 1000 callbacks
      expect(duration).toBeLessThan(100);

      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });
});
