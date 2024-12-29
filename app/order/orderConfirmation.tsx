// OrderConfirmation.tsx

import React, { useEffect, useLayoutEffect,useRef } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
function OrderConfirmation() {
  const router = useRouter();
  const navigation = useNavigation()
  const animation = useRef<LottieView>(null);

  // Handle the default back button behavior
  useEffect(() => {
    const handleBackPress = () => {
      // Navigate to the home tab
      router.replace('/(tabs)/');
      return true; // Prevent default back action
    };

    // Add event listener for back button press
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    // Cleanup on component unmount
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  }, [router]);

  // Hide the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      {/* <Ionicons name="checkmark-circle-outline" size={64} color="green" />
       */}
       <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 400,
          height: 400,
          backgroundColor: '#ffffff',
        }}
        source={require('../../assets/animations/orderSuccessful.json')}
        // source={require('../../assets/animations/orderCancellation.json')}

      />
      <Text fontSize={20} fontWeight="bold">
      Order received
      </Text>
      <Text textAlign="center" marginTop="$2" color="gray" padding={10}>
      Your cravings just met their match!
      </Text>
    </YStack>
  );
}

export default OrderConfirmation;
