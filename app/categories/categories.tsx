import React, { useEffect, useCallback, useLayoutEffect, useState } from 'react'
import { ScrollView } from 'tamagui'
import { YStack, XStack, Text, Button, Image } from 'tamagui'
import Icon from 'react-native-vector-icons/MaterialIcons' 
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { getRestaurantByCategory } from 'app/api/restaurant';
import { useFocusEffect } from 'expo-router';
import { useOrder } from 'app/context/orderContext';
import { getFile } from 'app/api/flleUploads';

export default function TabOneScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const { categoryId } = useLocalSearchParams();
  const { updateOrderState } = useOrder();
  const navigation = useNavigation();

  /**
   * 1) Fetch the restaurants by category
   * 2) For each restaurant that has an `image` field,
   *    call `getFile` to get the actual image (URL/base64).
   * 3) Save it as `restaurant.imageUrl`.
   */
  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurantByCategory(categoryId);
      const fetchedRestaurants = response.data.restaurants;

      // Map over each restaurant, fetch the file if `restaurant.image` exists
      const updatedRestaurants = await Promise.all(
        fetchedRestaurants.map(async (r: any) => {
          if (r.image) {
            try {
              const fileResponse = await getFile(r.image);
              // fileResponse.data.data is presumably the actual image URL/base64
              return { ...r, imageUrl: fileResponse.data.data };
            } catch (err) {
              console.log('Error fetching image for restaurant:', r._id, err);
              return r; // fallback to original data
            }
          } else {
            return r;
          }
        })
      );

      console.log('Updated Restaurants:', updatedRestaurants);
      setRestaurants(updatedRestaurants);
    } catch (error) {
      console.log('Error fetching restaurants:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [categoryId])
  );

  useEffect(() => {
    navigation.setOptions({
      title: 'Category',
      headerStyle: {
        backgroundColor: '#ffffff',
      },
      headerTitleStyle: {
        color: '#000000',
        fontWeight: 'bold',
      },
      headerTintColor: '#000000',
    });
  }, [navigation]);

  return (
    <YStack f={1} bg="#ffffff">
      <ScrollView f={1}>
        {restaurants.map((restaurant: any, index: number) => (
          <YStack key={index}>
            <Link
              href="/resturantDetails/resturant"
              asChild
              onPress={() => {
                updateOrderState('restaurantId', restaurant?._id);
              }}
            >
              <XStack space="$4" px="$4" py="$3">
                <Image
                  source={{
                    uri: restaurant.imageUrl || 'https://via.placeholder.com/50',
                  }}
                  width={100}
                  height={100}
                  borderRadius="$2"
                  alt="Restaurant Image"
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
  );
}
