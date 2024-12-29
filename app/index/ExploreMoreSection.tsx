import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Image } from 'tamagui'
import { Link } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { SkeletonBox, SkeletonText } from './Skeleton'

interface Restaurant {
  _id: string
  name: string
  description?: string
  rating: number
  imageUrl?: string
}

interface ExploreMoreSectionProps {
  loading: boolean
  restaurants: Restaurant[]
  updateOrderState: (key: string, value: any) => void
}

export default function ExploreMoreSection({
  loading,
  restaurants,
  updateOrderState,
}: ExploreMoreSectionProps) {
  return (
    <YStack
      padding={16}
      backgroundColor="#f9f9f9"
      borderTopWidth={1}
      borderTopColor="#E0E0E0"
    >
      <Text color="#111818" fontSize={16} fontWeight="700" marginBottom={12}>
        Explore More
      </Text>
      {loading ? (
        <YStack space="$3">
          {[...Array(3)].map((_, idx) => (
            <YStack
              key={idx}
              padding={12}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={0.5}
              borderColor="#E0E0E0"
              shadowColor="rgba(0, 0, 0, 0.05)"
              shadowOpacity={1}
              shadowRadius={2}
              shadowOffset={{ width: 0, height: 1 }}
            >
              <XStack alignItems="center">
                <SkeletonBox
                  width={90}
                  height={90}
                  borderRadius={8}
                  style={{ marginRight: 12 }}
                />
                <YStack flex={1}>
                  <SkeletonText width="80%" style={{ marginBottom: 6 }} />
                  <SkeletonText width="60%" style={{ marginBottom: 6 }} />
                  <SkeletonText width="30%" />
                </YStack>
              </XStack>
            </YStack>
          ))}
        </YStack>
      ) : restaurants.length > 0 ? (
        <YStack space="$3">
          {restaurants.map((restaurant) => (
            <Link
              href="/resturantDetails/resturant"
              asChild
              key={restaurant._id}
              onPress={() => {
                updateOrderState('restaurantId', restaurant?._id)
              }}
            >
              <TouchableOpacity activeOpacity={0.9}>
                <YStack
                  padding={12}
                  backgroundColor="white"
                  borderRadius={8}
                  borderWidth={0.5}
                  borderColor="#E0E0E0"
                  shadowColor="rgba(0, 0, 0, 0.05)"
                  shadowOpacity={1}
                  shadowRadius={2}
                  shadowOffset={{ width: 0, height: 1 }}
                >
                  <XStack alignItems="center">
                    <Image
                      source={{
                        uri:
                          restaurant.imageUrl || 'https://via.placeholder.com/80x80',
                      }}
                      width={90}
                      height={90}
                      borderRadius={8}
                      alt={restaurant.name}
                    />
                    <YStack flex={1} paddingHorizontal={12}>
                      <Text
                        color="#111818"
                        fontSize={14}
                        fontWeight="600"
                        marginBottom={4}
                      >
                        {restaurant.name}
                      </Text>
                      {restaurant.description && (
                        <Text
                          color="#6b7280"
                          fontSize={12}
                          numberOfLines={2}
                          marginBottom={4}
                        >
                          {restaurant.description}
                        </Text>
                      )}
                      <XStack alignItems="center">
                        <MaterialIcons name="star" size={14} color="#fbbf24" />
                        <Text color="#608a8a" fontSize={12} marginLeft={4}>
                          {restaurant?.rating}
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>
                </YStack>
              </TouchableOpacity>
            </Link>
          ))}
        </YStack>
      ) : (
        !loading && (
          <Text fontSize={14} color="#6b7280" textAlign="center">
            No restaurants available to explore right now.
          </Text>
        )
      )}
    </YStack>
  )
}
