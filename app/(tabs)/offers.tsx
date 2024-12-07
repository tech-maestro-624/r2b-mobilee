import React from 'react';
import { YStack, XStack, Text, Button, Separator, Theme } from 'tamagui';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

const Offers = () => {
  const copyToClipboard = (code) => {
    Clipboard.setStringAsync(code);
    Alert.alert('Copied to Clipboard', `Coupon code "${code}" has been copied!`);
  };

  return (
    <Theme name="light">
      <YStack backgroundColor="#FAFAFA" flex={1} padding="$4" paddingTop={30}>
        {/* Header */}
        <Text
          fontSize="$8"
          fontWeight="bold"
          color="#333333"
          textAlign="center"
        >
          DEALS OF THE DAY
        </Text>

        {/* Offer Cards */}
        <YStack space="$6" marginTop={20}>
          <XStack space="$4" justifyContent="space-between">
            {/* Card 1 */}
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius="$6"
              padding="$4"
              shadowColor="#00000020"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={6}
              width="48%"
              space="$3"
            >
              <Text fontWeight="700" fontSize="$5" color="#FF7F50">
                Flat 50% OFF
              </Text>
              <Text fontSize="$4" color="#666666">
                Get up to ₹150 off on your first order!
              </Text>
              <Button
                onPress={() => copyToClipboard('PIZZA150')}
                style={{
                  borderWidth: 1,
                  borderStyle: 'dotted',
                  borderColor: '#FF7F50',
                  backgroundColor: 'transparent',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FF7F50', fontWeight: 'bold' }}>
                  PIZZA150
                </Text>
              </Button>
            </YStack>

            {/* Card 2 */}
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius="$6"
              padding="$4"
              shadowColor="#00000020"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={6}
              width="48%"
              space="$3"
            >
              <Text fontWeight="700" fontSize="$5" color="#FF7F50">
                Free Delivery
              </Text>
              <Text fontSize="$4" color="#666666">
                Enjoy free delivery on every order, no minimum value required!
              </Text>
              <Button
                onPress={() => copyToClipboard('FREEDEL')}
                style={{
                  borderWidth: 1,
                  borderStyle: 'dotted',
                  borderColor: '#FF7F50',
                  backgroundColor: 'transparent',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FF7F50', fontWeight: 'bold' }}>
                  FREEDEL
                </Text>
              </Button>
            </YStack>
          </XStack>

          <XStack space="$4" justifyContent="space-between">
            {/* Card 3 */}
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius="$6"
              padding="$4"
              shadowColor="#00000020"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={6}
              width="48%"
              space="$3"
            >
              <Text fontWeight="700" fontSize="$5" color="#FF7F50">
                Free Chocolava Cake
              </Text>
              <Text fontSize="$4" color="#666666">
                Get a free Chocolava Cake with every order!
              </Text>
              <Button
                onPress={() => copyToClipboard('FREEDELIGHT')}
                style={{
                  borderWidth: 1,
                  borderStyle: 'dotted',
                  borderColor: '#FF7F50',
                  backgroundColor: 'transparent',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FF7F50', fontWeight: 'bold' }}>
                  FREEDELIGHT
                </Text>
              </Button>
            </YStack>
            <YStack width="48%" />
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default Offers;
