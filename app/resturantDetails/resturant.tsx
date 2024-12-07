// RestaurantMenu.tsx

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  YStack,
  XStack,
} from 'tamagui';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Link, useNavigation } from 'expo-router';
import { useOrder } from 'app/context/orderContext';
import { getRestaurantById } from 'app/api/restaurant';
import { getBranches } from 'app/api/branch';
import { getFoodItems } from 'app/api/foodItem';
import AddToCartSheet from './AddToCartSheet';
import BranchSelectionSheet from './BranchSelectionSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Variant {
  _id: string;
  label: string;
  price: number;
}

interface AddOn {
  _id: string;
  name: string;
  price: number;
}

interface MenuItem {
  _id: string;
  name: string;
  price?: number;
  description: string;
  image: string;
  category: { name: string };
  variants?: Variant[];
  addOns?: AddOn[];
  isAvailable: boolean;
  hasVariants?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: Variant;
  addOns?: AddOn[];
  branchId: string;
}

interface Branch {
  _id: string;
  name: string;
}

const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  text: '#333333',
  subtleText: '#888888',
  background: '#ffffff',
  border: '#dddddd',
  lightBackground: '#f9f9f9',
  buttonBackground: '#3498db',
  buttonText: '#ffffff',
  selectedBackground: '#e6f2fa',
  accordionHeaderBackground: 'transparent', // Changed to transparent
  accordionIcon: '#555555',
};

