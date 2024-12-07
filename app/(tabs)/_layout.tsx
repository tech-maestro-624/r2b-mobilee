// TabLayout.tsx

import React, { useState, useEffect } from 'react';
import { Link, Tabs, useRouter, usePathname } from 'expo-router';
import { Button, useTheme } from 'tamagui';
import { Atom, AudioWaveform } from '@tamagui/lucide-icons';
import { ShoppingBag, ShoppingCart, User } from '@tamagui/lucide-icons'; // Updated icons
import LoginScreen from 'app/Auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { useAuth } from 'app/context/AuthContext';

export default function TabLayout() {
  const [loginSkipped, setLogginSkiped] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [cartCount, setCartCount] = useState(0); 
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname(); 
  const {isAuthenticated } = useAuth()

  const showButtonPaths = [
    '/',          
    // '/profile', 
    '/offer'      
  ];

  useEffect(() => {
    const checkLoginSkipped = async () => {
      try {
        const loginSkipped = await AsyncStorage.getItem('loginSkipped');
        setLogginSkiped(loginSkipped === 'true');
      } catch (e) {
        console.error('Failed to load loginSkipped from AsyncStorage', e);
      } finally {
        setLoading(false);
      }
    };

    checkLoginSkipped();
  }, []);

  // Function to fetch cart items count
  const fetchCartCount = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        const count = parsedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCartCount();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.color.val} />
      </View>
    );
  }

  if (!isAuthenticated  || !loginSkipped) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.red10.val,
          tabBarStyle: {
            backgroundColor: theme.background.val,
            borderTopColor: theme.borderColor.val,
          },
          headerShown: false, 
          tabBarLabelStyle: {
            color: theme.color.val,
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Order',
            tabBarIcon: ({ color }) => <ShoppingBag  color={color} />,
          }}
        />

      <Tabs.Screen
          name="offers"
          options={{
            title: 'Offers',
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <ShoppingCart color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      
      </Tabs>

      {/* Sticky View Cart Button */}
      {cartCount > 0 && showButtonPaths.includes(pathname) && (
        <Link href='/cart/cart' asChild>
          <TouchableOpacity
            style={styles.stickyButton}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel={`View cart with ${cartCount} items`}
          >
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.cartText}>View Cart ({cartCount})</Text>
          </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stickyButton: {
    position: 'absolute',
    bottom: 60, // Adjust the bottom position as needed
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981', // Tailwind's green-500
    paddingVertical: 10,
    paddingHorizontal: 20,
    // borderTopLeftRadius: 12,
    // borderTopRightRadius: 12,
    borderRadius : 12,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: 'center',
    zIndex: 1000, // Ensure it stays above other elements
    marginHorizontal :20
  },
  cartText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
