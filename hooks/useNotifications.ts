import { useState, useEffect, useCallback, useRef } from 'react';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  matchId?: string;
  type: 'added' | 'validated';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state
  useEffect(() => {
    // 1. Load alerts list
    const stored = localStorage.getItem('prediction_foot_notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notifications storage", e);
      }
    }

    // 2. Load settings
    const storedSetting = localStorage.getItem('prediction_foot_notifications_enabled');
    if (storedSetting !== null) {
      setNotificationsEnabled(storedSetting === 'true');
    }

    // 3. Check browser push support & status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermissionStatus(Notification.permission);
    } else {
      setPushPermissionStatus('unsupported');
    }
  }, []);

  // Save to persistence
  const saveNotifications = useCallback((items: InAppNotification[]) => {
    setNotifications(items);
    localStorage.setItem('prediction_foot_notifications', JSON.stringify(items));
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushPermissionStatus('unsupported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermissionStatus(permission);
      return permission === 'granted';
    } catch (e) {
      console.error("Error requesting notification permission", e);
      return false;
    }
  }, []);

  const toggleNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('prediction_foot_notifications_enabled', String(enabled));
  }, []);

  // Dismiss currently showing Toast
  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  // Trigger a new notification
  const addNotification = useCallback((title: string, body: string, matchId?: string, type: 'added' | 'validated' = 'added') => {
    const newAlert: InAppNotification = {
      id: Math.random().toString(36).substring(2, 11),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      matchId,
      type
    };

    saveNotifications([newAlert, ...notifications]);

    // Check if notifications are enabled by user
    const userEnabled = localStorage.getItem('prediction_foot_notifications_enabled') !== 'false';
    if (!userEnabled) return;

    // Show inside-app Toast
    setActiveToast(newAlert);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);

    // Show native system push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/5324/5324484.png', // Beautiful soccer ball icon
          tag: 'prediction-foot-alert-' + type,
          requireInteraction: false
        });
      } catch (e) {
        console.warn("Failed to trigger native Notification:", e);
      }
    }
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
    dismissToast();
  }, [saveNotifications, dismissToast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    notificationsEnabled,
    pushPermissionStatus,
    activeToast,
    requestPushPermission,
    toggleNotificationsEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    dismissToast
  };
};
