/**
 * State Change Emitter (Observer Pattern)
 * Provides event-driven state change notifications
 *
 * Benefits:
 * - Real-time updates instead of polling
 * - Reduced battery consumption
 * - Better performance
 * - More reactive UI
 *
 * Usage:
 * ```typescript
 * const emitter = new StateChangeEmitter();
 *
 * // Subscribe to events
 * const unsubscribe = emitter.subscribe('logData:changed', () => {
 *   console.log('Log data changed!');
 * });
 *
 * // Emit events
 * emitter.emit('logData:changed');
 *
 * // Unsubscribe
 * unsubscribe();
 * ```
 */

import { Logger } from './logger';

/**
 * Type for event listener callbacks
 */
export type EventListener = () => void;

/**
 * Type for unsubscribe function
 */
export type Unsubscribe = () => void;

/**
 * State Change Emitter
 * Implements Observer Pattern for state change notifications
 */
export class StateChangeEmitter {
  private listeners = new Map<string, Set<EventListener>>();

  /**
   * Subscribe to an event
   * @param event - Event name to subscribe to
   * @param callback - Callback function to call when event is emitted
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = emitter.subscribe('logData:changed', () => {
   *   console.log('Data changed!');
   * });
   *
   * // Later...
   * unsubscribe();
   * ```
   */
  subscribe(event: string, callback: EventListener): Unsubscribe {
    // Get or create listener set for this event
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listenerSet = this.listeners.get(event)!;
    listenerSet.add(callback);

    // Return unsubscribe function
    return () => {
      listenerSet.delete(callback);

      // Clean up empty sets to prevent memory leaks
      if (listenerSet.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event - Event name to emit
   *
   * @example
   * ```typescript
   * emitter.emit('logData:changed');
   * ```
   */
  emit(event: string): void {
    const listenerSet = this.listeners.get(event);

    if (!listenerSet || listenerSet.size === 0) {
      return;
    }

    // Call all listeners for this event
    // Use Array.from to avoid iterator issues if listeners modify the set
    Array.from(listenerSet).forEach((callback) => {
      try {
        callback();
      } catch (error) {
        // Log error but continue calling other listeners
        Logger.error('state-change-emitter', error, { event });
      }
    });
  }

  /**
   * Get the number of listeners for an event
   * Useful for debugging and testing
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    const listenerSet = this.listeners.get(event);
    return listenerSet ? listenerSet.size : 0;
  }

  /**
   * Remove all listeners for an event
   * @param event - Event name
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * Global state change emitter instance
 * Shared across the application for consistency
 */
export const stateEmitter = new StateChangeEmitter();
