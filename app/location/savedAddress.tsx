import React, { useEffect, useState } from 'react';
import { YStack, XStack, Text, Button, Separator, Theme } from 'tamagui';
import { ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Icons for different address types
import { useNavigation } from 'expo-router';
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { useFocusEffect } from 'expo-router';

const SavedAddressScreen = () => {
  const [addresses, setAddresses] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 
  const navigation = useNavigation()


  const fetchAddresses = async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem('addresses');
      const parsedAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
      setAddresses(parsedAddresses);
    } catch (error) {
      console.log('Error fetching addresses:', error);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      const updatedAddresses = addresses.filter((address) => address.id !== id);
      setAddresses(updatedAddresses);
      await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      Alert.alert('Deleted', 'Address has been removed.');
    } catch (error) {
      console.log('Error deleting address:', error);
    }
  };

  // Mock function for edit
  const handleEdit = (id) => {
    Alert.alert('Edit Address', `You can edit the address with ID: ${id}`);
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Address',
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
    <Theme name="light">
      <YStack flex={1} backgroundColor="#FAFAFA" padding="$4">

        {/* Add New Address */}
        <TouchableOpacity
          onPress={()=>  setIsSheetOpen(true)} 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FF7F50" />
          <Text style={{ marginLeft: 10, color: '#FF7F50', fontWeight: 'bold' }}>
            Add A New Address
          </Text>
        </TouchableOpacity>

        {/* Address List */}
        <ScrollView>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <YStack
                key={address.id}
                backgroundColor="#FFFFFF"
                borderRadius="$3"
                padding="$4"
                marginBottom={10}
                shadowColor="#00000020"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.1}
                shadowRadius={6}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" space="$2">
                    {/* Icon based on type */}
                    {address.type === 'Home' ? (
                      <Ionicons name="home-outline" size={20} color="#000" />
                    ) : (
                      <Ionicons name="location-outline" size={20} color="#000" />
                    )}
                    <Text fontWeight="bold" fontSize="$6" color="#000">
                      {address.name}
                    </Text>
                  </XStack>
                </XStack>

                {/* Address Details */}
                <Text fontSize="$5" color="#666" marginTop={10}>
                  {address.address}
                </Text>

                {/* Actions (Edit/Delete) */}
                <XStack justifyContent="flex-start" marginTop={10} space="$4">
                  <TouchableOpacity onPress={() => handleEdit(address.id)}>
                    <Text style={{ color: '#FF7F50', fontWeight: 'bold' }}>EDIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(address.id)}>
                    <Text style={{ color: '#FF7F50', fontWeight: 'bold' }}>DELETE</Text>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            ))
          ) : (
            <Text fontSize="$5" color="#999" textAlign="center">
              No addresses saved.
            </Text>
          )}
        </ScrollView>
      </YStack>
      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        // selectedAddress={selectedAddress}
        // setSelectedAddress={handleSetSelectedAddress}
      />

    </Theme>
  );
};

export default SavedAddressScreen;
