// CartFooter.tsx
import React from 'react';
import { YStack, XStack, Text, Button, Label, Paragraph, RadioGroup } from 'tamagui';

interface CartFooterProps {
  grandTotal: number;
  selectedAddress: any;
  placeOrderFunc: () => void;
  orderType: 'Delivery' | 'Pickup';
  setOrderType: React.Dispatch<React.SetStateAction<'Delivery' | 'Pickup'>>;
}

export default function CartFooter({
  grandTotal,
  placeOrderFunc,
}: CartFooterProps) {
  return (
    <YStack
      paddingHorizontal={20}
      paddingVertical={10}
      backgroundColor="#ffffff"
      borderTopWidth={1}
      borderColor="#e5e7eb"
      shadowColor="#000"
      shadowOpacity={0.05}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: -2 }}
    >
      {/* Toggle: Delivery or Pickup */}
      {/* <YStack marginBottom={8}>
        <Text fontWeight="600" marginBottom={4} color="#1f2937">
          Choose Order Type:
        </Text>
        <RadioGroup
          value={orderType}
          onValueChange={(val) => setOrderType(val as 'Delivery' | 'Pickup')}
          orientation="horizontal"
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <RadioGroup.Item value="Delivery" id="delivery-radio">
            <Label htmlFor="delivery-radio">
              <Paragraph size="$2" fontWeight="700" color="#1f2937">
                Delivery
              </Paragraph>
            </Label>
          </RadioGroup.Item>

          <RadioGroup.Item value="Pickup" id="pickup-radio" style={{ marginLeft: 12 }}>
            <Label htmlFor="pickup-radio">
              <Paragraph size="$2" fontWeight="700" color="#1f2937">
                Pickup
              </Paragraph>
            </Label>
          </RadioGroup.Item>
        </RadioGroup>
      </YStack> */}

      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <Text fontSize={20} fontWeight="700" color="#1f2937">
            ₹{grandTotal.toFixed(2)}
          </Text>
        </YStack>

        <Button
          size="$4"
          backgroundColor="#10b981"
          color="#fff"
          borderRadius={16}
          paddingHorizontal={32}
          onPress={placeOrderFunc}
        >
          Place Order
        </Button>
      </XStack>
    </YStack>
  );
}
