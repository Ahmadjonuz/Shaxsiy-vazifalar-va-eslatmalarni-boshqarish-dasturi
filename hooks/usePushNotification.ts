import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const usePushNotification = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkPermission();
    registerServiceWorker();
  }, []);

  const checkPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Supabase-ga subscription ma'lumotlarini saqlash
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: subscription.toJSON()
          });
      }

      setSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);

        // Supabase-dan subscription ma'lumotlarini o'chirish
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Failed to unsubscribe from push:', error);
        throw error;
      }
    }
  };

  return {
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush
  };
}; 