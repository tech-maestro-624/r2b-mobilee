import React, { useEffect, useState } from 'react';
import { YStack, XStack, Text, Button, Theme } from 'tamagui';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { getCoupons } from 'app/api/coupons';

const Offers = () => {
  const [coupons, setCoupons] = useState([]);

  const copyToClipboard = (code) => {
    Clipboard.setStringAsync(code);
    Alert.alert('Copied to Clipboard', `Coupon code "${code}" has been copied!`);
  };

  const fetchCoupons = async () => {
    try {
      const response = await getCoupons({ condition: { createdBy: 'Company' } });
      setCoupons(response.data.coupons);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

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
          {coupons.map((coupon, index) => (
            <XStack
              key={coupon._id}
              space="$4"
              justifyContent="space-between"
              marginBottom={index % 2 === 0 ? 0 : 20} // Add margin bottom for odd items
            >
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
                  {coupon.description}
                </Text>
                
                <Button
                  onPress={() => copyToClipboard(coupon.code)}
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
                    {coupon.code}
                  </Text>
                </Button>
              </YStack>
              {/* Add an empty view for the second column if it's the last item and index is even */}
              {index % 2 === 0 && index === coupons.length - 1 && <YStack width="48%" />}
            </XStack>
          ))}
        </YStack>
      </YStack>
    </Theme>
  );
};

export default Offers;
