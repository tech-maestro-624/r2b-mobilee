// TabLayout.tsx

import React, { useState, useEffect } from 'react';
import { Link, Tabs, useRouter, usePathname } from 'expo-router';
import { Button, useTheme } from 'tamagui';
import { Home, Tag, ShoppingCart, User } from '@tamagui/lucide-icons';
import LoginScreen from 'app/Auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { useAuth } from 'app/context/AuthContext';
import 'react-native-reanimated';

export default function TabLayout() {
  const [loginSkipped, setLoginSkipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showSplash, setShowSplash] = useState(true); // Splash screen state
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname(); 
  const { isAuthenticated } = useAuth();

  const showButtonPaths = [
    '/',          
    '/offer'      
  ];

  // Function to check if login was skipped
  const checkLoginSkipped = async () => {
    try {
      const skipped = await AsyncStorage.getItem('loginSkipped');
      setLoginSkipped(skipped === 'true');
    } catch (e) {
      console.error('Failed to load loginSkipped from AsyncStorage', e);
    } finally {
      setLoading(false);
    }
  };

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

  // Initial check on component mount
  useEffect(() => {
    checkLoginSkipped();

    // Simulate splash screen timeout
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3300); // Show splash for 3 seconds

    return () => clearTimeout(splashTimeout);
  }, []);

  // Disable all other effects until splash screen is completed
  useEffect(() => {
    if (showSplash) return;
    fetchCartCount();
  }, [showSplash]);

  useFocusEffect(
    React.useCallback(() => {
      if (showSplash) return;
      fetchCartCount();
    }, [showSplash])
  );

  useEffect(() => {
    if (showSplash) return;
    fetchCartCount();
  }, [pathname, showSplash]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={require('../../assets/animations/Spashscreen rb2.lottie.json')} // Replace with the path to your JSON file
          autoPlay
          loop
          
          style={styles.lottie}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.color.val} />
      </View>
    );
  }

  if (!isAuthenticated ) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#10b981', // Tailwind green for accent
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
          },
          headerShown: false,
          tabBarLabelStyle: {
            color: '#111',
            fontSize: 12,
            fontWeight: '600',
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Order',
            tabBarIcon: ({ color }) => <Home color={color} />,
          }}
        />

        <Tabs.Screen
          name="offers"
          options={{
            title: 'Offers',
            tabBarIcon: ({ color }) => <Tag color={color} />,
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
        <Link href='/(tabs)/cart' asChild>
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
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebeddf',
  },
  lottie: {
    width: 600,
    height: 600,
  },
  stickyButton: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981', // Tailwind green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: 'center',
    zIndex: 1000,
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
