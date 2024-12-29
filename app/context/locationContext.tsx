// LocationContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

import * as Location from 'expo-location'; // For Expo users
// For React Native CLI users, use @react-native-community/geolocation
// import Geolocation from '@react-native-community/geolocation';

interface LocationContextProps {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  refreshLocation: () => void;
}

export const LocationContext = createContext<LocationContextProps>({
  latitude: null,
  longitude: null,
  errorMsg: null,
  refreshLocation: () => {},
});

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [coordinates, setCoordinates] = useState({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location services in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
    //   setLatitude(location.coords.latitude);
    //   setLongitude(location.coords.longitude);
      setErrorMsg(null);
      console.log('location feetched');
      
      setCoordinates({latitude : location.coords.latitude, longitude :location.coords.longitude})
    } catch (error) {
      console.error('Error fetching location:', error);
      setErrorMsg('Error fetching location');
      Alert.alert(
        'Location Error',
        'There was an error fetching your location. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const refreshLocation = () => {
    getLocation();
  };

  return (
    <LocationContext.Provider value={{ coordinates, errorMsg, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
