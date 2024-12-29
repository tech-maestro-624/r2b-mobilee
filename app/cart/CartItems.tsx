// CartItems.tsx
import React from 'react';
import { YStack, XStack, Text, Image, Card } from 'tamagui';
import { Pressable, View } from 'react-native';
import { Plus, Minus } from '@tamagui/lucide-icons';

interface FoodItem {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  variant?: any;
  addOns?: any[];
}

interface CartItemsProps {
  cartItems: FoodItem[];
  loading?: boolean;
  empty?: boolean;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
}

const SkeletonBox = ({
  width,
  height,
  borderRadius = 4,
  style = {},
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => (
  <View style={[{ width, height, backgroundColor: '#e0e0e0', borderRadius }, style]} />
);

const SkeletonText = ({
  width,
  height = 10,
  style = {},
}: {
  width: number | string;
  height?: number;
  style?: any;
}) => <SkeletonBox width={width} height={height} borderRadius={4} style={style} />;

export default function CartItems({
  cartItems,
  loading,
  empty,
  incrementQuantity,
  decrementQuantity,
}: CartItemsProps) {
  if (loading) {
    return (
      <YStack paddingHorizontal={5} paddingTop={20} space={16}>
        <Card padding={16} backgroundColor="#ffffff">
          {[...Array(2)].map((_, idx) => (
            <XStack key={idx} space={8} alignItems="flex-start" marginVertical={4}>
              <SkeletonBox width={70} height={70} borderRadius={12} />
              <YStack flex={1} space={4}>
                <SkeletonText width="60%" style={{ marginBottom: 4 }} />
                <SkeletonText width="40%" style={{ marginBottom: 4 }} />
              </YStack>
              <YStack alignItems="flex-end">
                <SkeletonBox
                  width={70}
                  height={20}
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonText width={50} />
              </YStack>
            </XStack>
          ))}
        </Card>
      </YStack>
    );
  }

  if (empty) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={20}>
        <Text fontSize={20} fontWeight="700" color="#1f2937" textAlign="center" marginBottom={8}>
          Your cart is empty
        </Text>
        <Text fontSize={14} color="#6b7280" textAlign="center" marginBottom={20}>
          It looks like you haven't added anything yet. Discover delicious meals from our menu and
          get them delivered straight to your door.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack paddingHorizontal={5} paddingTop={20} space={16}>
      <Card padding={16} backgroundColor="#ffffff">
        {cartItems.map((item: FoodItem, index: number) => (
          <XStack
            key={`${item.id}-${index}`}
            space={8}
            alignItems="flex-start"
            marginVertical={4}
          >
            <Image
              source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
              style={{ width: 70, height: 70, borderRadius: 8 }}
            />
            <YStack flex={1} space={4}>
              <Text fontSize={12} fontWeight="700" color="#1f2937">
                {item.name}
              </Text>
              {item.variant && (
                <Text fontSize={10} color="#6b7280">
                  {item.variant.label}
                </Text>
              )}
              {item.addOns && item.addOns.length > 0 && (
                <Text fontSize={12} color="#6b7280">
                  Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                </Text>
              )}
            </YStack>
            <YStack alignItems="flex-end">
              <XStack
                alignItems="center"
                borderRadius={4}
                overflow="hidden"
                borderColor="#ababab"
                borderWidth={1}
              >
                <Pressable
                  onPress={() => decrementQuantity(item.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                  }}
                >
                  <Minus size={10} color="#1f2937" />
                </Pressable>
                <Text paddingHorizontal={6} fontSize={12} color="#000">
                  {item.quantity}
                </Text>
                <Pressable
                  onPress={() => incrementQuantity(item.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                  }}
                >
                  <Plus size={10} color="#1f2937" />
                </Pressable>
              </XStack>
              <Text
                fontSize={14}
                alignSelf="flex-start"
                fontWeight="600"
                marginVertical={2}
                color="#1f2937"
              >
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </YStack>
          </XStack>
        ))}
      </Card>
    </YStack>
  );
}
