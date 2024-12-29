// app/restaurantMenu/components/FoodItemsList.tsx

import React from 'react'
import { View, Image, Pressable, Text, TouchableOpacity } from 'react-native'
import { YStack, XStack } from 'tamagui'
import { AntDesign } from '@expo/vector-icons'
import { SkeletonBox, SkeletonText } from './Skeleton'

const colors = {
  text: '#333333',
  subtleText: '#888888',
  primary: '#3498db',
  buttonText: '#ffffff',
  lightBackground: '#f9f9f9',
  accordionHeaderBackground: '#f6f6f6', // light gray for headers
  accordionIcon: '#555555',
  divider: '#eee', // light divider lines
}

interface MenuItem {
  _id: string
  name: string
  price?: number
  description: string
  imageUrl?: string
  isAvailable: boolean
  hasVariants?: boolean
  variants?: { _id: string; price: number }[]
}

interface FoodItemsListProps {
  loading: boolean
  showFood: boolean
  expandedCategories: Set<string>
  toggleCategory: (catName: string) => void
  reorderedCategories: string[]
  foodItems: { [categoryName: string]: MenuItem[] }
  getItemQuantityInCart: (menuItem: MenuItem) => number
  incrementCartItem: (menuItem: MenuItem) => void
  decrementCartItem: (menuItem: MenuItem) => void
  handleAddToCart: (menuItem: MenuItem) => void
}

export default function FoodItemsList({
  loading,
  showFood,
  expandedCategories,
  toggleCategory,
  reorderedCategories,
  foodItems,
  getItemQuantityInCart,
  incrementCartItem,
  decrementCartItem,
  handleAddToCart,
}: FoodItemsListProps) {
  // -----------------------------
  // 1) Show skeleton if loading
  // -----------------------------
  if (loading || !showFood) {
    return (
      <YStack paddingHorizontal={16} paddingTop={24} paddingBottom={10}>
        {[...Array(3)].map((_, idx) => (
          <View key={idx} style={{ marginBottom: 20 }}>
            <SkeletonText width="40%" height={16} style={{ marginBottom: 12 }} />
            {[...Array(2)].map((__, itemIdx) => (
              <XStack
                key={itemIdx}
                paddingVertical={12}
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack space={12} flex={1}>
                  <SkeletonBox width={70} height={70} borderRadius={8} />
                  <YStack flex={1}>
                    <SkeletonText width="80%" style={{ marginBottom: 6 }} />
                    <SkeletonText width="60%" style={{ marginBottom: 6 }} />
                    <SkeletonText width="40%" />
                  </YStack>
                </XStack>
                <SkeletonBox width={80} height={32} borderRadius={16} />
              </XStack>
            ))}
          </View>
        ))}
      </YStack>
    )
  }

  // -----------------------------
  // 2) Actual Food List
  // -----------------------------
  return (
    <YStack marginBottom={60}>
      {reorderedCategories.map((category) => {
        const items = foodItems[category]
        if (!items) return null

        return (
          <YStack
            key={category}
            // Just space around the category
            style={{
              marginHorizontal: 16,
              marginVertical: 8,
            }}
          >
            {/* Accordion Header */}
            <TouchableOpacity
              onPress={() => toggleCategory(category)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.accordionHeaderBackground,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 6, // slight rounding
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {category}
              </Text>
              <AntDesign
                name={expandedCategories.has(category) ? 'up' : 'down'}
                size={20}
                color={colors.accordionIcon}
              />
            </TouchableOpacity>

            {/* Items */}
            {expandedCategories.has(category) && (
              <YStack style={{ marginTop: 0 }}>
                {items.map((item, idx) => {
                  const itemAvailable = item.isAvailable
                  const itemQuantity = getItemQuantityInCart(item)
                  // If the item has variants, just show the first variant price for display
                  const itemPrice = item.hasVariants
                    ? item.variants?.[0]?.price.toFixed(2)
                    : item.price?.toFixed(2)

                  // For a subtle divider line between items:
                  const isLast = idx === items.length - 1

                  return (
                    <XStack
                      key={item._id}
                      paddingVertical={12}
                      paddingHorizontal={16}
                      alignItems="center"
                      justifyContent="space-between"
                      // Light bottom divider unless last item
                      style={{
                        opacity: itemAvailable ? 1 : 0.5,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: colors.divider,
                      }}
                    >
                      <XStack space={12} flex={1}>
                        <Image
                          source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 8,
                            backgroundColor: '#fafafa',
                          }}
                          resizeMode="cover"
                        />
                        <YStack flex={1}>
                          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                            {item.name}
                          </Text>
                          <Text
                            style={{
                              color: colors.subtleText,
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            ₹{itemPrice}
                          </Text>
                          {item.description?.length > 0 && (
                            <Text
                              style={{
                                color: colors.subtleText,
                                fontSize: 12,
                                marginTop: 2,
                              }}
                            >
                              {item.description}
                            </Text>
                          )}
                        </YStack>
                      </XStack>

                      <YStack alignItems="center" justifyContent="center">
                        {itemQuantity > 0 && itemAvailable ? (
                          <XStack alignItems="center" space={8}>
                            <Pressable
                              onPress={() => decrementCartItem(item)}
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
                            <Text
                              style={{
                                color: colors.text,
                                fontSize: 16,
                                fontWeight: '700',
                              }}
                            >
                              {itemQuantity}
                            </Text>
                            <Pressable
                              onPress={() => incrementCartItem(item)}
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
                        ) : (
                          <Pressable
                            onPress={() => itemAvailable && handleAddToCart(item)}
                            style={{
                              backgroundColor: itemAvailable ? colors.primary : colors.lightBackground,
                              borderRadius: 16,
                              paddingVertical: 8,
                              paddingHorizontal: 30,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            disabled={!itemAvailable}
                          >
                            <Text
                              style={{
                                color: colors.buttonText,
                                fontSize: 14,
                                fontWeight: '700',
                              }}
                            >
                              {itemAvailable ? 'Add' : 'Unavailable'}
                            </Text>
                          </Pressable>
                        )}
                      </YStack>
                    </XStack>
                  )
                })}
              </YStack>
            )}
          </YStack>
        )
      })}
    </YStack>
  )
}
