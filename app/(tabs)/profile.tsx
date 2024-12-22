// Profile.tsx

import React from 'react';
import {
  YStack,
  XStack,
  Text,
  Image,
  Button,
  ScrollView,
  Card,
  Separator,
} from 'tamagui';
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from '@expo/vector-icons';
import { Link } from 'expo-router';
import { getOrder } from 'app/api/order';

// Mock Data
const mockUser = {
  name: 'Chandru',
  email: 'chandru@example.com',
  phone: '+91 9876543210',
  avatar: 'https://via.placeholder.com/150',
};

const mockOrders = [
  {
    id: 'ORD123456',
    date: '2023-08-15',
    items: ['Pizza Margherita', 'Coke'],
    status: 'Delivered',
  },
  {
    id: 'ORD123457',
    date: '2023-08-10',
    items: ['Burger', 'Fries', 'Sprite'],
    status: 'Delivered',
  },
  {
    id: 'ORD123458',
    date: '2023-08-05',
    items: ['Sushi Platter'],
    status: 'Delivered',
  },
];

// OrderCard Component
const OrderCard: React.FC<{ order: typeof mockOrders[0] }> = ({ order }) => {
  return (
    <Card
      borderRadius="$4"
      padding="$4"
      backgroundColor="#ffffff"
      shadowColor="#000"
      shadowOpacity={0.1}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: 4 }}
      marginBottom="$4"
    >
      <YStack space="$2">
        <XStack ai="center" jc="space-between">
          <Text fontSize={14} fontWeight="700" color="#6200ee">
            {order.id}
          </Text>
          <Text
            fontSize={12}
            fontWeight="600"
            color={order.status === 'Delivered' ? '#4caf50' : '#f44336'}
          >
            {order.status}
          </Text>
        </XStack>
        <Text fontSize={12} color="#555">
          Date: {order.date}
        </Text>
        <Text fontSize={12} color="#555">
          Items: {order.items.join(', ')}
        </Text>
        <Button
          size="$2"
          borderRadius="$2"
          backgroundColor="#03dac5"
          paddingHorizontal="$3"
          paddingVertical="$1"
          alignSelf="flex-start"
          hoverStyle={{ backgroundColor: '#00bfa5' }}
          pressStyle={{ backgroundColor: '#009688' }}
          onPress={() => {
            // Handle Reorder Logic Here
          }}
        >
          <XStack ai="center" space="$1">
            <Entypo name="cycle" size={16} color="white" />
            <Text color="white" fontSize={14} fontWeight="600">
              Reorder
            </Text>
          </XStack>
        </Button>
      </YStack>
    </Card>
  );
};

function Profile() {

  const fetchOrder = async()=>{
    try {
      const response = await getOrder({condition : {customer : User._id}})
      
    } catch (error) {
      
    }
  }
  return (
    <YStack flex={1} backgroundColor="#f5f7fa" padding="$3">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
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
              source={{ uri: mockUser.avatar }}
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
            {mockUser.name}
          </Text>
          <Link href='/profile/editProfile' asChild>
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

        {/* User Details */}
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
          {/* Email */}
          <XStack ai="center" marginBottom="$4">
            <FontAwesome5 name="envelope" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              {mockUser.email}
            </Text>
          </XStack>
          {/* Divider */}
          <Separator color="#e0e0e0" />
          {/* Phone */}
          <XStack ai="center" marginTop="$4">
            <Ionicons name="call" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              {mockUser.phone}
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
          {/* Email */}
          <Link href='/location/savedAddress' asChild>
          <XStack ai="center" marginBottom="$4">
            <FontAwesome5 name="envelope" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              Saved Addresses
            </Text>
          </XStack>
          </Link>
          {/* Divider */}
          <Separator color="#e0e0e0" />
          {/* Phone */}
          <XStack ai="center" marginTop="$4">
            <Ionicons name="call" size={20} color="#6200ee" />
            <Text fontSize={16} fontWeight="600" color="#333" marginLeft="$3">
              Help & Support
            </Text>
          </XStack>
        </YStack>

        {/* User Statistics */}
        {/* <YStack
          backgroundColor="#ffffff"
          borderRadius="$4"
          padding="$5"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 2 }}
          marginBottom="$5"
        >
          <XStack ai="center" jc="space-around">
            <YStack ai="center">
              <Text fontSize={20} fontWeight="700" color="#6200ee">
                25
              </Text>
              <Text fontSize={14} fontWeight="600" color="#555">
                Orders
              </Text>
            </YStack>
            <YStack ai="center">
              <Text fontSize={20} fontWeight="700" color="#6200ee">
                5
              </Text>
              <Text fontSize={14} fontWeight="600" color="#555">
                Favorites
              </Text>
            </YStack>
            <YStack ai="center">
              <Text fontSize={20} fontWeight="700" color="#6200ee">
                3
              </Text>
              <Text fontSize={14} fontWeight="600" color="#555">
                Reviews
              </Text>
            </YStack>
          </XStack>
        </YStack> */}

        {/* Past Orders */}
        <YStack
          backgroundColor="#ffffff"
          borderRadius="$4"
          // padding="$2"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 2 }}
          marginBottom="$5"
        >
          <Text fontSize={20} fontWeight="700" color="#333" marginBottom="$4" marginLeft={10} marginTop={10}>
            Past Orders
          </Text>
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export default Profile;
