// OrderTypeSelection.tsx
import React from 'react'
import { Card, Text, XStack } from 'tamagui'
import { Pressable } from 'react-native'

interface OrderTypeSelectionProps {
  orderType: 'Delivery' | 'Pickup'
  setOrderType: React.Dispatch<React.SetStateAction<'Delivery' | 'Pickup'>>
}

/**
 * This component displays two buttons (Delivery/Pickup),
 * in a style similar to how TipSelection toggles a few buttons.
 * Tapping one sets `orderType`; tapping it again keeps it selected.
 */
export default function OrderTypeSelection({
  orderType,
  setOrderType,
}: OrderTypeSelectionProps) {
  return (
    <Card padding={16} backgroundColor="#ffffff" marginTop={16}>
      <Text fontSize={14} fontWeight="600" color="#1f2937" marginBottom={10}>
        Choose Order Type
      </Text>
      <XStack space={8} flexWrap="wrap">
        {/* DELIVERY BUTTON */}
        <Pressable
          onPress={() => setOrderType('Delivery')}
          style={{
            backgroundColor: orderType === 'Delivery' ? '#a7f3d0' : '#e5e7eb',
            borderRadius: 4,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginRight: 10,
            marginBottom: 8,
          }}
        >
          <Text fontSize={12} color="#1f2937">
            Delivery
          </Text>
        </Pressable>

        {/* PICKUP BUTTON */}
        <Pressable
          onPress={() => setOrderType('Pickup')}
          style={{
            backgroundColor: orderType === 'Pickup' ? '#a7f3d0' : '#e5e7eb',
            borderRadius: 4,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginRight: 10,
            marginBottom: 8,
          }}
        >
          <Text fontSize={12} color="#1f2937">
            Pickup
          </Text>
        </Pressable>
      </XStack>
    </Card>
  )
}
