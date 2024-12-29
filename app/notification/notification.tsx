import React, { useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(
  setPushToken: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Permission not granted to get push token for push notification!');
      return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      alert('Project ID not found');
      return;
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      setPushToken(pushTokenString);
    } catch (e) {
      alert(`Failed to get push token: ${(e as Error).message}`);
    }
  } else {
    alert('Must use physical device for push notifications');
  }
}

interface NotificationHandlerProps {
  setPushToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ setPushToken }) => {
  useEffect(() => {
    registerForPushNotificationsAsync(setPushToken);
  }, [setPushToken]);
  return null;
};

export default NotificationHandler;