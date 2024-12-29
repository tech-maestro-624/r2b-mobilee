// app/restaurantMenu/components/HeaderSection.tsx

import React from 'react'
import { Pressable } from 'react-native'
import { Link } from 'expo-router'
import { XStack } from 'tamagui'
import { AntDesign } from '@expo/vector-icons'
import { SkeletonBox } from './Skeleton'

// For colors we can import from a constants file or define them here:
const colors = {
  text: '#333333',
}

interface HeaderSectionProps {
  loading: boolean
}

export default function HeaderSection({ loading }: HeaderSectionProps) {
  return (
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
  )
}
