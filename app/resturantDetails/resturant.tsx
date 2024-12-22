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
  StyleSheet,
  Dimensions,
  BackHandler,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Link, useNavigation, useFocusEffect, useRouter } from 'expo-router';
import { useOrder } from 'app/context/orderContext';
import { getRestaurantById } from 'app/api/restaurant';
import { getBranches } from 'app/api/branch';
import { getFoodItems } from 'app/api/foodItem';
import AddToCartSheet from './AddToCartSheet';
import BranchSelectionSheet from './BranchSelectionSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFile } from 'app/api/flleUploads';

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
  image: string;       // The original "image" field
  imageUrl?: string;   // We'll store the fetched image result here
  category: { name: string };
  variants?: Variant[];
  addOns?: AddOn[];
  isAvailable: boolean;
  hasVariants?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  image: string;       // Original image field or reference
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
  accordionHeaderBackground: 'transparent',
  accordionIcon: '#555555',
};

const screenWidth = Dimensions.get('window').width;

const RestaurantMenu: React.FC = () => {
  const navigation = useNavigation();
  const { orderState } = useOrder();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  // We'll store our food items in a { [category: string]: MenuItem[] } shape
  const [foodItems, setFoodItems] = useState<{ [category: string]: MenuItem[] }>({});
  const [restaurantDetails, setRestaurantDetails] = useState<any>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [filterButtonLayout, setFilterButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

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
    <View style={[{ width, height, backgroundColor: '#e0e0e0', borderRadius }, style]} />
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

  /**
   * Main data fetching logic:
   * 1. Restaurant details (and fetch the image)
   * 2. Branches
   * 3. Food items (for the selected branch, fetch each item's image)
   * 4. Cart data from storage
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Fetch restaurant details
        if (orderState.restaurantId) {
          const response = await getRestaurantById(orderState.restaurantId);
          const restData = response.data;
          // If there's an "image" field, fetch it from getFile
          if (restData?.image) {
            try {
              const fileResponse = await getFile(restData.image);
              restData.imageUrl = fileResponse.data.data; // store as imageUrl
            } catch (err) {
              console.log('Error fetching restaurant image:', err);
            }
          }
          setRestaurantDetails(restData);
        }

        // 2) Fetch branches (for this restaurant)
        if (orderState.restaurantId) {
          const response = await getBranches({
            condition: { restaurant: orderState.restaurantId },
          });
          setBranches(response.data.branches);
        }

        // 3) If we have a selected branch, fetch its food items
        //    For each item, fetch the file (if .image exists) and store in item.imageUrl
        if (selectedBranch?._id) {
          const response = await getFoodItems(selectedBranch._id);
          const fetchedFoodItems: MenuItem[] = response.data;

          // Convert each item.image to item.imageUrl
          const updatedFoodItems = await Promise.all(
            fetchedFoodItems.map(async (item) => {
              if (item.image) {
                try {
                  const fileResponse = await getFile(item.image);
                  return { ...item, imageUrl: fileResponse.data.data };
                } catch (error) {
                  console.log('Error fetching file for item:', item._id, error);
                  return item; // fallback
                }
              }
              return item;
            })
          );

          // Group the items by category
          const groupedItems = updatedFoodItems.reduce((acc: any, item) => {
            const category = item.category?.name || 'Uncategorized';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(item);
            return acc;
          }, {});

          setFoodItems(groupedItems);
          setExpandedCategories(new Set(Object.keys(groupedItems)));
        }

        // 4) If we have a selected branch, load cart from storage
        if (selectedBranch) {
          const storedCart = await AsyncStorage.getItem('cart');
          if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            // If there's an existing cart from a different branch,
            // prompt the user to clear it or keep it
            if (parsedCart.length > 0 && parsedCart[0].branchId !== selectedBranch._id) {
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
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderState.restaurantId, selectedBranch]);

  // If we have branches, but no selected branch, pick the first one
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches]);

  // Save cart to AsyncStorage
  const saveCartToStorage = async (updatedCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.log('Error saving cart to storage:', error);
    }
  };

  /**
   * Cart handling logic
   */
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
        image: selectedItem.image, // or store selectedItem.imageUrl if needed
        price: totalPrice,
        quantity: itemQuantity,
        variant: selectedItem.variants?.find((v) => v._id === selectedVariant),
        addOns: selectedItem.addOns?.filter((a) => selectedAddOns.includes(a._id)),
        branchId: selectedBranch._id,
      };

      const existingIndex = cart.findIndex(
        (cItem) =>
          cItem.id === newFoodItem.id &&
          cItem.variant?._id === newFoodItem.variant?._id &&
          JSON.stringify(cItem.addOns?.map((a) => a._id).sort()) ===
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
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
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

  /**
   * Cart item quantity helpers
   */
  const getItemQuantityInCart = (menuItem: MenuItem) => {
    const cartItem = cart.find((cItem) => cItem.id === menuItem._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const incrementCartItem = (menuItem: MenuItem) => {
    const existingIndex = cart.findIndex((cItem) => cItem.id === menuItem._id);
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
    const existingIndex = cart.findIndex((cItem) => cItem.id === menuItem._id);
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

  /**
   * Hide default header
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  /**
   * Expand/collapse categories
   */
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

  /**
   * Filter button
   */
  const handleFilterButtonLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setFilterButtonLayout({ x, y, width, height });
  };

  /**
   * Override back button behavior to go back to tabs
   */
  useEffect(() => {
    const onBackPress = () => {
      router.replace('/(tabs)/'); 
      return true; // Prevent default
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 30 }}>
      <ScrollView ref={scrollViewRef}>
        <XStack
          alignItems="center"
          paddingHorizontal={16}
          paddingTop={16}
          paddingBottom={8}
          justifyContent="space-between"
        >
          <Link href='/(tabs)/' asChild>
            <Pressable>
              {loading ? (
                <SkeletonBox width={24} height={24} borderRadius={12} />
              ) : (
                <AntDesign name="left" size={24} color={colors.text} />
              )}
            </Pressable>
          </Link>
        </XStack>

        {/* Restaurant Header (Restaurant Image, Name, Description, etc.) */}
        <YStack padding={16}>
          <XStack space={16} alignItems="center">
            {loading ? (
              <SkeletonBox width={128} height={128} borderRadius={64} />
            ) : (
              <Image
                source={{
                  uri:
                    // Use restaurantDetails.imageUrl if available
                    restaurantDetails.imageUrl || 'https://via.placeholder.com/128',
                }}
                style={{ width: 128, height: 128, borderRadius: 64 }}
              />
            )}
            <YStack flex={1}>
              {loading ? (
                <>
                  <SkeletonText width="60%" height={20} style={{ marginBottom: 8 }} />
                  <SkeletonText width="80%" height={14} style={{ marginBottom: 4 }} />
                  <SkeletonText width="40%" height={14} />
                </>
              ) : (
                <>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                    {restaurantDetails.name || 'Restaurant Name'}
                  </Text>
                  <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                    {restaurantDetails.description || 'Restaurant description here.'}
                  </Text>
                  <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                    Rating: {restaurantDetails.rating || 'N/A'} ⭐
                  </Text>
                </>
              )}
            </YStack>
          </XStack>

          {/* Branch Selection */}
          <Pressable
            onPress={() => !loading && setIsBranchSheetOpen(true)}
            disabled={loading}
          >
            {loading ? (
              <SkeletonBox width="100%" height={50} borderRadius={12} style={{ marginTop: 16 }} />
            ) : (
              <YStack
                marginTop={16}
                borderRadius={12}
                style={{
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  backgroundColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  overflow: 'hidden',
                }}
              >
                <XStack
                  paddingVertical={12}
                  paddingHorizontal={16}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <XStack alignItems="center" space={8}>
                    <AntDesign name="enviromento" size={16} color={colors.primary} />
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: '600'
                      }}
                      numberOfLines={1}
                    >
                      {selectedBranch?.name || 'Select a Branch'}
                    </Text>
                  </XStack>
                  <AntDesign name="down" size={16} color={colors.text} />
                </XStack>
              </YStack>
            )}
          </Pressable>
        </YStack>

        {/* Delivery/Pickup Toggle */}
        {loading ? (
          <XStack
            paddingVertical={5}
            backgroundColor={colors.lightBackground}
            borderRadius={16}
            marginHorizontal={16}
            marginBottom={16}
            justifyContent="space-between"
          >
            <SkeletonBox width="48%" height={40} borderRadius={12} />
            <SkeletonBox width="48%" height={40} borderRadius={12} />
          </XStack>
        ) : (
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
        )}

        {/* Filters Button */}
        <View style={{ position: 'relative', paddingHorizontal: 16, paddingBottom: 8 }}>
          <XStack paddingVertical={8} justifyContent="flex-end" alignItems="center">
            {loading ? (
              <SkeletonBox width={80} height={40} borderRadius={16} />
            ) : (
              <Pressable
                onLayout={handleFilterButtonLayout}
                onPress={() => setShowFiltersMenu(!showFiltersMenu)}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginRight: 8 }}
                >
                  Filters
                </Text>
                <AntDesign name="down" size={14} color={colors.text} />
              </Pressable>
            )}
          </XStack>

          {showFiltersMenu && filterButtonLayout && (
            <View
              style={[
                styles.menuContainer,
                {
                  position: 'absolute',
                  top: filterButtonLayout.y + filterButtonLayout.height + 8,
                  width: filterButtonLayout.width * 1.5,
                  maxWidth: 250,
                },
                (() => {
                  const menuWidth = filterButtonLayout.width * 1.5;
                  let leftPosition = filterButtonLayout.x;

                  if (leftPosition + menuWidth > screenWidth - 16) {
                    leftPosition = screenWidth - menuWidth - 16;
                  }

                  return { left: leftPosition };
                })(),
              ]}
            >
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowFiltersMenu(false);
                  // your filter logic
                }}
              >
                <AntDesign
                  name="arrowup"
                  size={18}
                  color={colors.text}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: colors.text, fontSize: 14 }}>Low to High</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowFiltersMenu(false);
                  // your filter logic
                }}
              >
                <AntDesign
                  name="arrowdown"
                  size={18}
                  color={colors.text}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: colors.text, fontSize: 14 }}>High to Low</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Food Items / Menu List */}
        <YStack marginBottom={60}>
          {loading ? (
            // Loading skeleton
            <YStack paddingHorizontal={16} paddingTop={24} paddingBottom={10}>
              {[...Array(3)].map((_, idx) => (
                <View key={idx} style={{ marginBottom: 20 }}>
                  <SkeletonText width="40%" height={16} style={{ marginBottom: 12 }} />
                  {[...Array(2)].map((__, itemIdx) => (
                    <XStack
                      key={itemIdx}
                      paddingVertical={12}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <XStack space={12} flex={1}>
                        <SkeletonBox width={70} height={70} borderRadius={8} />
                        <YStack flex={1}>
                          <SkeletonText width="80%" style={{ marginBottom: 6 }} />
                          <SkeletonText width="60%" style={{ marginBottom: 6 }} />
                          <SkeletonText width="40%" />
                        </YStack>
                      </XStack>
                      <SkeletonBox width={80} height={32} borderRadius={16} />
                    </XStack>
                  ))}
                </View>
              ))}
            </YStack>
          ) : (
            // Render categories and items
            Object.entries(foodItems).map(([category, items]) => (
              <YStack key={category} paddingHorizontal={16} paddingTop={24} paddingBottom={10}>
                <TouchableOpacity
                  onPress={() => toggleCategory(category)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.accordionHeaderBackground,
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

                {expandedCategories.has(category) && (
                  <YStack marginTop={12}>
                    {items.map((item) => {
                      const itemAvailable = item.isAvailable;
                      const itemPrice = item.hasVariants
                        ? item.variants?.[0]?.price.toFixed(2)
                        : item.price?.toFixed(2);

                      return (
                        <XStack
                          key={item._id}
                          paddingVertical={12}
                          alignItems="center"
                          justifyContent="space-between"
                          style={{ opacity: itemAvailable ? 1 : 0.5 }}
                        >
                          <XStack space={12} flex={1}>
                            <Image
                              source={{
                                uri: item.imageUrl || 'https://via.placeholder.com/70',
                              }}
                              style={{ width: 70, height: 70, borderRadius: 8 }}
                            />
                            <YStack flex={1}>
                              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                                {item.name}
                              </Text>
                              <Text style={{ color: colors.subtleText, fontSize: 12 }}>
                                ₹{itemPrice}
                              </Text>
                              <Text style={{ color: colors.subtleText, fontSize: 12 }}>
                                {item.description}
                              </Text>
                            </YStack>
                          </XStack>
                          <YStack alignItems="center">
                            {getItemQuantityInCart(item) > 0 && itemAvailable ? (
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
                                onPress={() => itemAvailable && handleAddToCart(item)}
                                style={{
                                  backgroundColor: itemAvailable ? colors.primary : colors.lightBackground,
                                  borderRadius: 16,
                                  paddingVertical: 8,
                                  paddingHorizontal: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                disabled={!itemAvailable}
                              >
                                <Text
                                  style={{
                                    color: colors.buttonText,
                                    fontSize: 14,
                                    fontWeight: '700',
                                  }}
                                >
                                  {itemAvailable ? 'Add' : 'Unavailable'}
                                </Text>
                              </Pressable>
                            )}
                          </YStack>
                        </XStack>
                      );
                    })}
                  </YStack>
                )}
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>

      {/* View Cart Button (if cart has items) */}
      {cart.length > 0 && !loading && (
        <Link href="/(tabs)/cart" asChild>
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

      {/* Add-to-Cart Bottom Sheet */}
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

      {/* Branch Selection Bottom Sheet */}
      <BranchSelectionSheet
        isOpen={isBranchSheetOpen}
        onOpenChange={setIsBranchSheetOpen}
        branches={branches}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default RestaurantMenu;
