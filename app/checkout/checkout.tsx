import React, { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Button,
  Card,
  Separator,
  Input,
  Theme,
} from 'tamagui'
import { Pressable, Alert, StyleSheet } from 'react-native'
import { MapPin, Navigation, MapPinned } from '@tamagui/lucide-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'

interface LocationType {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
}

interface CartItem {
  // Define your CartItem properties here
}

export default function CheckoutScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { cart } = route.params as { cart: CartItem[] }

  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null)
  const [currentRegion, setCurrentRegion] = useState(null)
  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const [previousLocations] = useState<LocationType[]>([
    {
      id: 1,
      name: 'Home',
      address: '123 Main Street, City, Country',
      latitude: 37.78825,
      longitude: -122.4324,
    },
    {
      id: 2,
      name: 'Work',
      address: '456 Office Park, City, Country',
      latitude: 37.78925,
      longitude: -122.4314,
    },
  ])

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.')
        return
      }

      setHasLocationPermission(true)

      let location = await Location.getCurrentPositionAsync({})
      setCurrentRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
    })()
  }, [])

  const handleUseCurrentLocation = async () => {
    if (!hasLocationPermission) {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.')
        return
      }
      setHasLocationPermission(true)
    }

    let location = await Location.getCurrentPositionAsync({})
    setSelectedLocation({
      id: 3,
      name: 'Current Location',
      address: 'Detected via GPS',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
    setCurrentRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setSelectedLocation({
      id: 4,
      name: 'Pinned Location',
      address: 'Custom pinned location',
      latitude,
      longitude,
    })
    setCurrentRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }

  const handlePlaceOrder = () => {
    if (selectedLocation) {
      Alert.alert('Order Placed', `Your order will be delivered to ${selectedLocation.address}.`)
      navigation.goBack()
    } else {
      Alert.alert('No Location Selected', 'Please select a delivery location.')
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Check Out',
    })
  }, [navigation])

  return (
    <Theme name="light">
      <ScrollView>
        <YStack padding="$4" space="$4">
          <Text fontSize="$8" fontWeight="bold" color="$gray12">
            Select Delivery Location
          </Text>

          <Button
            onPress={handleUseCurrentLocation}
            icon={<Navigation size="$1" />}
            theme="active"
          >
            Use Current Location
          </Button>

          <Text fontSize="$6" fontWeight="bold" color="$gray12">
            Select on Map
          </Text>
          <Card elevate size="$4" bordered>
            <Card.Background>
              {currentRegion && (
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={currentRegion}
                  onPress={handleMapPress}
                >
                  {selectedLocation && (
                    <Marker
                      coordinate={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                      }}
                    />
                  )}
                </MapView>
              )}
            </Card.Background>
          </Card>

          <Text fontSize="$6" fontWeight="bold" color="$gray12">
            Previous Locations
          </Text>
          <YStack space="$2">
            {previousLocations.map((location) => (
              <Button
                key={location.id}
                onPress={() => {
                  setSelectedLocation(location)
                  setCurrentRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  })
                }}
                theme={selectedLocation?.id === location.id ? 'active' : 'gray'}
                icon={<MapPin size="$1" />}
              >
                <YStack>
                  <Text fontSize="$4" fontWeight="600">
                    {location.name}
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    {location.address}
                  </Text>
                </YStack>
              </Button>
            ))}
          </YStack>

          {selectedLocation && (
            <YStack space="$2">
              <Text fontSize="$6" fontWeight="bold" color="$gray12">
                Selected Location
              </Text>
              <Card bordered padded>
                <YStack space="$1">
                  <Text fontSize="$4" fontWeight="600">
                    {selectedLocation.name}
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    {selectedLocation.address}
                  </Text>
                  <XStack space="$2">
                    <Text fontSize="$3" color="$gray11">
                      Latitude: {selectedLocation.latitude.toFixed(5)}
                    </Text>
                    <Text fontSize="$3" color="$gray11">
                      Longitude: {selectedLocation.longitude.toFixed(5)}
                    </Text>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
          )}

          <Separator />

          <Button
            onPress={handlePlaceOrder}
            theme="active"
            icon={<MapPinned size="$1" />}
            size="$5"
          >
            Place Order
          </Button>
        </YStack>
      </ScrollView>
    </Theme>
  )
}

