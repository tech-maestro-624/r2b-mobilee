// OrderFeedback.tsx
import React, { useEffect, useState } from 'react'
import { ScrollView, Pressable, TextInput } from 'react-native'
import { YStack, XStack, Text, Button, Separator } from 'tamagui'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'

// A dummy star icon set for demonstration
// We'll show a smiling star for "filled" vs. outline for "empty."
const StarIconFilled = () => (
  <MaterialIcons name="star" size={32} color="#fbbf24" />
)
const StarIconOutline = () => (
  <MaterialIcons name="star-border" size={32} color="#9ca3af" />
)

export default function OrderFeedback() {
  // States for rating
  const [foodRating, setFoodRating] = useState(0)       // integer from 0..5
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [feedback, setFeedback] = useState('')          // text from textarea
  const navigation = useNavigation()

  // Just a dummy order to replicate the "latest order" block
  const latestOrder = {
    itemName: 'Vicks Cough Drops',
    quantity: 1,
    price: 0.0,
    saved: 435,
    hasZeroPackaging: true,
  }

  /**
   * Renders a row of 5 stars. Tapping a star sets the rating
   * to that star's index (1-based).
   */
  const renderStars = (
    count: number,
    onChange: (val: number) => void
  ) => {
    return (
      <XStack space="$2">
        {[1, 2, 3, 4, 5].map((num) => {
          const filled = num <= count
          return (
            <Pressable key={num} onPress={() => onChange(num)}>
              {filled ? <StarIconFilled /> : <StarIconOutline />}
            </Pressable>
          )
        })}
      </XStack>
    )
  }

  /**
   * For rating display, if you want a "smiley star" icon,
   * simply replace the MaterialIcons with your custom star image
   * or any vector icon that has a smiley face.
   */

  const handleSubmit = () => {
    // You can send this data to your API or server:
    // { foodRating, deliveryRating, feedback }
    console.log('Submitted:', { foodRating, deliveryRating, feedback })
    alert('Thank you for your feedback!')
  }

  useEffect(() => {
    navigation.setOptions({
      title:  'Feedback',
      headerStyle: {
        backgroundColor: '#ffffff',
      },
      headerTitleStyle: {
        color: '#000000',
        fontWeight: 'bold',
      },
      headerTintColor: '#000000',
    })
  }, [navigation])

  return (
    <YStack flex={1} backgroundColor="#fff">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Your Latest Order */}
        <YStack marginBottom="$4">
          <Text fontSize={16} fontWeight="700" color="#111" marginBottom="$1">
            Your latest order
          </Text>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$2"
          >
            <YStack>
              <XStack alignItems="center" space="$1" marginBottom="$1">
                {/* Some green dot or icon if you want (like a radio-button-checked) */}
                <MaterialIcons name="radio-button-checked" size={16} color="#10b981" />
                <Text fontSize={14} fontWeight="600" color="#111">
                  {latestOrder.itemName}
                </Text>
              </XStack>
              <Text fontSize={12} color="#6b7280">
                -  X {latestOrder.quantity}
              </Text>
            </YStack>
            <Text fontSize={14} fontWeight="600" color="#000">
              ₹{latestOrder.price.toFixed(1)}
            </Text>
          </XStack>

          <Pressable onPress={() => console.log('View order details tapped')}>
            <Text fontSize={12} fontWeight="600" color="#6b7280" marginBottom="$2">
              View order details &gt;
            </Text>
          </Pressable>

          {/* Saved info */}
          <YStack
            backgroundColor="#f0f2f5"
            borderRadius="$2"
            padding="$3"
            space="$2"
          >
            <XStack alignItems="center" space="$2">
              <MaterialIcons name="check-circle" size={16} color="#10b981" />
              <Text fontSize={12} fontWeight="600" color="#10b981">
                You’ve saved ₹{latestOrder.saved} on this order
              </Text>
            </XStack>
            {latestOrder.hasZeroPackaging && (
              <XStack alignItems="center" space="$2">
                <MaterialIcons name="check-circle" size={16} color="#10b981" />
                <Text fontSize={12} fontWeight="600" color="#10b981">
                  ZERO Packaging / Delivery Fees
                </Text>
              </XStack>
            )}
          </YStack>
        </YStack>

        {/* Need help with your order */}
        <YStack
          borderWidth={1}
          borderColor="#e5e7eb"
          borderRadius="$2"
          padding="$3"
          marginBottom="$4"
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
        >
          <YStack flex={1} marginRight="$2">
            <Text fontSize={14} fontWeight="600" color="#111" marginBottom="$1">
              Need help with your order?
            </Text>
            <Text fontSize={12} color="#6b7280">
              Chat with Customer Support
            </Text>
          </YStack>
          <Pressable onPress={() => console.log('Open chat tapped')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#111" />
          </Pressable>
        </YStack>

        <Separator my="$3" />

        {/* Rate your order title */}
        <Text fontSize={18} fontWeight="700" color="#111" marginBottom="$2">
          Please rate your order
        </Text>

        {/* Food rating */}
        <YStack marginBottom="$4">
          {renderStars(foodRating, setFoodRating)}
          <Text fontSize={14} fontWeight="600" color="#111" marginTop="$2">
            Food
          </Text>
        </YStack>

        {/* Delivery rating */}
        <YStack marginBottom="$4">
          {renderStars(deliveryRating, setDeliveryRating)}
          <Text fontSize={14} fontWeight="600" color="#111" marginTop="$2">
            Delivery
          </Text>
        </YStack>

        {/* Additional feedback text */}
        <Text fontSize={14} color="#555" marginBottom="$2">
          Our brand managers will directly get your feedback. Please take 10 seconds to
          tell us more.
        </Text>

        {/* Multiline input */}
        <YStack marginBottom="$4">
          <TextInput
            style={{
              height: 120,
              borderColor: '#e5e7eb',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              textAlignVertical: 'top',
              fontSize: 14,
              color: '#111',
            }}
            placeholder="Please specify in detail"
            placeholderTextColor="#9ca3af"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />
          {/* Example of an attach icon or something at the bottom-right, optional */}
        </YStack>

        {/* Submit Button */}
        <Button
          size="$4"
          borderRadius="$4"
          backgroundColor="#111"
          paddingHorizontal="$5"
        //   paddingVertical="$3"
          onPress={handleSubmit}
        >
          <Text fontSize={14} fontWeight="700" color="#fff">
            SUBMIT FEEDBACK
          </Text>
        </Button>
      </ScrollView>
    </YStack>
  )
}
