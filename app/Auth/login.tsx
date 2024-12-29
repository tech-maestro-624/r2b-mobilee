import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { TamaguiProvider, YStack, Button, Input, Text } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router';
import { useAuth } from 'app/context/AuthContext';
import { sendOtp, verifyOtp } from 'app/api/auth';
// import NotificationHandler from '../notificationHandle';
import NotificationHandler from 'app/notification/notification';
import toastConfig from 'app/toast/toastConfig';

interface FormData {
  phoneNumber: string;
  otp: string;
}

const LoginScreen: React.FC = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phoneNumber: '',
      otp: '',
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
      const otpData = {
        phoneNumber,
        otp: data.otp,
      };
      const response = await verifyOtp(otpData);
      console.log(response.data.user);
      
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      router.replace('/');
      login();
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

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('loginSkipped', 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error skipping login:', error);
    }
  };

  return (
    <TamaguiProvider>
      <YStack flex={1} bg="#6ECCB8">
      <Image
            source={require('../../assets/images/login.webp')}
            style={[styles.topImage, StyleSheet.absoluteFill]}
          />
        {/* Top Section with Image */}
        <YStack flex={0.65} position="relative">
          
          <YStack
            alignItems="center"
            justifyContent="flex-start"
            paddingTop="$10" 
            flex={1}
          >
            <Text
              fontSize="$8"
              fontWeight="bold"
              color="#fff"
              style={{
                letterSpacing: 2,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              ROLL2BOWL
            </Text>
          </YStack>
        </YStack>

        {/* Bottom Section with Form */}
        <YStack
          flex={0.35}
          bg="white"
          borderTopLeftRadius={30}
          borderTopRightRadius={30}
          padding="$4"
          alignItems="center"
          // justifyContent="space-between"
        >
          <YStack width="100%">
            <YStack alignItems="center" marginVertical='$4' >
              <Text fontSize="$4" color="#333" textAlign="center">
                Bengaluru’s #1 No Commission
              </Text>
              <Text fontSize="$4" color="#333" textAlign="center" marginTop="$1">
                Food Delivery App
              </Text>
            </YStack>

            <YStack width="100%" alignItems="center" paddingHorizontal="$4">
              {!otpSent ? (
               <Controller
               control={control}
               name="phoneNumber"
               rules={{
                 required: 'Phone number is required',
                 pattern: {
                   value: /^[6-9]\d{9}$/,
                   message: 'Enter a valid phone number',
                 },
               }}
               render={({ field: { onChange, value } }) => (
                 <YStack
                   flexDirection="row"
                   alignItems="center"
                   width="100%"
                   backgroundColor="#ffffff"
                   borderWidth={1}
                   borderColor={errors.phoneNumber ? 'red' : '#ccc'}
                   borderRadius={8}
                   paddingHorizontal="$4"
                   marginVertical="$3"
                 >
                   {/* Flag Icon */}
                   <Image
                     source={require('../../assets/images/flag.png')} // Add your flag image here
                     style={{
                       width: 24,
                       height: 16,
                       marginRight: 8,
                     }}
                   />
                   <Text
                     fontSize="$4"
                     color="#333"
                    //  marginRight={4}s
                     fontWeight="bold"
                   >
                     +91
                   </Text>
                   {/* Input Field */}
                   <Input
  placeholder="Enter mobile number"
  keyboardType="phone-pad"
  onChangeText={onChange}
  value={value}
  size="$4"
  flex={1} // Let the input take the remaining space
  borderWidth={0} // Ensure no border width
  backgroundColor="#ffffff"
  style={{
    borderColor: 'transparent', // Explicitly set the border color to transparent
    outlineStyle: 'none', // Remove outline on web (optional for web-based implementations)
  }}
/>

                 </YStack>
               )}
             />
              ) : (
                <Controller
                  control={control}
                  name="otp"
                  rules={{
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Enter a valid 6-digit OTP',
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Enter OTP"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value}
                      size="$4"
                      width="100%"
                      borderColor={errors.otp ? 'red' : '#ccc'}
                      //  marginVertical="$4"
                      marginTop='$4'
                      backgroundColor='#ffffff'
                    />
                  )}
                />
              )}

              {errors.phoneNumber && !otpSent && (
                <Text color="red" fontSize="$1" marginBottom="$2">
                  {errors.phoneNumber.message}
                </Text>
              )}
              {errors.otp && otpSent && (
                <Text color="red" fontSize="$1" marginBottom="$2">
                  {errors.otp.message}
                </Text>
              )}

              {!otpSent ? (
                <Button
                  size="$4"
                  bg="#333A2F"
                  color="white"
                  width="100%"
                  onPress={handleSubmit(onSubmitPhone)}
                >
                 <Text color='#ffffff'> Login / Sign Up</Text>
                </Button>
              ) : (
                <Button
                  size="$4"
                  bg="#333A2F"
                  color="white"
                  width="100%"
                  onPress={handleSubmit(onSubmitOtp)}
                  marginTop='$3'
                >
                 <Text color='#ffffff'> Verify OTP </Text>
                </Button>
              )}
            </YStack>
          </YStack>

          <YStack alignItems="center"   marginVertical="$4">
            <Text fontSize="$2" textAlign="center">
              By continuing, you are accepting to our
            </Text>
            <YStack
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              space="$2"
            >
              <Link href="/policies/terms" asChild>
                <Text
                  fontSize="$2"
                  textAlign="center"
                  fontWeight="bold"
                  textDecorationLine="underline"
                >
                  Terms
                </Text>
              </Link>
              <Text fontSize="$2" textAlign="center">
                &
              </Text>
              <Link href="/policies/services" asChild>
                <Text
                  fontSize="$2"
                  textAlign="center"
                  fontWeight="bold"
                  textDecorationLine="underline"
                >
                  Services
                </Text>
              </Link>
              <Text fontSize="$2" textAlign="center">
                &
              </Text>
              <Link href="/policies/content" asChild>
                <Text
                  fontSize="$2"
                  textAlign="center"
                  fontWeight="bold"
                  textDecorationLine="underline"
                >
                  Content Policy
                </Text>
              </Link>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
      <Toast config={toastConfig} />
      <NotificationHandler setPushToken={setExpoPushToken} />
    </TamaguiProvider>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  topImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
