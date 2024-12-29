// OrderSuccess.tsx
import React, { useEffect, useLayoutEffect } from 'react'
import { Image, ScrollView } from 'react-native'
import { YStack, XStack, Text, Button, Separator } from 'tamagui'
import { useNavigation } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native';
import { Box } from '@tamagui/lucide-icons'
import { View } from 'tamagui'

export default function OrderSuccess() {
  const navigation = useNavigation()

 useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  return (
    <YStack flex={1} bg="$white">
   <YStack
  bg="#333A2F" // Dark green background
  paddingHorizontal="$4"
  paddingVertical="$5"
  borderBottomLeftRadius="$6"
  borderBottomRightRadius="$6"
>
  <XStack
    alignItems="center"
    justifyContent="center"
    style={{ position: 'relative' }} 
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20, // To make it a circle
        backgroundColor: "#fff", // White background for the circle
        justifyContent: "center",
        alignItems: "center",
        position: "absolute", // Position the back icon absolutely
        left: 10, // Adjust as needed for alignment
      }}
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color="#000" // Black arrow
        onPress={() => navigation.goBack()}
      />
    </View>

    {/* Centered "Order Tracking" Text with Bottom Border */}
    <YStack alignItems="center" mt="$5">
      <Text
        fontSize="$8"
        fontWeight="700"
        color="#fff"
        borderBottomWidth={2}
        borderColor="#ffffff"
      >
        Order Tracking
      </Text>
      <Text fontSize="$3" fontWeight="600" color="#fff" mt="$2">
        Status: Being Prepared
      </Text>
    </YStack>
  </XStack>

  {/* Subtext: status label */}
</YStack>


      <ScrollView contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}>
        <YStack position="relative" mt="$4" mb="$2" alignItems="center">
          <YStack position="absolute">
          <Text
            top={20}
            fontSize={50}
            fontWeight="900"
            color="#e5e7eb"
            zIndex={1}
          >
            Order
          </Text>
          <Text
            fontSize={50}
            fontWeight="900"
            color="#e5e7eb"
            zIndex={1}
          >
             Successfull
          </Text>

          <YStack
          bg="#F5F5F5"
          borderRadius="$2"
          padding="$4"
          mb="$4"
          mt='$5'
        >
          <Text fontSize="$4" fontWeight="800" color="#111" mb="$1">
            Delivery Details
          </Text>
          <Text fontSize="$3" fontWeight="600" color="#444">
            Suhas .D
          </Text>
          <Text fontSize="$1" color="#666">
            Chief Delivery Officer,
          </Text>
          <Text fontSize="$2" color="#666" mb="$3">
            Team Roll2Bowl
          </Text>

          {/* Action buttons in a row */}
          <XStack space="$2" mt='$10' >
            <Button
              flex={1}
              // theme="green"
              backgroundColor='#333A2F'
            >
              <Text color='white'>
              Call Now
              </Text>
            </Button>
            <Button
              flex={1}
             backgroundColor='#EBEDDF'
              
            >
              <Text color='#000000'>
              Get Support
              </Text>
            </Button>
          </XStack>
        </YStack>
          </YStack>

          <Image
            source={require('../../assets/images/order.webp')}
            style={{ width: 200, height: 350,  zIndex: 2 , alignSelf: 'flex-end',}}
          />
        </YStack>

       

        {/*
          4. Order Details (Order Items + Totals)
        */}
        <YStack mb="$3" mt='$12' p='$5'>
          <YStack flexDirection='row' justifyContent='space-between'>
          <Text fontSize="$4" fontWeight="700" color="#111" mb="$1">
            Order Details
          </Text>
          <Text fontSize="$3" fontWeight="500" color="#777" mb="$3">
            #R2B0214
          </Text>
          </YStack>
          <Separator my="$2" />

          <Text fontSize="$3" fontWeight="600" color="#111" mb="$2">
            Order Items
          </Text>
        <Separator my="$2" />

          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text>Masala Dose x 1</Text>
              <Text>₹ 99/-</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Poha x 2</Text>
              <Text>₹ 99/-</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Idly Vada x 2</Text>
              <Text>₹ 99/-</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Rava Idly x 2</Text>
              <Text>₹ 99/-</Text>
            </XStack>
          </YStack>
        </YStack>

        <Separator my="$3" />

        {/* Totals */}
        <YStack mb="$4" p='$4'>
          <Text fontSize="$3" fontWeight="700" color="#111" mb="$2">
            Totals
          </Text>
          <XStack justifyContent="space-between" mb="$1">
            <Text>Order Total</Text>
            <Text>₹ 99/-</Text>
          </XStack>
          <XStack justifyContent="space-between" mb="$1">
            <Text>Taxes & Charges</Text>
            <Text>₹ 99/-</Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text>Delivery Charges</Text>
            <Text>₹ 99/-</Text>
          </XStack>
        </YStack>

        <Separator my="$3" />

       
        <YStack mb="$5" p='$4'>
          <Text fontSize="$4" fontWeight="700" color="#111" mb="$2" textAlign='center'>
            While you wait for your order
          </Text>
          <Text fontSize="$3" fontWeight="600" color="#444" mb="$2" textAlign='center'>
            Get to know about us
          </Text>
          <Text fontSize="$2" color="#555" lineHeight={20} mt='$2'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry&apos;s standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and scrambled
            it to make a type specimen book...
          </Text>
        </YStack>

        <Separator my="$3" />

        {/*
          6. Footer (Thank You note)
        */}
        <YStack alignItems="center" mb="$8">
          <Text fontSize="$2" color="#666" mb="$1">
            Thank you for your order
          </Text>
          <Text fontSize="$3" fontWeight="600" color="#111">
            Team Roll2Bowl
          </Text>
          <Text fontSize="$1" color="#999">
            Made with ❤️ in Namma Bengaluru
          </Text>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

const styles = StyleSheet.create({
  backIcon: {
    position: 'absolute',
    left: 0, // Align to the left within the parent XStack
  },
});