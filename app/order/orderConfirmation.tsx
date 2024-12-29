// OrderConfirmation.tsx

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';

function OrderConfirmation() {
  const router = useRouter();
  const navigation = useNavigation();
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
      <LottieView
        autoPlay
        ref={animation}
        style={styles.animation}
        source={require('../../assets/animations/orderSuccessful.json')}
      />
      <Text fontSize={20} fontWeight="bold">
        Order received
      </Text>
      <Text textAlign="center" marginTop="$2" color="gray" padding={10}>
        Your cravings just met their match!
      </Text>
      <Button
                        size="$4"
                        bg="#333A2F"
                        color="white"
                        onPress={() => router.push('/order/OrderTracking')}
                      >
                       <Text color='#ffffff'>Track Your Order Now</Text>
                      </Button>
    </YStack>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 400,
    height: 400,
    backgroundColor: '#ffffff',
  },
  trackOrderButton: {
    marginTop: 20,
    backgroundColor: '#38b2ac', // Tailwind teal green
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default OrderConfirmation;