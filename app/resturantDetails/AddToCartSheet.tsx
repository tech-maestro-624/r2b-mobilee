// AddToCartSheet.tsx

import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import {
  Sheet,
  YStack,
  XStack,
  RadioGroup,
  Label,
  Input,
  Checkbox,
} from 'tamagui';
import { AntDesign } from '@expo/vector-icons';

// Interfaces
interface Variant {
  _id: string;
  label: string;
  price: number;
}

interface AddOn {
  _id: string;
  name: string;
  price: number;
}

interface MenuItem {
  _id: string;
  name: string;
  price?: number;
  description: string;
  image: string;
  category: { name: string };
  variants?: Variant[];
  addOns?: AddOn[];
  isAvailable: boolean;
  hasVariants?: boolean;
}

interface AddToCartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: MenuItem | null;
  selectedVariant: string | null;
  setSelectedVariant: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAddOns: string[];
  setSelectedAddOns: React.Dispatch<React.SetStateAction<string[]>>;
  itemQuantity: number;
  setItemQuantity: React.Dispatch<React.SetStateAction<number>>;
  handleConfirmAddToCart: () => void;
  calculateTotal: () => number;
  handleAddOnToggle: (addOnId: string) => void;
  colors: { [key: string]: string };
}

const AddToCartSheet: React.FC<AddToCartSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedItem,
  selectedVariant,
  setSelectedVariant,
  selectedAddOns,
  setSelectedAddOns,
  itemQuantity,
  setItemQuantity,
  handleConfirmAddToCart,
  calculateTotal,
  handleAddOnToggle,
  colors,
}) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame style={{ backgroundColor: '#ffffff' }}>
        <Sheet.Handle />
        <ScrollView>
          <YStack padding={16} space={16}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              {selectedItem?.name}
            </Text>
            {/* Variants */}
            {selectedItem?.hasVariants && selectedItem.variants && selectedItem.variants.length > 0 && (
              <YStack space={8}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                  Variants
                </Text>
                <RadioGroup
                  value={selectedVariant || ''}
                  onValueChange={(value) => setSelectedVariant(value)}
                >
                  {selectedItem.variants.map((variant) => (
                    <XStack
                      key={variant._id}
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical={8}
                    >
                      <Label htmlFor={`variant-${variant._id}`}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: colors.text,
                            fontWeight: selectedVariant === variant._id ? '700' : '400',
                          }}
                        >
                          {variant.label}
                        </Text>
                      </Label>
                      <XStack alignItems="center" space={8}>
                        <Text style={{ fontSize: 14, color: colors.text }}>
                          ₹{variant.price.toFixed(2)}
                        </Text>
                        <RadioGroup.Item
                          value={variant._id}
                          id={`variant-${variant._id}`}
                          checked={selectedVariant === variant._id}
                          unstyled
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor:
                              selectedVariant === variant._id ? colors.primary : colors.border,
                            backgroundColor:
                              selectedVariant === variant._id ? colors.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {selectedVariant === variant._id && (
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: '#fff',
                              }}
                            />
                          )}
                        </RadioGroup.Item>
                      </XStack>
                    </XStack>
                  ))}
                </RadioGroup>
              </YStack>
            )}
            {/* Add-ons */}
            {selectedItem?.addOns && selectedItem.addOns.length > 0 && (
              <YStack space={8}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                  Add-ons
                </Text>
                {selectedItem.addOns.map((addOn) => (
                  <XStack
                    key={addOn._id}
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical={8}
                  >
                    <Label htmlFor={`addon-${addOn._id}`}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          fontWeight: selectedAddOns.includes(addOn._id) ? '700' : '400',
                        }}
                      >
                        {addOn.name}
                      </Text>
                    </Label>
                    <XStack alignItems="center" space={8}>
                      <Text style={{ fontSize: 14, color: colors.text }}>
                        ₹{addOn.price.toFixed(2)}
                      </Text>
                      <Checkbox
                        id={`addon-${addOn._id}`}
                        checked={selectedAddOns.includes(addOn._id)}
                        onCheckedChange={() => handleAddOnToggle(addOn._id)}
                        unstyled
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: selectedAddOns.includes(addOn._id)
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selectedAddOns.includes(addOn._id)
                            ? colors.primary
                            : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selectedAddOns.includes(addOn._id) && (
                          <AntDesign name="check" size={16} color="#fff" />
                        )}
                      </Checkbox>
                    </XStack>
                  </XStack>
                ))}
              </YStack>
            )}
            {/* Quantity Selector */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                Quantity
              </Text>
              <XStack alignItems="center" space={12}>
                <Pressable
                  onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  style={{
                    backgroundColor: colors.lightBackground,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AntDesign name="minus" size={16} color={colors.text} />
                </Pressable>
                <Input
                  value={itemQuantity.toString()}
                  onChangeText={(text) => setItemQuantity(parseInt(text) || 1)}
                  keyboardType="numeric"
                  textAlign="center"
                  width={40}
                  fontSize={14}
                  backgroundColor="#ffffff"
                  color={colors.text}
                />
                <Pressable
                  onPress={() => setItemQuantity(itemQuantity + 1)}
                  style={{
                    backgroundColor: colors.lightBackground,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AntDesign name="plus" size={16} color={colors.text} />
                </Pressable>
              </XStack>
            </XStack>
            {/* Total Price */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>
                Total
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>
                ₹{calculateTotal().toFixed(2)}
              </Text>
            </XStack>
            {/* Add to Cart Button */}
            <Pressable
              onPress={handleConfirmAddToCart}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <AntDesign name="shoppingcart" size={20} color={colors.buttonText} />
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.buttonText,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                Add to Cart - ₹{calculateTotal().toFixed(2)}
              </Text>
            </Pressable>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
};

export default AddToCartSheet;
