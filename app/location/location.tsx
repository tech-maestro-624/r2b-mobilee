import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Sheet,
  ScrollView,
} from "tamagui";
import { MapPin, ChevronLeft } from "@tamagui/lucide-icons";
import { Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";

export default function ConfirmDeliveryLocation() {
  const navigation = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [addressType, setAddressType] = useState("Home");
  const [addressDetails, setAddressDetails] = useState({
    flatNumber: "",
    landmark: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        setIsLoading(false);
        return;
      }

      setHasLocationPermission(true);

      let location = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setCurrentRegion(initialRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setIsLoading(false);
    })();
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!hasLocationPermission) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        return;
      }
      setHasLocationPermission(true);
    }

    let location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setCurrentRegion(newRegion);
    setSelectedLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const handleConfirmAddress = async () => {
    if (!addressDetails.flatNumber.trim()) {
      Alert.alert("Validation Error", "Please enter your flat/house number.");
      return;
    }

    try {
      const storedAddresses = await AsyncStorage.getItem("addresses");
      let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];

      const newAddress = {
        id: Date.now(),
        name: addressType,
        address:
          addressDetails.flatNumber +
          (addressDetails.landmark ? ", " + addressDetails.landmark : ""),
        type: addressType,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      addresses.push(newAddress);

      await AsyncStorage.setItem("addresses", JSON.stringify(addresses));
      await AsyncStorage.setItem("selectedAddress", JSON.stringify(newAddress));

      setIsSheetOpen(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert(
        "Error",
        "There was an issue saving your address. Please try again."
      );
    }
  };

  const handleRegionChangeComplete = debounce((region) => {
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }, 500);

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#ffffff"
      >
        <ActivityIndicator size="large" color="#10b981" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#ffffff">
      {/* Header */}
      <YStack
        paddingHorizontal={16}
        paddingTop={40}
        paddingBottom={16}
        backgroundColor="#ffffff"
      >
        <XStack alignItems="center" space={16}>
          <Pressable onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#1f2937" />
          </Pressable>
          <Text fontSize={18} fontWeight="700" color="#1f2937">
            Confirm Delivery Location
          </Text>
        </XStack>
      </YStack>

      <YStack flex={1} position="relative">
        {currentRegion && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={currentRegion}
            // Do not specify a provider, or set `provider={null}`.
            // Set mapType to 'none' so that no default map is rendered.
            // mapType="none"
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation
          >
            {/* OpenStreetMap Tiles */}
            <UrlTile
              urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
              tileSize={256}
            />
          </MapView>
        )}
        {/* Fixed Center Pin */}
        <YStack
          position="absolute"
          top="50%"
          left="50%"
          style={styles.centerPin}
        >
          <MapPin size={48} color="#e11d48" />
        </YStack>
        {/* Use Current Location Button */}
        <Pressable
          onPress={handleUseCurrentLocation}
          style={styles.currentLocationButton}
        >
          <MapPin size={24} color="#1f2937" />
        </Pressable>
        {/* Confirm Location Button */}
        <Button
          position="absolute"
          bottom={20}
          left={20}
          right={20}
          backgroundColor="#10b981"
          color="#ffffff"
          borderRadius={12}
          onPress={() => setIsSheetOpen(true)}
        >
          Confirm Location
        </Button>
      </YStack>

      {/* Bottom Sheet for Address Details */}
      <Sheet
        modal
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        snapPoints={[300, 450]} // Fixed pixel values
        snapPointsMode="fixed"
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame padding={20} backgroundColor="#ffffff">
          <ScrollView>
            <YStack space={16}>
              <Text fontSize={20} fontWeight="700" color="#1f2937">
                Enter Complete Address
              </Text>
              <YStack space={12}>
                <Text fontSize={16} fontWeight="600" color="#1f2937">
                  Save Address As
                </Text>
                <XStack space={12}>
                  {["Home", "Work", "Other"].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setAddressType(type)}
                      style={{
                        backgroundColor:
                          addressType === type ? "#e0f2fe" : "#e5e7eb",
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        fontSize={16}
                        color="#1f2937"
                        fontWeight={addressType === type ? "700" : "500"}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </XStack>
              </YStack>
              <YStack space={12}>
                <Text fontSize={16} fontWeight="600" color="#1f2937">
                  Address Details
                </Text>
                <Input
                  placeholder="Flat / House No / Floor / Building"
                  value={addressDetails.flatNumber}
                  onChangeText={(text) =>
                    setAddressDetails({ ...addressDetails, flatNumber: text })
                  }
                  borderWidth={1}
                  borderColor="#e5e7eb"
                  borderRadius={8}
                  padding={12}
                />
                <Input
                  placeholder="Nearby Landmark (Optional)"
                  value={addressDetails.landmark}
                  onChangeText={(text) =>
                    setAddressDetails({ ...addressDetails, landmark: text })
                  }
                  borderWidth={1}
                  borderColor="#e5e7eb"
                  borderRadius={8}
                  padding={12}
                />
              </YStack>
              <Button
                backgroundColor="#10b981"
                color="#ffffff"
                borderRadius={12}
                onPress={handleConfirmAddress}
              >
                Confirm Address
              </Button>
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}

const styles = StyleSheet.create({
  centerPin: {
    marginLeft: -24,
    marginTop: -48,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
