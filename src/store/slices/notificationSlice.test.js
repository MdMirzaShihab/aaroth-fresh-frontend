import { describe, it, expect, beforeEach, vi } from 'vitest';
import notificationReducer, {
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
  markAllAsRead,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  selectNotifications,
  selectUnreadNotifications,
} from './notificationSlice';

// Mock Date.now and Math.random for consistent testing
const mockDate = new Date('2024-01-01T10:00:00.000Z').getTime();
const mockRandom = 0.5;

describe('notificationSlice', () => {
  const initialState = {
    notifications: [],
  };

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(mockDate);
    vi.spyOn(Math, 'random').mockReturnValue(mockRandom);
  });

  const mockNotification = {
    type: 'success',
    title: 'Success',
    message: 'Operation completed successfully',
    duration: 5000,
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(notificationReducer(undefined, { type: undefined })).toEqual(
        initialState
      );
    });

    it('should add notification with generated id and timestamp', () => {
      const action = addNotification(mockNotification);
      const state = notificationReducer(initialState, action);

      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toEqual({
        ...mockNotification,
        id: mockDate + mockRandom,
        timestamp: mockDate,
      });
    });

    it('should add notification to the beginning of the array', () => {
      const stateWithNotification = {
        notifications: [
          {
            id: 'existing-1',
            type: 'info',
            title: 'Info',
            message: 'Existing notification',
            timestamp: mockDate - 1000,
          },
        ],
      };

      const action = addNotification(mockNotification);
      const state = notificationReducer(stateWithNotification, action);

      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0]).toEqual({
        ...mockNotification,
        id: mockDate + mockRandom,
        timestamp: mockDate,
      });
      expect(state.notifications[1].id).toBe('existing-1');
    });

    it('should remove notification by id', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', type: 'success', message: 'First' },
          { id: '2', type: 'error', message: 'Second' },
          { id: '3', type: 'warning', message: 'Third' },
        ],
      };

      const action = removeNotification('2');
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications).toHaveLength(2);
      expect(state.notifications.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('should not change state when removing non-existent notification', () => {
      const stateWithNotifications = {
        notifications: [{ id: '1', type: 'success', message: 'First' }],
      };

      const action = removeNotification('non-existent');
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].id).toBe('1');
    });

    it('should clear all notifications', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', type: 'success', message: 'First' },
          { id: '2', type: 'error', message: 'Second' },
        ],
      };

      const action = clearNotifications();
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications).toHaveLength(0);
    });

    it('should mark notification as read', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', type: 'success', message: 'First', read: false },
          { id: '2', type: 'error', message: 'Second', read: false },
        ],
      };

      const action = markAsRead('1');
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications[0].read).toBe(true);
      expect(state.notifications[1].read).toBe(false);
    });

    it('should not change state when marking non-existent notification as read', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', type: 'success', message: 'First', read: false },
        ],
      };

      const action = markAsRead('non-existent');
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications[0].read).toBe(false);
    });

    it('should mark all notifications as read', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', type: 'success', message: 'First', read: false },
          { id: '2', type: 'error', message: 'Second', read: false },
          { id: '3', type: 'warning', message: 'Third', read: true },
        ],
      };

      const action = markAllAsRead();
      const state = notificationReducer(stateWithNotifications, action);

      expect(state.notifications.every((n) => n.read === true)).toBe(true);
    });
  });

  describe('helper action creators', () => {
    it('should create success notification', () => {
      const action = showSuccessNotification('Success message', 'Custom Title');

      expect(action.payload).toEqual({
        type: 'success',
        title: 'Custom Title',
        message: 'Success message',
        duration: 5000,
      });
    });

    it('should create success notification with default title', () => {
      const action = showSuccessNotification('Success message');

      expect(action.payload).toEqual({
        type: 'success',
        title: 'Success',
        message: 'Success message',
        duration: 5000,
      });
    });

    it('should create error notification', () => {
      const action = showErrorNotification('Error message', 'Custom Error');

      expect(action.payload).toEqual({
        type: 'error',
        title: 'Custom Error',
        message: 'Error message',
        duration: 8000,
      });
    });

    it('should create warning notification', () => {
      const action = showWarningNotification(
        'Warning message',
        'Custom Warning'
      );

      expect(action.payload).toEqual({
        type: 'warning',
        title: 'Custom Warning',
        message: 'Warning message',
        duration: 6000,
      });
    });

    it('should create info notification', () => {
      const action = showInfoNotification('Info message', 'Custom Info');

      expect(action.payload).toEqual({
        type: 'info',
        title: 'Custom Info',
        message: 'Info message',
        duration: 4000,
      });
    });
  });

  describe('selectors', () => {
    const mockState = {
      notification: {
        notifications: [
          { id: '1', type: 'success', message: 'First', read: true },
          { id: '2', type: 'error', message: 'Second', read: false },
          { id: '3', type: 'warning', message: 'Third', read: false },
        ],
      },
    };

    it('should select all notifications', () => {
      expect(selectNotifications(mockState)).toEqual(
        mockState.notification.notifications
      );
    });

    it('should select unread notifications', () => {
      const unreadNotifications = selectUnreadNotifications(mockState);

      expect(unreadNotifications).toHaveLength(2);
      expect(unreadNotifications.map((n) => n.id)).toEqual(['2', '3']);
    });

    it('should return empty array when no unread notifications', () => {
      const stateWithAllRead = {
        notification: {
          notifications: [
            { id: '1', type: 'success', message: 'First', read: true },
            { id: '2', type: 'error', message: 'Second', read: true },
          ],
        },
      };

      const unreadNotifications = selectUnreadNotifications(stateWithAllRead);
      expect(unreadNotifications).toHaveLength(0);
    });
  });
});
