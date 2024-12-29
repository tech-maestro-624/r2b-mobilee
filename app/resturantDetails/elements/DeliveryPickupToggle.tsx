// app/restaurantMenu/components/DeliveryPickupToggle.tsx

import React from 'react'
import { Pressable, Text } from 'react-native'
import { XStack } from 'tamagui'
import { SkeletonBox } from './Skeleton'

const colors = {
  lightBackground: '#f9f9f9',
  selectedBackground: '#e6f2fa',
  text: '#333333',
  subtleText: '#888888',
}

interface DeliveryPickupToggleProps {
  loading: boolean
  deliveryOption: 'Delivery' | 'Pickup'
  setDeliveryOption: React.Dispatch<React.SetStateAction<'Delivery' | 'Pickup'>>
}

export default function DeliveryPickupToggle({
  loading,
  deliveryOption,
  setDeliveryOption,
}: DeliveryPickupToggleProps) {
  if (loading) {
    return (
      <XStack
        paddingVertical={5}
        backgroundColor={colors.lightBackground}
        borderRadius={16}
        marginHorizontal={16}
        marginBottom={16}
        justifyContent="space-between"
      >
        <SkeletonBox width="48%" height={40} borderRadius={12} />
        <SkeletonBox width="48%" height={40} borderRadius={12} />
      </XStack>
    )
  }

  return (
    <XStack
      paddingVertical={5}
      backgroundColor={colors.lightBackground}
      borderRadius={16}
      marginHorizontal={16}
      marginBottom={16}
      justifyContent="space-between"
    >
      {['Delivery', 'Pickup'].map((option) => (
        <Pressable
          key={option}
          onPress={() => setDeliveryOption(option as 'Delivery' | 'Pickup')}
          style={{
            backgroundColor: deliveryOption === option ? colors.selectedBackground : 'transparent',
            flex: 1,
            paddingVertical: 8,
            borderRadius: 12,
            marginHorizontal: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: deliveryOption === option ? colors.text : colors.subtleText,
              fontSize: 16,
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </XStack>
  )
}
