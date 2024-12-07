import React, { useState, useCallback } from 'react';
import { YStack, XStack, Text, Button, Image, Input, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { getRestaurant } from 'app/api/restaurant';
import { getCategory } from 'app/api/category';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { TouchableOpacity } from 'react-native';
import { useOrder } from 'app/context/orderContext';
interface Address {
  id: number;
  name: string; 
  city: string; 
  address: string; 
  type: string;
  latitude: number;
  longitude: number;
}

interface Restaurant {
  _id: string;
  name: string;
  image?: string;
  rating: number;
  address: string;
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState([]);
  const { updateOrderState } = useOrder();

  
  // Address Selection States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 
  
  // Fetch Restaurants and Categories
  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await getRestaurant();
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.log('Error fetching restaurants:', error.message);
    }
  }, []);
  
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategory({ condition: { isGlobal: true } });
      setCategories(response.data.categories);
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  }, []);
  
  // Fetch Addresses from AsyncStorage
  const fetchAddresses = useCallback(async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem('addresses');
      let parsedAddresses: Address[] = [];
      if (storedAddresses) {
        parsedAddresses = JSON.parse(storedAddresses);
      }
      setAddresses(parsedAddresses);
  
      const storedSelectedAddress = await AsyncStorage.getItem('selectedAddress');
      if (storedSelectedAddress) {
        const parsedSelectedAddress = JSON.parse(storedSelectedAddress);
        setSelectedAddress(parsedSelectedAddress);
      } else if (parsedAddresses.length > 0) {
        setSelectedAddress(parsedAddresses[0]);
      } else {
        setSelectedAddress(null);
      }
    } catch (error) {
      console.log('Error fetching addresses:', error);
      setSelectedAddress(null);
    }
  }, []);
  
  // Handle Address Selection
  const handleSetSelectedAddress = useCallback(async (address: Address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  }, []);
  
  // Fetch data when component is focused
  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
      fetchCategories();
      fetchAddresses();
    }, [fetchRestaurants, fetchCategories, fetchAddresses])
  );
  
  const topRatedRestaurants = restaurants.filter(
    (restaurant) => restaurant.rating >= 4.5
  );
  
  return (
    <YStack flex={1} backgroundColor="white">
      <XStack
        ai="center"
        jc="space-between"
        p="$4"
        pb="$2"
        marginTop={20}
        borderBottomWidth={1}
        borderBottomColor="#E0E0E0"
      >
        <XStack ai="center" f={1}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: 8,
            }}
            alt="Left Circular Image"
          />
          <TouchableOpacity onPress={() => {
          setIsSheetOpen(true);
        }}>
          <YStack>
            <Text
              color="#111818"
              fontSize="$6"
              fontWeight="800"
              ta="left"
              marginLeft={10}
            >
              {selectedAddress
                ? `${selectedAddress.name}`
                : 'Select Address'}
            </Text>
            {selectedAddress && (
              <Text
                color="#6b7280"
                fontSize="$4"
                fontWeight="500"
                ta="left"
                marginLeft={10}
              >
                {selectedAddress.address}
              </Text>
            )}
          </YStack>
          </TouchableOpacity>
        </XStack>

          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              width: 48,
              height: 48,
            }}
            alt="Logo"
          />
      </XStack>

      {/* Search Bar */}
      <YStack paddingHorizontal="$4" paddingVertical="$3">
        <XStack
          alignItems="center"
          height={48}
          backgroundColor="#f0f5f5"
          borderRadius="$4"
        >
          <MaterialIcons
            name="search"
            size={24}
            color="#608a8a"
            style={{ marginLeft: 16, marginRight: 8 }}
          />
          <Link href='/search/restaurantSearch' asChild>
          <Input
            placeholder="What do you feel like?"
            placeholderTextColor="#608a8a"
            flex={1}
            borderWidth={0}
            backgroundColor="transparent"
            color="#111818"
            fontSize={16}
            fontWeight="400"
          />
          </Link>
        </XStack>
      </YStack>

      <ScrollView flex={1}>
        <YStack paddingBottom="$3" marginTop={10}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <XStack space="$3">
              {categories.map((category) => (
                <Link
                  href={{
                    pathname: '/categories/categories',
                    params: { categoryId: category._id },
                  }}
                  asChild
                  key={category._id}
                >
                  <YStack
                    alignItems="center"
                    justifyContent="center"
                    space={8}
                    cursor="pointer"
                  >
                    <Image
                      source={{ uri: 'https://via.placeholder.com/50' }}
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
        </YStack>

        {/* Top Rated Restaurants Section */}
        <YStack paddingHorizontal={20} paddingBottom={20}>
          <Text
            color="#111818"
            fontSize={16}
            fontWeight="700"
            marginBottom={12}
          >
            Top Rated
          </Text>
          {topRatedRestaurants.length > 0 ? (
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
                        uri:
                          restaurant.image ||
                          'https://via.placeholder.com/160x120',
                      }}
                      width="100%"
                      height={120}
                      borderRadius={8}
                      alt={restaurant.name}
                    />
                    <YStack
                      padding={12}
                      flex={1}
                      justifyContent="space-between"
                    >
                      <Text
                        color="#111818"
                        fontSize={14}
                        fontWeight="500"
                        numberOfLines={1}
                      >
                        {restaurant.name}
                      </Text>
                      <Text color="#608a8a" fontSize={12}>
                        Rating: {restaurant.rating}
                      </Text>
                      <Link
                        href="/resturantDetails/resturant"
                        asChild
                        onPress={() => {
                          updateOrderState('restaurantId', restaurant?._id);
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

                    {/* Decorative Triangle */}
                    <YStack
                      position="absolute"
                      bottom={-10}
                      left="50%"
                      transform="translateX(-50%) rotate(180deg)"
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
            <Text fontSize={14} color="#6b7280" textAlign="center">
              No top-rated restaurants available at the moment.
            </Text>
          )}
        </YStack>
        <YStack padding={16}>
          <Text>
            Explore More
          </Text>
        </YStack>
      </ScrollView>

      {/* Address Selection Sheet */}
      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={handleSetSelectedAddress}
      />

      {/* Place Order Section (Optional) */}
      {/* 
        If you have a place order section similar to the Cart component,
        you can include it here. Ensure it doesn't interfere with the current setup.
      */}
    </YStack>
  );
}
