// TabOneScreen.tsx

import React, {useLayoutEffect} from 'react'
import { ScrollView } from 'tamagui'
import { YStack, XStack, Text, Button, Image, Anchor } from 'tamagui'
import Icon from 'react-native-vector-icons/MaterialIcons' 
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';

export default function TabOneScreen() {
  const {  categoryId } = useLocalSearchParams();
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, 
    })
  }, [navigation])

  return (
    <YStack f={1} bg="white">
      <XStack ai="center" jc="space-between" p="$4" pb="$2">
  {/* Back Button */}
  <Button size="$4" bg="transparent" color="#111818"
    onPress={() => navigation.goBack()} 
  >
    <Icon name="arrow-back" size={24} color="#111818" />
  </Button>

  {/* Header Title */}
  <Text
    color="#111818"
    fontSize="$6"
    fontWeight="800"
    ta="center"
    f={1}
    pl="$10" // Adjust this padding if needed for alignment
  >
    {/* Title */}
  </Text>

  {/* Search Button */}
  <Button
    circular
    size="$4"
    bg="transparent"
    color="#111818"
    onPress={() => {}}
  >
    <Icon name="search" size={24} color="#111818" />
  </Button>
</XStack>

      <ScrollView f={1}>
        {restaurants.map((restaurant, index) => (
          <YStack key={index}>
            {/* Restaurant Info */}
            <XStack space="$4" px="$4" py="$3">
              <Image
                source={{ uri: restaurant.image }}
                width={70}
                height={70}
                borderRadius="$2"
              />
              <YStack f={1} jc="center">
                <Text color="#111818" fontSize="$5" fontWeight="500">
                  {restaurant.name}
                </Text>
                <Text color="#608a8a" fontSize="$2">
                  {restaurant.rating}
                </Text>
                <Text color="#608a8a" fontSize="$2">
                  {restaurant.status}
                </Text>
              </YStack>
            </XStack>

            {/* Menu Items */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              px="$4"
              py="$3"
            >
              <XStack space="$3">
                {restaurant.menuItems.map((item, idx) => (
                  <YStack
                    key={idx}
                    width={150}
                    bg="white"
                    borderRadius="$4"
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowOpacity={1}
                    shadowOffset={{ width: 0, height: 0 }}
                    shadowRadius={4}
                  >
                    <Image
                      source={{ uri: item.image }}
                      width="100%"
                      height={150}
                      borderRadius="$4"
                    />
                    <YStack p="$3" space="$2">
                      <Text color="#111818" fontSize="$4" fontWeight="500">
                        {item.name}
                      </Text>
                      <Text color="#608a8a" fontSize="$2">
                        {item.price}
                      </Text>
                      <Button bg="#f0f5f5" borderRadius="$4" mt="$2">
                        <Text
                          color="#111818"
                          fontSize="$2"
                          fontWeight="700"
                        >
                          Add to Cart
                        </Text>
                      </Button>
                    </YStack>
                  </YStack>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  )
}
