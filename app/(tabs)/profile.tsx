// Profile.tsx

import React, { useEffect, useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Image,
  Button,
  ScrollView,
  Separator,
} from 'tamagui'
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons'
import { Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCustomerOrder } from 'app/api/order'

interface User {
  _id?: string
  name: string
  email: string
  phoneNumber: string
  avatar: string
}

interface Order {
  id: string
  deliveredDateTime: string
  mainItem: string
  moreItems: number
  totalPrice: number
  savedAmount: number
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Helper function to transform server response into the shape our UI needs
  const transformOrders = (apiOrders: any[]): Order[] => {
    return apiOrders.map((order: any) => {
      const mainItem =
        order.items && order.items.length > 0 && order.items[0].foodItem?.name
          ? order.items[0].foodItem.name
          : 'No main item'

      const deliveredDateTime = new Date(order.updatedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const savedAmount = order.discount ?? 0

      return {
        id: order.orderId || `#${order._id.slice(-6)}`,
        deliveredDateTime,
        mainItem,
        moreItems: order.items && order.items.length > 1 ? order.items.length - 1 : 0,
        totalPrice: order.grandTotal ?? 0,
        savedAmount,
      }
    })
  }

  const fetchData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user')
      if (!userDataString) {
        console.warn('User data not found in AsyncStorage.')
        setUser(null)
        setOrders([])
        setIsLoading(false)
        return
      }

      const storedUser = JSON.parse(userDataString)
      setUser(storedUser)

      if (storedUser && storedUser._id) {
        const response = await getCustomerOrder(storedUser._id)
        if (response && response.data && response.data.orders) {
          const transformed = transformOrders(response.data.orders)
          setOrders(transformed)
        } else {
          console.warn('No orders data returned from API.')
          setOrders([])
        }
      } else {
        console.warn('User ID not found. Skipping order fetch.')
        setOrders([])
      }
    } catch (error) {
      console.log('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#f5f7fa">
        <Text fontSize={18} color="#333">
          Loading...
        </Text>
      </YStack>
    )
  }

  if (!user) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#f5f7fa">
        <Text fontSize={18} color="#333">
          No user data found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="#f5f7fa" padding="$3">
      <ScrollView showsVerticalScrollIndicator={false}>

        <YStack
          alignItems="center"
          padding="$5"
          backgroundColor="#ffffff"
          borderRadius="$4"
          shadowColor="#000"
          shadowOpacity={0.1}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 4 }}
          marginBottom="$5"
        >
          <YStack
            position="relative"
            width={120}
            height={120}
            borderRadius={60}
            overflow="hidden"
            justifyContent="center"
            alignItems="center"
            background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            marginBottom="$3"
          >
            <Image
              source={{ uri: user.avatar }}
              width={110}
              height={110}
              borderRadius={55}
              alt="User Avatar"
            />
          </YStack>

          <Text
            fontSize={24}
            fontWeight="800"
            color="#333"
            textAlign="center"
            marginBottom="$2"
          >
            {user.name}
          </Text>

          <Link href="/profile/editProfile" asChild>
            <Button
              size="$3"
              borderRadius="$2"
              backgroundColor="#6200ee"
              paddingHorizontal="$4"
              paddingVertical="$2"
              alignSelf="center"
              hoverStyle={{ backgroundColor: '#5e35b1' }}
              pressStyle={{ backgroundColor: '#4527a0' }}
            >
              <XStack ai="center" space="$2">
                <MaterialIcons name="edit" size={18} color="white" />
                <Text color="white" fontSize={14} fontWeight="600">
                  Edit Profile
                </Text>
              </XStack>
            </Button>
          </Link>
        </YStack>

        <YStack
          backgroundColor="#ffffff"
          borderRadius="$4"
          padding="$5"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 2 }}
          marginBottom="$5"
        >
          <XStack ai="center" marginBottom="$4">
            <FontAwesome5 name="envelope" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              {user.email}
            </Text>
          </XStack>
          <Separator color="#e0e0e0" />
          <XStack ai="center" marginTop="$4">
            <Ionicons name="call" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              +91 {user.phoneNumber}
            </Text>
          </XStack>
        </YStack>

        <YStack
          backgroundColor="#ffffff"
          borderRadius="$4"
          padding="$5"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 2 }}
          marginBottom="$5"
        >
          <Link href="/location/savedAddress" asChild>
            <XStack ai="center" marginBottom="$4">
              <Ionicons name="location-sharp" size={20} color="#6200ee" />
              <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
                Saved Addresses
              </Text>
            </XStack>
          </Link>
          <Separator color="#e0e0e0" />
          <XStack ai="center" marginTop="$4">
            <Ionicons name="help-circle" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              Help & Support
            </Text>
          </XStack>
        </YStack>

        <YStack
          backgroundColor="#ffffff"
          borderRadius="$4"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 2 }}
          marginBottom="$5"
          paddingHorizontal="$2"
          paddingTop="$2"
          paddingBottom="$4"
        >
          <Text
            fontSize={18}
            fontWeight="700"
            color="#111"
            marginBottom="$1"
            marginTop="$3"
            marginLeft="$2"
          >
            MANAGE ORDERS
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color="#555"
            marginBottom="$4"
            marginLeft="$2"
          >
            Past Orders
          </Text>

          {orders.map((order, index) => (
            <YStack
              key={order.id}
              paddingVertical="$3"
              borderTopWidth={index === 0 ? 0 : 1}
              borderColor="#e5e7eb"
            >
              <XStack alignItems="center" space="$2" marginBottom="$1" marginLeft="$2">
                <MaterialIcons name="check-circle" size={16} color="#10b981" />
                <Text fontSize={14} fontWeight="600" color="#111">
                  {order.id}
                </Text>
              </XStack>

              <Text fontSize={12} color="#6b7280" marginBottom="$2" marginLeft="$2">
                Delivered on {order.deliveredDateTime}
              </Text>

              <Text fontSize={14} fontWeight="600" color="#111" marginLeft="$2">
                {order.mainItem}
              </Text>

              <Text fontSize={12} color="#6b7280" marginBottom="$2" marginLeft="$2">
                + {order.moreItems} more items
              </Text>

              <XStack alignItems="center" marginBottom="$2" marginLeft="$2">
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color="#000"
                  marginRight="$3"
                >
                  ₹ {(order.totalPrice).toFixed(2)}
                </Text>
                {/* <Text fontSize={12} fontWeight="600" color="#10b981">
                  You saved ₹ {order.savedAmount.toFixed(1)}
                </Text> */}
              </XStack>

              <XStack alignItems="center" space="$5" marginLeft="$2" marginTop="$1">
                <Link href="/order/OrderTracking" asChild>
                  <Button>
                    <Text fontSize={14} fontWeight="600" color="#6b7280">
                      REORDER
                    </Text>
                  </Button>
                </Link>
                <Link href="/Rating/rating" asChild>
                  <Button>
                    <Text fontSize={14} fontWeight="600" color="#10b981">
                      RATE ORDER
                    </Text>
                  </Button>
                </Link>
              </XStack>
            </YStack>
          ))}
        </YStack>

      </ScrollView>
    </YStack>
  )
}
