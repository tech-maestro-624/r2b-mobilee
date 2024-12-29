import React from 'react'
import { ScrollView, View } from 'react-native'
import { YStack, XStack, Text, Button, Image } from 'tamagui'
import { Link } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { FontAwesome5 } from '@expo/vector-icons'
import { SkeletonBox, SkeletonText } from './Skeleton'

interface Restaurant {
  _id: string
  name: string
  imageUrl?: string
  rating: number
  nearestBranch?: { distanceInKm?: number }
}

interface TopRatedSectionProps {
  loading: boolean
  topRatedRestaurants: Restaurant[]
  updateOrderState: (key: string, value: any) => void
}

export default function TopRatedSection({
  loading,
  topRatedRestaurants,
  updateOrderState,
}: TopRatedSectionProps) {
  return (
    <YStack paddingHorizontal={20} paddingBottom={20}>
      <Text color="#111818" fontSize={16} fontWeight="700" marginBottom={12}>
        Top Rated
      </Text>
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space={16}>
            {[...Array(3)].map((_, idx) => (
              <YStack
                key={idx}
                width={160}
                backgroundColor="white"
                borderRadius={8}
                borderWidth={0.5}
                borderColor="#E0E0E0"
                padding={12}
              >
                <SkeletonBox
                  width="100%"
                  height={120}
                  borderRadius={8}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonText width="80%" style={{ marginBottom: 4 }} />
                <SkeletonText width="50%" style={{ marginBottom: 8 }} />
                <SkeletonBox width="100%" height={40} borderRadius={4} />
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      ) : topRatedRestaurants.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space={16}>
            {topRatedRestaurants.map((restaurant) => (
              <YStack
                key={restaurant._id}
                width={160}
                backgroundColor="white"
                borderRadius={8}
                shadowColor="rgba(0, 0, 0, 0.1)"
                shadowOpacity={1}
                shadowRadius={4}
                shadowOffset={{ width: 0, height: 0 }}
                borderWidth={0.5}
                borderColor="#E0E0E0"
                position="relative"
              >
                <Image
                  source={{
                    uri: restaurant.imageUrl || 'https://via.placeholder.com/160x120',
                  }}
                  width="100%"
                  height={120}
                  borderRadius={8}
                  alt={restaurant.name}
                />
                <YStack padding={12} flex={1} justifyContent="space-between">
                  <Text color="#111818" fontSize={14} fontWeight="500" numberOfLines={1}>
                    {restaurant.name}
                  </Text>

                  {/* Distance & Rating */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="location-on" size={16} color="#608a8a" />
                      <Text style={{ color: '#608a8a', fontSize: 12, marginLeft: 4 }}>
                        {restaurant?.nearestBranch?.distanceInKm} km
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="star" size={16} color="#608a8a" />
                      <Text style={{ color: '#608a8a', fontSize: 12, marginLeft: 4 }}>
                        {restaurant?.rating}
                      </Text>
                    </View>
                  </View>

                  {/* Button */}
                  <Link
                    href="/resturantDetails/resturant"
                    asChild
                    onPress={() => {
                      updateOrderState('restaurantId', restaurant?._id)
                    }}
                  >
                    <Button
                      backgroundColor="#f0f5f5"
                      borderRadius={4}
                      height={40}
                      marginTop={8}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="#111818" fontSize={12} fontWeight="700">
                        Order Now
                      </Text>
                    </Button>
                  </Link>
                </YStack>

                {/* White triangle (bottom center) */}
                <YStack
                  position="absolute"
                  bottom={-10}
                  left="50%"
                  width={0}
                  height={0}
                  borderLeftWidth={10}
                  borderRightWidth={10}
                  borderTopWidth={10}
                  borderLeftColor="transparent"
                  borderRightColor="transparent"
                  borderTopColor="white"
                />
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      ) : (
        !loading && (
          <Text fontSize={14} color="#6b7280" textAlign="center">
            No top-rated restaurants available at the moment.
          </Text>
        )
      )}
    </YStack>
  )
}