const RestaurantMenu: React.FC = () => {
  const navigation = useNavigation();
  const { orderState } = useOrder();

  const [deliveryOption, setDeliveryOption] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [foodItems, setFoodItems] = useState<{ [category: string]: MenuItem[] }>({});
  const [restaurantDetails, setRestaurantDetails] = useState<any>({});

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);

  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await getRestaurantById(orderState.restaurantId);
        console.log(response.data);
        
        setRestaurantDetails(response.data);
      } catch (error) {
        console.log('Error fetching restaurant details:', error);
      }
    };

    if (orderState.restaurantId) {
      fetchRestaurantDetails();
    }
  }, [orderState.restaurantId]);

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await getBranches({ condition: { restaurant: orderState.restaurantId } });
        setBranches(response.data.branches);
      } catch (error) {
        console.log('Error fetching branches:', error);
      }
    };

    if (orderState.restaurantId) {
      fetchBranchesData();
    }
  }, [orderState.restaurantId]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches]);

  useEffect(() => {
    const fetchFoodItemsData = async () => {
      if (!selectedBranch?._id) return;
      try {
        const response = await getFoodItems(selectedBranch._id);
        const fetchedFoodItems: MenuItem[] = response.data;

        const groupedItems = fetchedFoodItems.reduce((acc: any, item) => {
          const category = item.category?.name || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});

        setFoodItems(groupedItems);

        // Initialize all categories as expanded by default
        setExpandedCategories(new Set(Object.keys(groupedItems)));
      } catch (error) {
        console.log('Error fetching food items:', error);
      }
    };

    fetchFoodItemsData();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (parsedCart.length > 0) {
            if (selectedBranch) {
              if (parsedCart[0].branchId !== selectedBranch._id) {
                Alert.alert(
                  'Existing cart found',
                  'You have items from another restaurant. Do you want to clear the cart and start a new order?',
                  [
                    {
                      text: 'No',
                      onPress: () => {},
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      onPress: () => {
                        setCart([]);
                        AsyncStorage.removeItem('cart');
                      },
                    },
                  ],
                  { cancelable: false }
                );
              } else {
                setCart(parsedCart);
              }
            }
          }
        }
      } catch (error) {
        console.log('Error loading cart from storage:', error);
      }
    };

    if (selectedBranch) {
      fetchCart();
    }
  }, [selectedBranch]);

  const saveCartToStorage = async (updatedCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.log('Error saving cart to storage:', error);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (cart.length > 0 && selectedBranch) {
      if (cart[0].branchId !== selectedBranch._id) {
        Alert.alert(
          'Existing cart found',
          'You have items from another restaurant. Do you want to clear the cart and start a new order?',
          [
            {
              text: 'No',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                setCart([]);
                AsyncStorage.removeItem('cart');
                proceedToAddItem(item);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        proceedToAddItem(item);
      }
    } else {
      proceedToAddItem(item);
    }
  };

  const proceedToAddItem = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedVariant(item.variants?.[0]?._id || null);
    setSelectedAddOns([]);
    setItemQuantity(1);
    setIsSheetOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem && selectedBranch) {
      let basePrice = selectedItem.price || 0;

      if (selectedItem.hasVariants) {
        const variant = selectedItem.variants?.find((v) => v._id === selectedVariant);
        basePrice = variant?.price || basePrice;
      }

      const addOnsPrice =
        selectedItem.addOns
          ?.filter((a) => selectedAddOns.includes(a._id))
          .reduce((sum, a) => sum + a.price, 0) || 0;

      const totalPrice = basePrice + addOnsPrice;

      const newFoodItem: CartItem = {
        id: selectedItem._id,
        name: selectedItem.name,
        image: selectedItem.image,
        price: totalPrice,
        quantity: itemQuantity,
        variant: selectedItem.variants?.find((v) => v._id === selectedVariant),
        addOns: selectedItem.addOns?.filter((a) => selectedAddOns.includes(a._id)),
        branchId: selectedBranch._id,
      };

      const existingIndex = cart.findIndex(
        (item) =>
          item.id === newFoodItem.id &&
          item.variant?._id === newFoodItem.variant?._id &&
          JSON.stringify(item.addOns?.map((a) => a._id).sort()) ===
            JSON.stringify(newFoodItem.addOns?.map((a) => a._id).sort())
      );

      let updatedCart = [...cart];

      if (existingIndex !== -1) {
        updatedCart[existingIndex].quantity += itemQuantity;
      } else {
        updatedCart.push(newFoodItem);
      }

      setCart(updatedCart);
      saveCartToStorage(updatedCart);
      setIsSheetOpen(false);
    }
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    let basePrice = selectedItem.price || 0;

    if (selectedItem.hasVariants) {
      const variant = selectedItem.variants?.find((v) => v._id === selectedVariant);
      basePrice = variant?.price || basePrice;
    }

    const addOnsPrice =
      selectedItem.addOns
        ?.filter((a) => selectedAddOns.includes(a._id))
        .reduce((sum, a) => sum + a.price, 0) || 0;

    const totalPrice = (basePrice + addOnsPrice) * itemQuantity;
    return totalPrice;
  };

  const getItemQuantityInCart = (menuItem: MenuItem) => {
    const cartItem = cart.find((item) => item.id === menuItem._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const incrementCartItem = (menuItem: MenuItem) => {
    const existingIndex = cart.findIndex((item) => item.id === menuItem._id);

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    } else {
      handleAddToCart(menuItem);
    }
  };

  const decrementCartItem = (menuItem: MenuItem) => {
    const existingIndex = cart.findIndex((item) => item.id === menuItem._id);

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIndex].quantity > 1) {
        updatedCart[existingIndex].quantity -= 1;
      } else {
        updatedCart.splice(existingIndex, 1);
      }
      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const toggleCategory = (categoryName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  return (
    <YStack flex={1} backgroundColor={colors.background} paddingTop={30}>
      <ScrollView ref={scrollViewRef}>
        {/* Header */}
        <XStack
          alignItems="center"
          paddingHorizontal={16}
          paddingTop={16}
          paddingBottom={8}
          justifyContent="space-between"
        >
          <Link href='/(tabs)/' asChild>
            <Pressable>
              <AntDesign name="left" size={24} color={colors.text} />
            </Pressable>
          </Link>
          <Pressable onPress={() => { /* Handle share action */ }}>
            <Feather name="share-2" size={24} color={colors.text} />
          </Pressable>
        </XStack>

        {/* Restaurant Details */}
        <YStack padding={16}>
          <XStack space={16} alignItems="center">
            <Image
              source={{ uri: restaurantDetails.image || 'https://via.placeholder.com/128' }}
              style={{ width: 128, height: 128, borderRadius: 64 }}
            />
            <YStack flex={1}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                {restaurantDetails.name || 'Restaurant Name'}
              </Text>
              <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                {restaurantDetails.description || 'Restaurant description here.'}
              </Text>
              <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                Rating: {restaurantDetails.rating || 'N/A'} ⭐
              </Text>
            </YStack>
          </XStack>

          {/* Branch Selection */}
          <Pressable onPress={() => setIsBranchSheetOpen(true)}>
            <XStack
              paddingVertical={8}
              alignItems="center"
              paddingHorizontal={16}
              marginTop={16}
              backgroundColor={colors.lightBackground}
              borderRadius={12}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                Branch: {selectedBranch?.name || 'Select a Branch'}
              </Text>
              <AntDesign name="down" size={14} color={colors.text} style={{ marginLeft: 20 }} />
            </XStack>
          </Pressable>
        </YStack>

        {/* Delivery/Pickup Options */}
        <XStack
          paddingVertical={5}
          backgroundColor={colors.lightBackground}
          borderRadius={16}
          marginHorizontal={16}
          marginBottom={16}
          justifyContent="space-between"
        >
          {['Delivery', 'Pickup'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setDeliveryOption(option as 'Delivery' | 'Pickup')}
              style={{
                backgroundColor: deliveryOption === option ? colors.background : 'transparent',
                flex: 1,
                paddingVertical: 8,
                borderRadius: 12,
                marginHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: deliveryOption === option ? colors.text : colors.subtleText,
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </XStack>

        {/* Food Items with Accordion */}
        <YStack marginBottom={60}>
          {Object.entries(foodItems).map(([category, items]) => (
            <YStack key={category} paddingHorizontal={16} paddingTop={24} paddingBottom={10}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => toggleCategory(category)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: colors.accordionHeaderBackground, // Now transparent
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  {category}
                </Text>
                <AntDesign
                  name={expandedCategories.has(category) ? 'up' : 'down'}
                  size={20}
                  color={colors.accordionIcon}
                />
              </TouchableOpacity>

              {/* Conditionally Render Food Items */}
              {expandedCategories.has(category) && (
                <YStack marginTop={12}>
                  {items.map((item) => (
                    <XStack
                      key={item._id}
                      paddingVertical={12}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <XStack space={12} flex={1}>
                        <Image
                          source={{ uri:  'https://via.placeholder.com/70' }}
                          style={{ width: 70, height: 70, borderRadius: 8 }}
                        />
                        <YStack flex={1}>
                          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                            {item.name}
                          </Text>
                          <Text style={{ color: colors.subtleText, fontSize: 12 }}>
                            ₹
                            {item.hasVariants
                              ? item.variants?.[0]?.price.toFixed(2)
                              : item.price?.toFixed(2)}
                          </Text>
                          <Text style={{ color: colors.subtleText, fontSize: 12 }}>
                            {item.description}
                          </Text>
                        </YStack>
                      </XStack>
                      <YStack alignItems="center">
                        {getItemQuantityInCart(item) > 0 ? (
                          <XStack alignItems="center" space={8}>
                            <Pressable
                              onPress={() => decrementCartItem(item)}
                              style={{
                                backgroundColor: colors.lightBackground,
                                borderRadius: 16,
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AntDesign name="minus" size={16} color={colors.text} />
                            </Pressable>
                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                              {getItemQuantityInCart(item)}
                            </Text>
                            <Pressable
                              onPress={() => incrementCartItem(item)}
                              style={{
                                backgroundColor: colors.lightBackground,
                                borderRadius: 16,
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AntDesign name="plus" size={16} color={colors.text} />
                            </Pressable>
                          </XStack>
                        ) : (
                          <Pressable
                            onPress={() => handleAddToCart(item)}
                            style={{
                              backgroundColor: colors.primary,
                              borderRadius: 16,
                              paddingVertical: 8,
                              paddingHorizontal: 30,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: colors.buttonText, fontSize: 14, fontWeight: '700' }}>
                              Add
                            </Text>
                          </Pressable>
                        )}
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          ))}
        </YStack>
      </ScrollView>

      {/* View Cart Button */}
      {cart.length > 0 && (
        <Link href="/cart/cart" asChild>
          <Pressable
            style={{
              position: 'absolute',
              bottom: 20,
              left: 16,
              right: 16,
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.buttonText, fontSize: 14, fontWeight: '700' }}>
              View Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)
            </Text>
          </Pressable>
        </Link>
      )}

      {/* Add to Cart Sheet */}
      <AddToCartSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedItem={selectedItem}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        selectedAddOns={selectedAddOns}
        setSelectedAddOns={setSelectedAddOns}
        itemQuantity={itemQuantity}
        setItemQuantity={setItemQuantity}
        handleConfirmAddToCart={handleConfirmAddToCart}
        calculateTotal={calculateTotal}
        handleAddOnToggle={handleAddOnToggle}
        colors={colors}
      />

      {/* Branch Selection Sheet */}
      <BranchSelectionSheet
        isOpen={isBranchSheetOpen}
        onOpenChange={setIsBranchSheetOpen}
        branches={branches}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        colors={colors}
      />
    </YStack>
  );
};

export default RestaurantMenu;
