// CartHeader.tsx
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { MapPin, ChevronDown } from '@tamagui/lucide-icons';

interface CartHeaderProps {
  loading: boolean;
  cartItems: any[];
  branch: any;
  selectedAddress: any;
  setIsSheetOpen: (val: boolean) => void;
}

export default function CartHeader({
  loading,
  cartItems,
  branch,
  selectedAddress,
  setIsSheetOpen,
}: CartHeaderProps) {
  // If loading, display skeleton
  if (loading) {
    return (
      <YStack
        paddingHorizontal={20}
        paddingTop={40}
        paddingBottom={16}
        backgroundColor="#ffffff"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={10}
        shadowOffset={{ width: 0, height: 2 }}
      >
        <YStack marginBottom={8} width="60%" height={18} backgroundColor="#e0e0e0" />
        <YStack marginBottom={16} width="40%" height={10} backgroundColor="#e0e0e0" />
        <YStack width="100%" height={20} backgroundColor="#e0e0e0" />
      </YStack>
    );
  }

  // If cart empty, skip rendering the header
  if (!loading && cartItems.length === 0) {
    return null;
  }

  return (
    <YStack
      paddingHorizontal={20}
      paddingTop={40}
      paddingBottom={16}
      backgroundColor="#ffffff"
      shadowColor="#000"
      shadowOpacity={0.05}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: 2 }}
    >
      <YStack>
        <Text fontSize={18} fontWeight="700" color="#1f2937">
          {branch?.restaurant?.name || 'Restaurant Name'}
        </Text>
        <Text fontSize={10} fontWeight="700" color="gray">
          {branch.address}
        </Text>
      </YStack>
      <Pressable onPress={() => setIsSheetOpen(true)}>
        <XStack alignItems="center" marginTop={8}>
          <MapPin size={16} color="#9ca3af" />
          <Text fontSize={14} color="#6b7280" marginLeft={4}>
            Deliver to{' '}
            <Text fontWeight="600">{selectedAddress?.name || 'Select Address'}</Text>
          </Text>
          <ChevronDown size={16} color="#6b7280" />
        </XStack>
      </Pressable>
    </YStack>
  );
}
