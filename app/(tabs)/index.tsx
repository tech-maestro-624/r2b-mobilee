import React, { useState, useCallback, useContext, useEffect } from 'react'
import { YStack, XStack, Text, Button, Image, Input, ScrollView } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TouchableOpacity, View } from 'react-native'
import { useOrder } from 'app/context/orderContext'
import { getFile } from 'app/api/flleUploads'
import { LocationContext } from 'app/context/locationContext'
import { getRestaurant } from 'app/api/restaurant'
import { getCategory } from 'app/api/category'

// Smaller extracted components
import CategoriesSection from 'app/index/CategoriesSection'
import TopRatedSection from 'app/index/TopRatedSection'
import ExploreMoreSection from 'app/index/ExploreMoreSection'
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';

interface Address {
  id: number
  name: string
  city: string
  address: string
  type: string
  latitude: number
  longitude: number
}

interface Restaurant {
  _id: string
  name: string
  image?: string
  imageUrl?: string
  rating: number
  address: string
  description?: string
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { updateOrderState } = useOrder()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const { coordinates } = useContext(LocationContext)

  // -----------------------------
  // 1) Fetch Categories
  // -----------------------------
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategory({ condition: { isGlobal: true } })
      const categoriesData = response.data.categories // array of categories

      // For each category, fetch file if category.image exists
      const updatedCategories = await Promise.all(
        categoriesData.map(async (cat: any) => {
          if (cat.image) {
            try {
              const fileResponse = await getFile(cat.image)
              // fileResponse.data.data is the image URL or base64
              return { ...cat, imageUrl: fileResponse.data.data }
            } catch (error) {
              console.log('Error fetching file for category:', cat._id, error)
              return cat // fallback
            }
          }
          return cat
        }),
      )

      setCategories(updatedCategories)
    } catch (error: any) {
      console.log('Error fetching categories:', error.message)
    }
  }, [])

  // -----------------------------
  // 2) Fetch Restaurants
  // -----------------------------
  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await getRestaurant({
        condition: {
          coords: [coordinates.latitude, coordinates.longitude],
        },
      })
      const restaurantsData = response.data.restaurants

      // For each restaurant, fetch file if restaurant.image exists
      const updatedRestaurants: Restaurant[] = await Promise.all(
        restaurantsData.map(async (rest: Restaurant) => {
          if (rest.image) {
            try {
              const fileResponse = await getFile(rest.image)
              return { ...rest, imageUrl: fileResponse.data.data }
            } catch (error) {
              console.log('Error fetching file for restaurant:', rest._id, error)
              return rest // fallback
            }
          }
          return rest
        }),
      )

      setRestaurants(updatedRestaurants)
    } catch (error: any) {
      console.log('Error fetching restaurants:', error.message)
    }
  }, [coordinates])

  // -----------------------------
  // 3) Fetch Addresses from AsyncStorage
  // -----------------------------
  const fetchAddresses = useCallback(async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem('addresses')
      let parsedAddresses: Address[] = []
      if (storedAddresses) {
        parsedAddresses = JSON.parse(storedAddresses)
      }
      setAddresses(parsedAddresses)

      const storedSelectedAddress = await AsyncStorage.getItem('selectedAddress')
      if (storedSelectedAddress) {
        const parsedSelectedAddress = JSON.parse(storedSelectedAddress)
        setSelectedAddress(parsedSelectedAddress)
      } else if (parsedAddresses.length > 0) {
        setSelectedAddress(parsedAddresses[0])
      } else {
        setSelectedAddress(null)
      }
    } catch (error) {
      console.log('Error fetching addresses:', error)
      setSelectedAddress(null)
    }
  }, [])

  // -----------------------------
  // UseEffect to fetch data on mount
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchRestaurants(), fetchCategories(), fetchAddresses()])
      } catch (e) {
        console.log('Error during fetching:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchRestaurants, fetchCategories, fetchAddresses])

  // Filter top-rated restaurants
  const topRatedRestaurants = restaurants.filter((r) => r.rating >= 4.5)

  // -----------------------------
  // Render UI
  // -----------------------------
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
            // Skeleton for top-left image
            <></>
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
              setIsSheetOpen(true)
            }}
            disabled={loading}
          >
            {loading ? (
              // Skeleton for the text
              <></>
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
          // Skeleton for logo
          <></>
        ) : (
          
          // <Image
          //   source={require('../../assets/images/logo.png')}
          //   style={{ width: 48, height: 48 }}
          //   alt="Logo"
          // />
          <Link href='/order/OrderTracking' asChild>
          <Button>click</Button>
          </Link>
        )}
      </XStack>

      {/* Search Bar */}
      <YStack paddingHorizontal="$4" paddingVertical="$3">
        {loading ? (
          // Skeleton for search
          <></>
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

      {/* Scrollable Content */}
      <ScrollView flex={1}>
        {/* 1) Categories Section */}
        <CategoriesSection loading={loading} categories={categories} />

        {/* 2) Top Rated Restaurants Section */}
        <TopRatedSection
          loading={loading}
          topRatedRestaurants={topRatedRestaurants}
          updateOrderState={updateOrderState}
        />

        {/* 3) Explore More Section */}
        <ExploreMoreSection
          loading={loading}
          restaurants={restaurants}
          updateOrderState={updateOrderState}
        />
      </ScrollView>

      {/* Bottom Sheet for Address Selection */}
      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={async (address: Address) => {
          setSelectedAddress(address)
          await AsyncStorage.setItem('selectedAddress', JSON.stringify(address))
        }}
      />
    </YStack>
  )
}
