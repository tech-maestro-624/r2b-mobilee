// AddressSelectionSheet.tsx

import React from 'react';
import { Sheet, YStack, XStack, Text, Button } from 'tamagui';
import { Pressable } from 'react-native';
import { MapPin, CheckCircle } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router'; 
import { ScrollView } from 'tamagui';

interface Address {
  id: number;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface AddressSelectionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => void;
}

const AddressSelectionSheet: React.FC<AddressSelectionSheetProps> = ({
  isOpen,
  onOpenChange,
  addresses,
  selectedAddress,
  setSelectedAddress,
}) => {

  const router = useRouter(); 

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[70, 100]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame padding={20} backgroundColor="#ffffff">
        <YStack space={16}>
          <Text fontSize={14} fontWeight="700" color="#1f2937">
            Select Delivery Address
          </Text>
          <ScrollView>
          {addresses.map((address) => (
            <Pressable
              key={`address-${address.id}`}
              onPress={() => {
                setSelectedAddress(address);
                onOpenChange(false);
              }}
              style={{
                backgroundColor:
                  selectedAddress && selectedAddress.id === address.id ? '#e0f2fe' : '#ffffff',
                borderWidth: selectedAddress && selectedAddress.id === address.id ? 2 : 1,
                borderColor:
                  selectedAddress && selectedAddress.id === address.id ? '#38bdf8' : '#e5e7eb',
                borderRadius: 16,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <XStack space={12} alignItems="center">
                <MapPin size={24} color="#6b7280" />
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color="#1f2937">
                    {address.name}
                  </Text>
                  <Text fontSize={12} color="#6b7280">
                    {address.address}
                  </Text>
                </YStack>
                {selectedAddress && selectedAddress.id === address.id && (
                  <CheckCircle size={24} color="#10b981" />
                )}
              </XStack>
            </Pressable>
          ))}
        
         <Button 
            onPress={() => {
              onOpenChange(false); 
              router.push('/location/location'); 
            }}
            size="$4"
            backgroundColor="#3b82f6"
            color="#fff"
            borderRadius={12}
            marginTop={8}
            marginBottom={20}
          >
              Add New Address
            </Button>
            </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default AddressSelectionSheet;
