// app/restaurantMenu/components/RestaurantHeader.tsx

import React from 'react'
import { Image, View } from 'react-native'
import { YStack, XStack } from 'tamagui'
import { SkeletonBox, SkeletonText } from './Skeleton'

const colors = {
  text: '#333333',
  subtleText: '#888888',
}

interface RestaurantDetails {
  name?: string
  description?: string
  rating?: number
  imageUrl?: string
}

interface RestaurantHeaderProps {
  loading: boolean
  restaurantDetails: RestaurantDetails
}

export default function RestaurantHeader({
  loading,
  restaurantDetails,
}: RestaurantHeaderProps) {
  return (
    <YStack padding={16}>
      <XStack space={16} alignItems="center">
        {loading ? (
          <SkeletonBox width={128} height={128} borderRadius={64} />
        ) : (
          <Image
            source={{ uri: restaurantDetails.imageUrl || 'https://via.placeholder.com/128' }}
            style={{ width: 128, height: 128, borderRadius: 64 }}
            resizeMode="cover"
          />
        )}
        <YStack flex={1}>
          {loading ? (
            <>
              <SkeletonText width="60%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonText width="80%" height={14} style={{ marginBottom: 4 }} />
              <SkeletonText width="40%" height={14} />
            </>
          ) : (
            <>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                  {restaurantDetails.name || 'Restaurant Name'}
                </Text>
              </View>
              <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                {restaurantDetails.description || 'Restaurant description here.'}
              </Text>
              <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                Rating: {restaurantDetails.rating || 'N/A'} ⭐
              </Text>
            </>
          )}
        </YStack>
      </XStack>
    </YStack>
  )
}

// Helper, because <Text/> from 'react-native' is used
// If you get an error, you can import from 'react-native':
const { Text } = require('react-native')
