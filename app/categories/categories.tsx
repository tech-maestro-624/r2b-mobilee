// TabOneScreen.tsx

import React, {useEffect,useCallback, useLayoutEffect, useState} from 'react'
import { ScrollView } from 'tamagui'
import { YStack, XStack, Text, Button, Image, Anchor } from 'tamagui'
import Icon from 'react-native-vector-icons/MaterialIcons' 
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { getRestaurantByCategory } from 'app/api/restaurant';
import { useFocusEffect } from 'expo-router';
import { useOrder } from 'app/context/orderContext';

export default function TabOneScreen() {
  const [restaurants, setRestaurants] = useState([])
  const {  categoryId } = useLocalSearchParams();
  const { updateOrderState } = useOrder();

  const fetchRestaurants = async()=>{
    try {
      const response = await getRestaurantByCategory(categoryId)
      setRestaurants(response.data.restaurants)
    } catch (error) {
      console.log("error",error)      
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [categoryId])
  );

  // const restaurants = [
  //   {
  //     name: " Empanadas",
  //     rating: '4.1 (100+)',
  //     status: 'Open · Closes at 9:30 PM',
  //     image: 'https://via.placeholder.com/150',
  //     menuItems: [
  //       {
  //         name: 'Chicken',
  //         price: '$2.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //       {
  //         name: 'Chicken',
  //         price: '$2.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //       {
  //         name: 'Vegetable',
  //         price: '$2.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Ramen Underground',
  //     rating: '4.2 (1000+)',
  //     status: 'Open · Closes at 10:00 PM',
  //     image: 'https://via.placeholder.com/150',
  //     menuItems: [
  //       {
  //         name: 'Tonkotsu Ramen',
  //         price: '$12.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //       {
  //         name: 'Shoyu Ramen',
  //         price: '$12.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //       {
  //         name: 'Yaki Udon',
  //         price: '$10.75',
  //         image: 'https://via.placeholder.com/150',
  //       },
  //     ],
  //   },
  // ]

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
    pl="$10" 
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
        {restaurants && restaurants.map((restaurant, index) => (
          <YStack key={index}>
            {/* Restaurant Info */}
            <Link
                        href="/resturantDetails/resturant"
                        asChild
                        onPress={() => {
                          updateOrderState('restaurantId', restaurant?._id);
                        }}
                      >
            <XStack space="$4" px="$4" py="$3">
              <Image
                source={{ uri: restaurant.image || 'https://via.placeholder.com/50' }}
                width={100}
                height={100}
                borderRadius="$2"
              />
              <YStack f={1} jc="center">
                <Text color="#111818" fontSize="$5" fontWeight="500">
                  {restaurant.name}
                </Text>
                <Text color="#608a8a" fontSize="$2">
                  {restaurant.description}
                </Text>
                <Text color="#608a8a" fontSize="$2">
                  {restaurant.rating}
                </Text>
                <Text color="#608a8a" fontSize="$2">
                  {restaurant.status}
                </Text>
              </YStack>
            </XStack>
            </Link>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  )
}
