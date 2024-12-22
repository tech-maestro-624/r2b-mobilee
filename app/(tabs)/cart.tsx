import React, { useState, useLayoutEffect, useEffect } from 'react';
import { YStack, XStack, Text, Image, ScrollView, Button, Card } from 'tamagui';
import { ChevronDown, MapPin, Plus, Minus } from '@tamagui/lucide-icons';
import { Pressable, BackHandler, View } from 'react-native';
import { Link, useNavigation, useRouter } from 'expo-router';
import { getBranches } from 'app/api/branch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { useOrder } from 'app/context/orderContext';
import { createOrder, verifyPayment } from 'app/api/order';
import RazorpayCheckout from 'react-native-razorpay';
import { getFile } from 'app/api/flleUploads';

interface Address {
  id: number;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface Variant {
  _id: string;
  label: string;
  price: number;
  attributes?: any;
}

interface AddOn {
  name: string;
  price?: number;
}

interface FoodItem {
  id: string;
  name: string;
  image?: string[];   // This is an array of image IDs
  imageUrl?: string;  // We'll store the fetched image here
  price: number;      // Price is *inclusive* of tax
  quantity: number;
  variant?: Variant;
  addOns?: AddOn[];
  branchId: string;
  // If you store different tax slabs per item, add something like `taxSlab?: number;`
}

// Skeletons for loading state
const SkeletonBox = ({ width, height, borderRadius = 4, style = {} }: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => (
  <View style={[{ width, height, backgroundColor: '#e0e0e0', borderRadius }, style]} />
);

const SkeletonText = ({ width, height = 10, style = {} }: {
  width: number | string;
  height?: number;
  style?: any;
}) => <SkeletonBox width={width} height={height} borderRadius={4} style={style} />;

export default function Cart() {
  const navigation = useNavigation();
  const router = useRouter();
  const { updateOrderState } = useOrder();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [branch, setBranch] = useState<any>({});
  const [cartItems, setCartItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // In your backend logic, you have these possible additional fees.
  // We'll define them here so you can show them in the UI breakdown:
  const [packagingCharges, setPackagingCharges] = useState(10);  // example default
  const [platformFee, setPlatformFee] = useState(5);             // example default
  const [deliveryTip, setDeliveryTip] = useState(0);             // user-chosen tip
  const serviceCharge = 20;
  const discount = 10;

  // In your backend, delivery charge is "inclusive" of 18% tax,
  // so you'd extract the tax if you want to show it separated.
  // But for UI clarity, let's store the "base" plus "tax" separately.
  const [deliveryCharge, setDeliveryCharge] = useState(30);  // inclusive of 18% tax (example)
  // If we wanted to do an "extracted" approach, we might do:
  // const deliveryTax = (deliveryCharge * 18) / (100 + 18);
  // But we can keep it simple for the client UI.

  // Tax slab for your items. 
  // If every item is 5% inclusive, we can do a single slab,
  // or store it per item. We'll assume a single slab for demonstration:
  const itemTaxSlab = 5;  

  // We'll also define 18% for packaging, platform, etc. 
  // For your backend you do:
  //   packagingChargesTax = packagingCharges * 0.18
  //   platformFeeTax = platformFee * 0.18
  const packagingTaxRate = 0.18;
  const platformFeeTaxRate = 0.18;

  /**
   * 1) Load cart from AsyncStorage
   * 2) If cart has items -> fetch the branch details
   * 3) For each item that has an `image` array, call `getFile` to get item.imageUrl
   */
  const fetchCartItems = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (!cartData) {
        setCartItems([]);
        return;
      }
      const parsedCart: FoodItem[] = JSON.parse(cartData);

      // If the cart has items, fetch the branch
      if (parsedCart.length > 0) {
        const branchId = parsedCart[0].branchId;
        if (branchId) {
          const response1 = await getBranches({ condition: { _id: branchId } });
          setBranch(response1.data.branches[0]);
        }
      }

      // For each item, fetch the actual image (if item.image has at least one ID)
      const updatedCart = await Promise.all(
        parsedCart.map(async (item) => {
          if (Array.isArray(item.image) && item.image.length > 0) {
            try {
              const fileResp = await getFile(item.image[0]);
              return { ...item, imageUrl: fileResp.data.data };
            } catch (err) {
              console.log('Error fetching file for cart item', item.id, err);
              return item; // fallback
            }
          }
          return item; // no images
        })
      );

      setCartItems(updatedCart);
    } catch (error) {
      console.log('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load addresses from AsyncStorage
   */
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

  useFocusEffect(
    React.useCallback(() => {
      fetchCartItems();
      fetchAddresses();
    }, [])
  );

  const handleSetSelectedAddress = async (address: Address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  };

  // Increase/decrease item quantity
  const incrementQuantity = async (itemId: string) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
  };
  const decrementQuantity = async (itemId: string) => {
    const currentItem = cartItems.find((item) => item.id === itemId);
    if (!currentItem) return;
    if (currentItem.quantity > 1) {
      const updatedCartItems = cartItems.map((cItem) =>
        cItem.id === itemId ? { ...cItem, quantity: cItem.quantity - 1 } : cItem
      );
      setCartItems(updatedCartItems);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
    } else {
      // Remove item if quantity goes below 1
      const updatedCartItems = cartItems.filter((cItem) => cItem.id !== itemId);
      setCartItems(updatedCartItems);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
    }
  };

  /**
   * Mimicking your backend logic:
   *  For each item:
   *   - itemPrice = item.price * item.quantity (inclusive of tax)
   *   - itemTax = itemPrice * itemTaxSlab / (100 + itemTaxSlab)
   *   - itemSubtotal = itemPrice  (since it's inclusive)
   *
   * Then sum them all up to get subTotal and totalTax, etc.
   */
  const itemsWithCalc = cartItems.map((item) => {
    // If you store a custom taxSlab on each item, use item.taxSlab. 
    // For now, using a single global itemTaxSlab
    const itemPrice = item.price * item.quantity;
    const itemTax = (itemPrice * itemTaxSlab) / (100 + itemTaxSlab);
    return {
      ...item,
      itemPrice,
      itemTax,
    };
  });

  // Subtotal = sum of itemPrice (which is tax-inclusive)
  const subTotal = itemsWithCalc.reduce((sum, i) => sum + i.itemPrice, 0);

  // totalTax = sum of itemTax across all items
  const totalItemTax = itemsWithCalc.reduce((sum, i) => sum + i.itemTax, 0);

  // Now handle packaging charges, platform fee, etc.
  // In your code, packagingChargesTax = packagingCharges * 0.18
  const packagingChargesTax = packagingCharges * packagingTaxRate;
  // platformFeeTax = platformFee * 0.18
  const actualPlatformFeeTax = platformFee * platformFeeTaxRate;

  // If your "deliveryCharge" is also inclusive of 18% tax, 
  // you can do something similar to "extraction"—but let's keep it simple. 
  // We'll show it as a single line item in the UI. 
  // Or if you want to separate the tax, you can do:
  //   const deliveryChargeTax = (deliveryCharge * 18) / (100 + 18)
  // For demonstration, let's do a single line item for "Delivery Charge."

  // Final grand total
  // from your backend logic:
  // grandTotal =
  //   subTotal +
  //   totalTax  (the sum of item taxes, but itemPrice was inclusive, so be careful)
  //   packagingCharges +
  //   packagingChargesTax +
  //   serviceCharge +
  //   platformFee +
  //   platformFeeTax
  //   + deliveryTip (if you want to apply tip here)
  //   + (deliveryCharge) // if you want to add it
  //   - discount;
  //
  // BUT since each item price already included the item tax, you typically wouldn't
  // add "totalItemTax" *again*. (Because subTotal is already tax-included.)
  // If you want to display itemTax, that's okay for the breakdown, but we usually
  // don't add it *again* to the total. 
  //
  // For demonstration, let's do it as your server code: items are inclusive,
  // but you still keep track of that tax portion. 
  // (You wouldn’t double-add `totalItemTax` to the final total.)
  //
  // We'll do:
  // subTotal (already includes item taxes)
  // + packagingCharges + packagingChargesTax
  // + serviceCharge
  // + platformFee + platformFeeTax
  // + deliveryCharge (assuming it’s inclusive or you’re just showing it as a single charge)
  // + deliveryTip
  // - discount
  //

  const grandTotal =
    subTotal +
    packagingCharges +
    packagingChargesTax +
    serviceCharge +
    platformFee +
    actualPlatformFeeTax +
    deliveryCharge +
    deliveryTip -
    discount;

  /**
   * Payment Flow
   */
  const placeOrderFunc = async () => {
    try {
      const orderData = {
        branch: cartItems[0]?.branchId,
        items: cartItems.map((item) => ({
          _id: item.id,
          price: item.price, // inclusive
          quantity: item.quantity,
          taxSlab: itemTaxSlab, // or item-specific slab
          addOns: item.addOns || [],
          variant: item.variant
            ? {
                _id: item.variant._id,
                label: item.variant.label,
                price: item.variant.price,
              }
            : null,
          options: [],
        })),
        paymentMethod: 'COD', 
        orderType: 'Delivery',
        discount,
        serviceCharge,
        deliveryCharge,
        // plus if you want to send packagingCharges, platformFee, etc. to the backend:
        packagingCharges,
        platformFee,
        deliveryTip,
      };


      const response = await createOrder(orderData);
      const { razorpayOrderId, amount, currency } = response.data.paymentInitData || {};

      if (razorpayOrderId) {
        openRazorpayCheckout(razorpayOrderId, amount, currency);
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.log('Error placing order:', error);
      alert('Error placing order');
    }
  };

  const openRazorpayCheckout = (razorpayOrderId: string, amount: number, currency: string) => {
    const options = {
      description: 'Payment for your order',
      image: 'https://i0.wp.com/roll2bowltechnologies.com/wp-content/uploads/2023/08/Untitled_Artwork.png',
      currency: currency,
      key: 'rzp_test_LKwcKdhRp0mq9f', // Replace with your Razorpay Key ID
      amount: amount,
      order_id: razorpayOrderId,
      name: 'Roll2Bowl Technologies',
      theme: { color: '#53a20e' },
    };

    RazorpayCheckout.open(options)
      .then(async (data) => {
        // Payment success
        const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = data;
        try {
          const verifyResponse = await verifyPayment({
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature
          });
          if (verifyResponse.status === 200) {
            // Payment verified
            // router.push('/orderSuccess');
          } else {
            alert('Payment verification failed.');
          }
        } catch (error) {
          console.log('Error verifying payment:', error);
          alert('Error verifying payment');
        }
      })
      .catch((error) => {
        // Payment failed or cancelled
        console.log('Razorpay Error:', error);
        alert('Payment failed or was cancelled. Please try again.');
      });
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
   * Overriding the back button to go back to 'resturantDetails/resturant'
   */
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/resturantDetails/resturant');
        updateOrderState('restaurantId', branch?.restaurant?._id);
        return true; // Prevent default back
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [router, branch])
  );

  /**
   * UI Rendering
   */
  return (
    <YStack flex={1} backgroundColor="#f0f2f5">
      {/* Top section if not loading and cart not empty */}
      {loading ? (
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
          <SkeletonText width="60%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonText width="40%" height={10} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={20} borderRadius={4} />
        </YStack>
      ) : cartItems.length > 0 ? (
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
      ) : null}

      {/* Main Content */}
      {loading ? (
        // Loading skeleton
        <ScrollView>
          <YStack paddingHorizontal={5} paddingTop={20} space={16}>
            <Card padding={16} backgroundColor="#ffffff">
              {[...Array(2)].map((_, idx) => (
                <XStack key={idx} space={8} alignItems="flex-start" marginVertical={4}>
                  <SkeletonBox width={70} height={70} borderRadius={12} />
                  <YStack flex={1} space={4}>
                    <SkeletonText width="60%" style={{ marginBottom: 4 }} />
                    <SkeletonText width="40%" style={{ marginBottom: 4 }} />
                  </YStack>
                  <YStack alignItems="flex-end">
                    <SkeletonBox
                      width={70}
                      height={20}
                      borderRadius={4}
                      style={{ marginBottom: 8 }}
                    />
                    <SkeletonText width={50} />
                  </YStack>
                </XStack>
              ))}
            </Card>
            {/* ... more skeletons if needed ... */}
          </YStack>
        </ScrollView>
      ) : cartItems.length === 0 ? (
        // Empty cart
        <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={20}>
          <Text fontSize={20} fontWeight="700" color="#1f2937" textAlign="center" marginBottom={8}>
            Your cart is empty
          </Text>
          <Text fontSize={14} color="#6b7280" textAlign="center" marginBottom={20}>
            It looks like you haven't added anything yet. Discover delicious meals from our menu and
            get them delivered straight to your door.
          </Text>
          <XStack space={8}>
            <Button
              size="$4"
              backgroundColor="#10b981"
              color="#fff"
              borderRadius={16}
              onPress={() => {
                router.push('/(tabs)/');
              }}
            >
              Browse Restaurants
            </Button>
          </XStack>
        </YStack>
      ) : (
        // CART ITEMS
        <>
          <ScrollView>
            <YStack paddingHorizontal={5} paddingTop={20} space={16}>
              <Card padding={16} backgroundColor="#ffffff">
                {cartItems.map((item: FoodItem, index: number) => (
                  <XStack
                    key={`${item.id}-${index}`}
                    space={8}
                    alignItems="flex-start"
                    marginVertical={4}
                  >
                    {/* Display the fetched imageUrl if available */}
                    <Image
                      source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
                      style={{ width: 70, height: 70, borderRadius: 8 }}
                    />
                    <YStack flex={1} space={4}>
                      <Text fontSize={12} fontWeight="700" color="#1f2937">
                        {item.name}
                      </Text>
                      {item.variant && (
                        <Text fontSize={10} color="#6b7280">
                          {item.variant.label}
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
                ))}
              </Card>

              {/* Tip / Additional UI */}
              <Card padding={16} backgroundColor="#ffffff">
                <YStack space={12}>
                  <Text fontSize={14} fontWeight="600" color="#1f2937">
                    Leave a Tip
                  </Text>
                  <XStack space={8}>
                    {[10, 20, 30, 40].map((amount) => (
                      <Pressable
                        key={amount}
                        onPress={() => setDeliveryTip(amount)}
                        style={{
                          backgroundColor: deliveryTip === amount ? '#dbeafe' : '#e5e7eb',
                          borderRadius: 4,
                          paddingVertical: 8,
                          paddingHorizontal: 12, marginRight :10
                        }}
                      >
                        <Text fontSize={12} color="#1f2937">
                          ₹{amount}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => setDeliveryTip(0)}
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
                  {deliveryTip > 0 && (
                    <Text fontSize={12} color="#6b7280">
                      You've added a ₹{deliveryTip} tip
                    </Text>
                  )}
                </YStack>
              </Card>

              {/* Final Cost Breakdown */}
              <Card
                padding={16}
                backgroundColor="#ffffff"
                borderRadius={8}
                shadowColor="#000"
                shadowOpacity={0.05}
                shadowRadius={10}
                shadowOffset={{ width: 0, height: 2 }}
              >
                <YStack space={8}>
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Subtotal (items)
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{subTotal.toFixed(2)}
                    </Text>
                  </XStack>

                  {/* If you'd like to show item tax portion separately: */}
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Item Tax Extracted
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{totalItemTax.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Packaging Charges
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{packagingCharges.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Packaging Tax (18%)
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{packagingChargesTax.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Service Charge
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{serviceCharge.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Platform Fee
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{platformFee.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Platform Fee Tax (18%)
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{actualPlatformFeeTax.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Delivery Charge
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      ₹{deliveryCharge.toFixed(2)}
                    </Text>
                  </XStack>

                  {deliveryTip > 0 && (
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color="#1f2937">
                        Tip
                      </Text>
                      <Text fontSize={14} color="#1f2937">
                        ₹{deliveryTip.toFixed(2)}
                      </Text>
                    </XStack>
                  )}

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#1f2937">
                      Discount
                    </Text>
                    <Text fontSize={14} color="#1f2937">
                      -₹{discount.toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" marginTop="$2">
                    <Text fontSize={16} fontWeight="700" color="#1f2937">
                      Grand Total
                    </Text>
                    <Text fontSize={16} fontWeight="700" color="#1f2937">
                      ₹{grandTotal.toFixed(2)}
                    </Text>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
          </ScrollView>
        </>
      )}

      {/* Address Selection Bottom Sheet */}
      <AddressSelectionSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={handleSetSelectedAddress}
      />

      {/* Footer: Place Order */}
      {cartItems.length > 0 && !loading && (
        <YStack
          paddingHorizontal={20}
          paddingVertical={10}
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
                ₹{grandTotal.toFixed(2)}
              </Text>
            </YStack>
            <Button
              size="$4"
              backgroundColor="#10b981"
              color="#fff"
              borderRadius={16}
              paddingHorizontal={32}
              onPress={placeOrderFunc}
            >
              Place Order
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
