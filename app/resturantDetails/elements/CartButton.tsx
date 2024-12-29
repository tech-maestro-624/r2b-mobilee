// app/restaurantMenu/components/CartButton.tsx

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'

const colors = {
  primary: '#3498db',
  buttonText: '#ffffff',
}

interface CartItem {
  quantity: number
}

interface CartButtonProps {
  cart: CartItem[]
  loading: boolean
}

export default function CartButton({ cart, loading }: CartButtonProps) {
  if (cart.length === 0 || loading) {
    return null
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <Link href="/(tabs)/cart" asChild>
      <Pressable
        style={{
          position: 'absolute',
          bottom: 20,
          left: 10,
          right: 10,
          backgroundColor: colors.primary,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal:10,
          alignItems: 'center',
          flexDirection:'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.buttonText, fontSize: 16, fontWeight: '700' }}>
           {totalItems} items added 
        </Text>
        <Text style={{ color: colors.buttonText, fontSize: 16, fontWeight: '700' }}>View Cart </Text>
      </Pressable>
    </Link>
  )
}

