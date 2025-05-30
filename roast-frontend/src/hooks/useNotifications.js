import { useState, useCallback } from 'react';

let notificationIdCounter = 0;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Funkcja do dodawania powiadomień - z unikalnym ID
  const addNotification = useCallback((notification) => {
    // Tworzę bardziej unikalny ID używając counter + timestamp + random
    const id = `notification_${++notificationIdCounter}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  // Funkcja do usuwania powiadomień
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Funkcja do czyszczenia wszystkich powiadomień
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}; 