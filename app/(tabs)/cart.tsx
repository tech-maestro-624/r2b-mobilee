// Cart.tsx
import React, { useState, useLayoutEffect, useEffect, useContext } from 'react';
import { YStack, ScrollView } from 'tamagui';
import { Pressable, BackHandler } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';

import { getBranches } from 'app/api/branch';
import { getFile } from 'app/api/flleUploads';
import { createOrder, verifyPayment } from 'app/api/order';

import AddressSelectionSheet from 'app/cart/AddressSelectionSheet';
import { useOrder } from 'app/context/orderContext';
import { LocationContext } from 'app/context/locationContext';

// import CartHeader from './CartHeader';
import CartHeader from 'app/cart/CartHeader';
import CartItems from 'app/cart/CartItems';
import TipSelection from 'app/cart/TipSelection';
import PriceDetails from 'app/cart/PriceDetails';
import CartFooter from 'app/cart/CartFooter';
import OrderTypeSelection from 'app/cart/OrderTypeSelection';

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
}

export default function Cart() {
  const navigation = useNavigation();
  const router = useRouter();

  const { updateOrderState } = useOrder();
  const { coordinates } = useContext(LocationContext);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Branch + Cart
  const [branch, setBranch] = useState<any>({});
  const [cartItems, setCartItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fees & Charges
  const [packagingCharges, setPackagingCharges] = useState(10);    // example default
  const [platformFee, setPlatformFee] = useState(5);               // example default
  const [deliveryTip, setDeliveryTip] = useState<number | null>(null); 
  const [deliveryCharge, setDeliveryCharge] = useState(30);        // inclusive of 18% tax (example)
  const [serviceCharge] = useState(20);
  const [discount] = useState(10);
  const itemTaxSlab = 5;

  // Tax Rates
  const packagingTaxRate = 0.18;
  const platformFeeTaxRate = 0.18;

  // Order Type (Delivery or Pickup)
  const [orderType, setOrderType] = useState<'Delivery' | 'Pickup'>('Delivery');

  useEffect(() => {
    console.log("User Coordinates:", coordinates);
  }, [coordinates]);

  /**
   * Fetch cart items from AsyncStorage
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

      // For each item, fetch the actual image if present
      const updatedCart = await Promise.all(
        parsedCart.map(async (item) => {
          if (Array.isArray(item.image) && item.image.length > 0) {
            try {
              const fileResp = await getFile(item.image[0]);
              return { ...item, imageUrl: fileResp.data.data };
            } catch (err) {
              console.log('Error fetching file for cart item', item.id, err);
              return item;
            }
          }
          return item;
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
   * Fetch addresses from AsyncStorage
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

  /**
   * Hooks / Effects
   */
  useFocusEffect(
    React.useCallback(() => {
      fetchCartItems();
      fetchAddresses();
    }, [])
  );

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
        return true; // Prevent default back
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [router, branch])
  );

  /**
   * Handler: set selected address
   */
  const handleSetSelectedAddress = async (address: Address) => {
    setSelectedAddress(address);
    await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
  };

  /**
   * Increase/decrease item quantity
   */
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
   * Tip selection (toggle if same tip is selected)
   */
  const handleTipSelection = (tipValue: number) => {
    if (deliveryTip === tipValue) {
      setDeliveryTip(null); // Deselect if the same tip is tapped again
    } else {
      setDeliveryTip(tipValue);
    }
  };

  /**
   * Pricing calculations
   */
  const itemsWithCalc = cartItems.map((item) => {
    const itemPrice = item.price * item.quantity;
    // Extract item tax from inclusive price
    const itemTax = (itemPrice * itemTaxSlab) / (100 + itemTaxSlab);
    return {
      ...item,
      itemPrice,
      itemTax,
    };
  });

  const subTotal = itemsWithCalc.reduce((sum, i) => sum + i.itemPrice, 0);
  const totalItemTax = itemsWithCalc.reduce((sum, i) => sum + i.itemTax, 0);
  const packagingChargesTax = packagingCharges * packagingTaxRate;
  const actualPlatformFeeTax = platformFee * platformFeeTaxRate;
  
  const tipValue = deliveryTip || 0; // If null, treat as 0
  const grandTotal =
    subTotal +
    packagingCharges +
    packagingChargesTax +
    serviceCharge +
    platformFee +
    actualPlatformFeeTax +
    (orderType === 'Delivery' ? deliveryCharge : 0) + // Only add if Delivery
    tipValue -
    discount;

  /**
   * Payment flow
   */
  const placeOrderFunc = async () => {
    // Show alert if no address and user is ordering for Delivery
    if (orderType === 'Delivery' && !selectedAddress) {
      alert('Please select a delivery address before placing the order.');
      return;
    }

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
        orderType,
        discount,
        serviceCharge,
        deliveryCharge: orderType === 'Delivery' ? deliveryCharge : 0,
        packagingCharges,
        platformFee,
        deliveryTip: tipValue,
        // Only if the order type is 'Delivery'
        ...(orderType === 'Delivery' ? { deliveryAddress: selectedAddress } : {}),
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
            razorpaySignature: razorpay_signature,
          });
          if (verifyResponse.status === 200) {
            // Payment verified
            alert('Payment successful! Your order has been placed.');
            await AsyncStorage.removeItem('cart');
            router.replace('/orderSuccess');
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
   * Render
   */
  return (
    <YStack flex={1} backgroundColor="#f0f2f5">
      {/* Header (Restaurant + Address Selection) */}
      <CartHeader
        loading={loading}
        cartItems={cartItems}
        branch={branch}
        selectedAddress={selectedAddress}
        setIsSheetOpen={setIsSheetOpen}
      />

      {loading ? (
        <CartItems
          loading
          cartItems={[]} // empty if loading
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
        />
      ) : cartItems.length === 0 ? (
        // Empty cart
        <CartItems
          empty
          cartItems={[]}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
        />
      ) : (
        <>
          <ScrollView>
            {/* Cart Items */}
            <CartItems
              cartItems={cartItems}
              loading={false}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
            />

          <OrderTypeSelection
              orderType={orderType}
              setOrderType={setOrderType}
            />

            {/* Tip Selection */}
            <TipSelection
              deliveryTip={deliveryTip}
              handleTipSelection={handleTipSelection}
            />

            {/* Price Details */}
            <PriceDetails
              subTotal={subTotal}
              totalItemTax={totalItemTax}
              packagingCharges={packagingCharges}
              packagingTax={packagingChargesTax}
              serviceCharge={serviceCharge}
              platformFee={platformFee}
              platformFeeTax={actualPlatformFeeTax}
              deliveryCharge={orderType === 'Delivery' ? deliveryCharge : 0}
              discount={discount}
              deliveryTip={tipValue}
              grandTotal={grandTotal}
            />
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

      {/* Footer (Place Order + Order Type Switch) */}
      {cartItems.length > 0 && !loading && (
        <CartFooter
          grandTotal={grandTotal}
          selectedAddress={selectedAddress}
          placeOrderFunc={placeOrderFunc}
          orderType={orderType}
          setOrderType={setOrderType}
        />
      )}
    </YStack>
  );
}
