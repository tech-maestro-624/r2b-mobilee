// PriceDetails.tsx
import React from 'react';
import { Card, Text, YStack, XStack } from 'tamagui';
import { View } from 'react-native';
import PriceRow from 'app/price/orderPrice';

interface PriceDetailsProps {
  subTotal: number;
  totalItemTax: number;
  packagingCharges: number;
  packagingTax: number;
  serviceCharge: number;
  platformFee: number;
  platformFeeTax: number;
  deliveryCharge: number;
  discount: number;
  deliveryTip: number;
  grandTotal: number;
}

export default function PriceDetails({
  subTotal,
  totalItemTax,
  packagingCharges,
  packagingTax,
  serviceCharge,
  platformFee,
  platformFeeTax,
  deliveryCharge,
  discount,
  deliveryTip,
  grandTotal,
}: PriceDetailsProps) {
  return (
    <Card
      padding={16}
      backgroundColor="#ffffff"
      borderRadius={8}
      marginTop={16}
      shadowColor="#000"
      shadowOpacity={0.05}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: 2 }}
    >
      <YStack space={12}>
        {/* Section Header */}
        <Text
          fontSize={16}
          fontWeight="700"
          color="#1f2937"
          borderBottomWidth={1}
          borderColor="#e5e7eb"
          paddingBottom={8}
        >
          Price Details
        </Text>

        {/* Price Items */}
        <YStack space={6}>
          <PriceRow label="Subtotal (items)" amount={subTotal} />
          <PriceRow label="Item Tax Extracted" amount={totalItemTax} />
          <PriceRow label="Packaging Charges" amount={packagingCharges} />
          <PriceRow label="Packaging Tax (18%)" amount={packagingTax} />
          <PriceRow label="Service Charge" amount={serviceCharge} />
          <PriceRow label="Platform Fee" amount={platformFee} />
          <PriceRow label="Platform Fee Tax (18%)" amount={platformFeeTax} />
          {deliveryCharge > 0 && (
            <PriceRow label="Delivery Charge" amount={deliveryCharge} />
          )}
          {deliveryTip > 0 && <PriceRow label="Tip" amount={deliveryTip} />}
          <PriceRow label="Discount" amount={-discount} />
        </YStack>

        {/* Divider */}
        <View
          style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 }}
        />

        {/* Grand Total */}
        <XStack justifyContent="space-between" alignItems="center" paddingTop={8}>
          <Text fontSize={18} fontWeight="700" color="#1f2937">
            Grand Total
          </Text>
          <Text fontSize={18} fontWeight="700" color="#10b981">
            ₹{grandTotal.toFixed(2)}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}
