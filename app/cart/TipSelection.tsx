// TipSelection.tsx
import React from 'react';
import { Card, Text, XStack, YStack } from 'tamagui';
import { Pressable } from 'react-native';

interface TipSelectionProps {
  deliveryTip: number | null;
  handleTipSelection: (val: number) => void;
}

export default function TipSelection({
  deliveryTip,
  handleTipSelection,
}: TipSelectionProps) {
  const tipOptions = [10, 20, 30, 40];

  return (
    <Card padding={16} backgroundColor="#ffffff" marginTop={16}>
      <YStack space={12}>
        <Text fontSize={14} fontWeight="600" color="#1f2937">
          Leave a Tip
        </Text>
        <XStack space={8} flexWrap="wrap">
          {tipOptions.map((amount) => {
            const isSelected = deliveryTip === amount;
            return (
              <Pressable
                key={amount}
                onPress={() => handleTipSelection(amount)}
                style={{
                  backgroundColor: isSelected ? '#a7f3d0' : '#e5e7eb',
                  borderRadius: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: 10,
                  marginBottom: 8,
                }}
              >
                <Text fontSize={12} color="#1f2937">
                  ₹ {amount}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
        {deliveryTip !== null && deliveryTip > 0 && (
          <Text fontSize={12} color="#6b7280">
            You've added a ₹{deliveryTip} tip
          </Text>
        )}
      </YStack>
    </Card>
  );
}
