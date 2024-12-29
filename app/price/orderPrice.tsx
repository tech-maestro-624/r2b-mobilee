// PriceRow.tsx
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { DollarSign, Percent, Minus } from '@tamagui/lucide-icons';

interface PriceRowProps {
  label: string;
  amount: number;
}

const PriceRow: React.FC<PriceRowProps> = ({ label, amount }) => {
  const isNegative = amount < 0;
  let Icon = null;

  if (label.toLowerCase().includes('tax')) {
    Icon = <Percent size={16} color="#6b7280" />;
  } else if (label.toLowerCase().includes('discount')) {
    Icon = <Minus size={16} color="#ef4444" />;
  } else {
    Icon = <DollarSign size={16} color="#6b7280" />;
  }

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={4}>
      <XStack alignItems="center" space={4}>
        <Text fontSize={14} color="#4b5563">
          {label}
        </Text>
      </XStack>
      <Text fontSize={14} color={isNegative ? "#ef4444" : "#1f2937"}>
        {isNegative ? `-₹${Math.abs(amount).toFixed(2)}` : `₹${amount.toFixed(2)}`}
      </Text>
    </XStack>
  );
};

export default PriceRow;
