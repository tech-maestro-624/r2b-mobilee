import React, { useState, useLayoutEffect, useEffect } from 'react';
import { YStack, XStack, Text, Image, ScrollView, Button, Card } from 'tamagui';
import { ChevronDown, MapPin, Plus, Minus, Calendar } from '@tamagui/lucide-icons';
import { Pressable, BackHandler } from 'react-native';
import { Link, useNavigation, useRouter } from 'expo-router';
import { getBranches } from 'app/api/branch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { useOrder } from 'app/context/orderContext';

interface Address {
  id: number;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface FoodItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: { name: string };
  addOns?: { name: string }[];
  branchId: string;
}

export default function Cart() {
  const navigation = useNavigation();
  const router = useRouter();
  const { updateOrderState } = useOrder();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [branch, setBranch] = useState<any>({});
  const [cartItems, setCartItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const cartData = await AsyncStorage.getItem('cart');
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          setCartItems(parsedCart);
          if (parsedCart.length > 0) {
            const branchId = parsedCart[0].branchId;
            if (branchId) {
              const response1 = await getBranches({ condition: { _id: branchId } });
              setBranch(response1.data.branches[0]);
            }
          }
        }
      } catch (error) {
        console.log('Error fetching cart items:', error);
      }
    };
    fetchCartItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAddresses = async () => {
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
        }
      };
      fetchAddresses();
    }, [])
  );

  const handleSetSelectedAddress = async (address: Address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  };

  const totalAmount = cartItems.reduce(
    (sum: number, item: FoodItem) => sum + item.price * item.quantity,
    0
  );

  const incrementQuantity = async (itemId: string) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
  };

  const decrementQuantity = async (itemId: string) => {
    const currentItem = cartItems.find((item) => item.id === itemId);
    if (currentItem) {
      if (currentItem.quantity > 1) {
        const updatedCartItems = cartItems.map((cItem) => {
          if (cItem.id === itemId) {
            return { ...cItem, quantity: cItem.quantity - 1 };
          }
          return cItem;
        });
        setCartItems(updatedCartItems);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
      } else {
        const updatedCartItems = cartItems.filter((cItem) => cItem.id !== itemId);
        setCartItems(updatedCartItems);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/resturantDetails/resturant');
        updateOrderState('restaurantId', branch?.restaurant?._id);
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [router, branch]) 
  );

  return (
    <YStack flex={1} backgroundColor="#f0f2f5">
      <YStack
        paddingHorizontal={20}
        paddingTop={40}
        paddingBottom={16}
        backgroundColor="#ffffff"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={10}
        shadowOffset={{ width: 0, height: 2 }}
      >
        <YStack>
          <Text fontSize={18} fontWeight="700" color="#1f2937">
            {branch?.restaurant?.name || 'Restaurant Name'}
          </Text>
          <Text fontSize={10} fontWeight="700" color="gray">
            {branch.address}
          </Text>
        </YStack>
        <Pressable onPress={() => setIsSheetOpen(true)}>
          <XStack alignItems="center" marginTop={8}>
            <MapPin size={16} color="#9ca3af" />
            <Text fontSize={14} color="#6b7280" marginLeft={4}>
              Deliver to{' '}
              <Text fontWeight="600">{selectedAddress?.name || 'Select Address'}</Text>
            </Text>
            <ChevronDown size={16} color="#6b7280" />
          </XStack>
        </Pressable>
      </YStack>

      <ScrollView>
        <YStack paddingHorizontal={5} paddingTop={20} space={16}>
          <Card padding={16} backgroundColor="#ffffff">
            {cartItems.length > 0 ? (
              cartItems.map((item: FoodItem, index: number) => (
                <XStack
                  key={`${item.id}-${index}`}
                  space={8}
                  alignItems="flex-start"
                  marginVertical={4}
                >
                  <Image
                    source={{
                      uri: 'https://via.placeholder.com/80',
                    }}
                    width={70}
                    height={70}
                    borderRadius={12}
                  />
                  <YStack flex={1} space={4}>
                    <Text fontSize={12} fontWeight="700" color="#1f2937">
                      {item.name}
                    </Text>
                    {item.variant && (
                      <Text fontSize={8} color="#6b7280">
                        {item.variant.name}
                      </Text>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <Text fontSize={12} color="#6b7280">
                        Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                      </Text>
                    )}
                  </YStack>
                  <YStack alignItems="flex-end">
                    <XStack
                      alignItems="center"
                      borderRadius={4}
                      overflow="hidden"
                      borderColor="#ababab"
                      borderWidth={1}
                    >
                      <Pressable
                        onPress={() => decrementQuantity(item.id)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Minus size={10} color="#1f2937" />
                      </Pressable>
                      <Text paddingHorizontal={6} fontSize={12} color="#000">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => incrementQuantity(item.id)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Plus size={10} color="#1f2937" />
                      </Pressable>
                    </XStack>
                    <Text
                      fontSize={14}
                      alignSelf="flex-start"
                      fontWeight="600"
                      marginVertical={2}
                      color="#1f2937"
                    >
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </YStack>
                </XStack>
              ))
            ) : (
              <Text fontSize={14} color="#6b7280">
                Your cart is empty.
              </Text>
            )}
          </Card>

          <Card padding={16} backgroundColor="#ffffff">
            <YStack space={12}>
              <Text fontSize={14} fontWeight="600" color="#1f2937">
                Leave a Tip
              </Text>
              <XStack>
                {[10, 20, 30].map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => {}}
                    style={{
                      backgroundColor: '#e5e7eb',
                      borderRadius: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      marginRight: 4,
                    }}
                  >
                    <Text fontSize={12} color="#1f2937">
                      ₹{amount}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {}}
                  style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text fontSize={12} color="#1f2937">
                    Other
                  </Text>
                </Pressable>
              </XStack>
            </YStack>
          </Card>

          <Card
            padding={16}
            borderRadius={16}
            backgroundColor="#ffffff"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            shadowOffset={{ width: 0, height: 2 }}
          >
            <YStack space={12}>
              <Text fontSize={14} fontWeight="600" color="#1f2937">
                Schedule Delivery
              </Text>
              <Pressable onPress={() => {}}>
                <XStack alignItems="center" space={12}>
                  <Calendar size={18} color="#6b7280" />
                  <Text fontSize={12} color="#1f2937" flex={1}>
                    Deliver Now
                  </Text>
                  <ChevronDown size={16} color="#6b7280" />
                </XStack>
              </Pressable>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={handleSetSelectedAddress}
      />

      <YStack
        padding={20}
        backgroundColor="#ffffff"
        borderTopWidth={1}
        borderColor="#e5e7eb"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={10}
        shadowOffset={{ width: 0, height: -2 }}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={20} fontWeight="700" color="#1f2937">
              ₹{totalAmount.toFixed(2)}
            </Text>
          </YStack>
          <Link href="/Auth/userLogin" asChild>
            <Button
              size="$4"
              backgroundColor="#10b981"
              color="#fff"
              borderRadius={16}
              paddingHorizontal={32}
            >
              Place Order
            </Button>
          </Link>
        </XStack>
      </YStack>
    </YStack>
  );
}