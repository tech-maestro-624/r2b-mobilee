import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TamaguiProvider, YStack, Button, Text as TamaguiText } from 'tamagui';
import { Controller, useForm } from 'react-hook-form';
// import { sendOtp, verifyOtp } from 'app/api/auth';
import { verifyOtp, sendOtp } from 'app/api/auth';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useAuth } from 'app/context/AuthContext';

// import Loader from 'app/loader/loader';
// import toastConfig from 'app/toast/toastConfig';
import toastConfig from 'app/toast/toastConfig';
import {  useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';


interface FormData {
  phoneNumber: string;
  otp: string;
  referralCode?: string;
}

interface OtpData {
  phoneNumber: string;
  otp: string;
}

const LoginScreen: React.FC = () => {
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const navigation = useNavigation();
  const router = useRouter();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      phoneNumber: '',
      otp: '',
      referralCode: '',
    },
  });

  const onSubmitPhone = async (data: FormData) => {
    setLoading(true);
    try {
      await sendOtp({ phoneNumber: data.phoneNumber });
      Toast.show({
        type: 'success',
        text1: 'OTP has been sent to your mobile number',
        position: 'bottom',
      });
      setPhoneNumber(data.phoneNumber); 
      setOtpSent(true);
      setValue('otp', ''); 
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Unexpected Error, Try again',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data: FormData) => {
    setLoading(true);
    try {
      const otpData: OtpData = {
        phoneNumber, 
        otp: data.otp,
      };
      const response = await verifyOtp(otpData);
      console.log(response.data);
      
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.goBack()
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClicked = () => {
    setOtpSent(false);
    reset();
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('loginSkipped', 'true');
    //   navigation.navigate('Home'); // Replace 'Home' with your main app screen's route name
    router.replace('/');
    } catch (error) {
      console.error('Error skipping login:', error);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Login',
    });
  }, [navigation]);


  return (
    <TamaguiProvider>
      <SafeAreaView style={styles.container} >
     
        <YStack justifyContent="center" paddingHorizontal={25}>
          <YStack  justifyContent="center" marginTop={20} padding={10}>
            {!otpSent ? (
              <YStack marginBottom={15}>
                <Controller
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter valid Phone number',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter mobile number"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      style={[
                        styles.textInput,
                        { borderColor: errors.phoneNumber ? '#FF6B6B' : '#ddd' },
                      ]}
                    />
                  )}
                  name="phoneNumber"
                />

                {errors.phoneNumber && (
                  <TamaguiText color="#FF6B6B" fontSize={14} marginBottom={10}>
                    {errors.phoneNumber.message}
                  </TamaguiText>
                )}

                <Button onPress={handleSubmit(onSubmitPhone)} style={styles.primaryButton}>
                  <TamaguiText  fontSize={15} color="#fff" textAlign="center">
                    Send OTP
                  </TamaguiText>
                </Button>
              </YStack>
            ) : (
              <YStack marginBottom={15}>
                <Controller
                  control={control}
                  rules={{
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Enter a valid 6-digit OTP',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter OTP"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="numeric"
                      style={[
                        styles.textInput,
                        { borderColor: errors.otp ? '#FF6B6B' : '#ddd' },
                      ]}
                    />
                  )}
                  name="otp"
                />

                {errors.otp && (
                  <TamaguiText color="#FF6B6B" fontSize={14} marginBottom={10}>
                    {errors.otp.message}
                  </TamaguiText>
                )}

                <Button onPress={handleSubmit(onSubmitOtp)} style={styles.primaryButton}>
                  <TamaguiText  fontSize={15} color="#fff" textAlign="center">
                    Verify OTP
                  </TamaguiText>
                </Button>

                <Button onPress={handleLoginClicked} style={styles.secondaryButton}>
                  <TamaguiText color="#AD40AF"  fontSize={16}>
                    Back to Login
                  </TamaguiText>
                </Button>
              </YStack>
            )}
          </YStack>
        </YStack>
      </SafeAreaView>
      <Toast config={toastConfig} />
    </TamaguiProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  textInput: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#AD40AF',
    borderRadius: 10,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  signUpButton: {
    backgroundColor: '#AD40AF',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButton: {
    alignSelf: 'flex-end',
    margin: 40,
    // marginTop:20
  },
});

export default LoginScreen;