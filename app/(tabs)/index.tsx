import React, { useState, useCallback } from 'react';
import { YStack, XStack, Text, Button, Image, Input, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { getRestaurant } from 'app/api/restaurant';
import { getCategory } from 'app/api/category';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { TouchableOpacity, View } from 'react-native';
import { useOrder } from 'app/context/orderContext';
import { getFile } from 'app/api/flleUploads';

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
  image?: string;       // This might be an ID for getFile
  imageUrl?: string;    // We'll store the fetched image here
  rating: number;
  address: string;
  description?: string;
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateOrderState } = useOrder();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /**
   * Fetch categories:
   * 1) getCategory API call
   * 2) For each category, fetch actual image from getFile
   * 3) Store it in category.imageUrl
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategory({ condition: { isGlobal: true } });
      const categoriesData = response.data.categories; // array of categories

      // For each category, fetch the file if category.image exists
      const updatedCategories = await Promise.all(
        categoriesData.map(async (cat: any) => {
          if (cat.image) {
            try {
              const fileResponse = await getFile(cat.image);
              // fileResponse.data.data should contain the actual image URL or base64 string
              return { ...cat, imageUrl: fileResponse.data.data };
            } catch (error) {
              console.log('Error fetching file for category:', cat._id, error);
              return cat; // fallback
            }
          }
          return cat;
        }),
      );

      setCategories(updatedCategories);
    } catch (error: any) {
      console.log('Error fetching categories:', error.message);
    }
  }, []);

  /**
   * Fetch restaurants:
   * 1) getRestaurant API call
   * 2) For each restaurant, fetch the actual image from getFile
   * 3) Store it in restaurant.imageUrl
   */
  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await getRestaurant();
      const restaurantsData = response.data.restaurants; // array of restaurants

      // For each restaurant, fetch the file if restaurant.image exists
      const updatedRestaurants: Restaurant[] = await Promise.all(
        restaurantsData.map(async (rest: Restaurant) => {
          if (rest.image) {
            try {
              const fileResponse = await getFile(rest.image);
              // fileResponse.data.data should contain the actual image URL or base64 string
              return { ...rest, imageUrl: fileResponse.data.data };
            } catch (error) {
              console.log('Error fetching file for restaurant:', rest._id, error);
              return rest; // fallback
            }
          }
          return rest;
        }),
      );

      setRestaurants(updatedRestaurants);
    } catch (error: any) {
      console.log('Error fetching restaurants:', error.message);
    }
  }, []);

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

  const handleSetSelectedAddress = useCallback(async (address: Address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchRestaurants(), fetchCategories(), fetchAddresses()])
        .then(() => {
          setLoading(false);
        })
        .catch((e) => {
          console.log('Error during fetching:', e);
          setLoading(false);
        });
    }, [fetchRestaurants, fetchCategories, fetchAddresses])
  );

  const topRatedRestaurants = restaurants.filter(
    (restaurant) => restaurant.rating >= 4.5
  );

  // Skeleton Components
  const SkeletonBox = ({
    width,
    height,
    borderRadius = 4,
    style = {},
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
  }) => (
    <View
      style={[
        { width, height, backgroundColor: '#e0e0e0', borderRadius },
        style,
      ]}
    />
  );

  const SkeletonText = ({
    width,
    height = 10,
    style = {},
  }: {
    width: number | string;
    height?: number;
    style?: any;
  }) => (
    <SkeletonBox width={width} height={height} borderRadius={4} style={style} />
  );

  return (
    <YStack flex={1} backgroundColor="white">
      {/* Top Header */}
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
          {loading ? (
            <SkeletonBox
              width={40}
              height={40}
              borderRadius={20}
              style={{ marginRight: 8 }}
            />
          ) : (
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
          )}
          <TouchableOpacity
            onPress={() => {
              setIsSheetOpen(true);
            }}
            disabled={loading}
          >
            {loading ? (
              <YStack>
                <SkeletonText
                  width={100}
                  height={14}
                  style={{ marginLeft: 10, marginBottom: 6 }}
                />
                <SkeletonText
                  width={140}
                  height={12}
                  style={{ marginLeft: 10 }}
                />
              </YStack>
            ) : (
              <YStack>
                <Text
                  color="#111818"
                  fontSize="$6"
                  fontWeight="800"
                  ta="left"
                  marginLeft={10}
                >
                  {selectedAddress ? `${selectedAddress.name}` : 'Add Address'}
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
            )}
          </TouchableOpacity>
        </XStack>
        {loading ? (
          <SkeletonBox width={48} height={48} borderRadius={24} />
        ) : (
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              width: 48,
              height: 48,
            }}
            alt="Logo"
          />
        )}
      </XStack>

      {/* Search Bar */}
      <YStack paddingHorizontal="$4" paddingVertical="$3">
        {loading ? (
          <XStack
            alignItems="center"
            height={48}
            backgroundColor="#f0f5f5"
            borderRadius="$4"
            paddingHorizontal={16}
          >
            <SkeletonBox
              width={24}
              height={24}
              borderRadius={12}
              style={{ marginRight: 8 }}
            />
            <SkeletonText width="60%" height={16} />
          </XStack>
        ) : (
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
            <Link href="/search/restaurantSearch" asChild>
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
        )}
      </YStack>

      <ScrollView flex={1}>
        {/* Categories Section */}
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

        {/* Top Rated Restaurants Section */}
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
                        uri:
                          // now we use restaurant.imageUrl instead of restaurant.image
                          restaurant.imageUrl || 'https://via.placeholder.com/160x120',
                      }}
                      width="100%"
                      height={120}
                      borderRadius={8}
                      alt={restaurant.name}
                    />
                    <YStack padding={12} flex={1} justifyContent="space-between">
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

        {/* Explore More Restaurants Section */}
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
                    updateOrderState('restaurantId', restaurant?._id);
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
                              restaurant.imageUrl ||
                              'https://via.placeholder.com/80x80',
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
                            <MaterialIcons
                              name="star"
                              size={14}
                              color="#fbbf24"
                            />
                            <Text color="#608a8a" fontSize={12} marginLeft={4}>
                              {restaurant.rating.toFixed(1)}
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
      </ScrollView>

      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={handleSetSelectedAddress}
      />
    </YStack>
  );
}
