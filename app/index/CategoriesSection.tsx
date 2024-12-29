import React from 'react'
import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Image } from 'tamagui'
import { Link } from 'expo-router'
import { SkeletonBox, SkeletonText } from './Skeleton'

interface CategoriesSectionProps {
  loading: boolean
  categories: any[] // or a more specific type if you have one
}

export default function CategoriesSection({
  loading,
  categories,
}: CategoriesSectionProps) {
  return (
    <YStack paddingBottom="$3" marginTop={10}>
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <XStack space="$3">
            {[...Array(5)].map((_, idx) => (
              <YStack alignItems="center" justifyContent="center" space={8} key={idx}>
                <SkeletonBox width={70} height={70} borderRadius={35} />
                <SkeletonText width={50} />
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <XStack space="$3">
            {categories.map((category: any) => (
              <Link
                href={{
                  pathname: '/categories/categories',
                  params: { categoryId: category._id },
                }}
                asChild
                key={category._id}
              >
                <YStack alignItems="center" justifyContent="center" space={8}>
                  <Image
                    source={{
                      uri: category.imageUrl || 'https://via.placeholder.com/70',
                    }}
                    width={70}
                    height={70}
                    borderRadius={35}
                    alt={category.name}
                  />
                  <Text color="grey" fontSize={10} fontWeight="700">
                    {category.name}
                  </Text>
                </YStack>
              </Link>
            ))}
          </XStack>
        </ScrollView>
      )}
    </YStack>
  )
}
