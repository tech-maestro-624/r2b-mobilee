// toastConfig.tsx
import React from 'react';
import {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastConfigParams,
} from 'react-native-toast-message';

const toastConfig: ToastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
      text2Style={{
        fontSize: 13,
        color: 'green',
      }}
    />
  ),
  error: (props: ToastConfigParams<any>) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: 'red' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
      text2Style={{
        fontSize: 13,
        color: 'red',
      }}
    />
  ),
};

export default toastConfig;