// app/restaurantMenu/components/BranchSelector.tsx

import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { AntDesign } from '@expo/vector-icons'
import { SkeletonBox } from './Skeleton'

const colors = {
  text: '#333333',
  primary: '#3498db',
}

interface Branch {
  _id: string
  name: string
}

interface BranchSelectorProps {
  loading: boolean
  selectedBranch: Branch | null
  setIsBranchSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function BranchSelector({
  loading,
  selectedBranch,
  setIsBranchSheetOpen,
}: BranchSelectorProps) {
  return (
    <Pressable
      onPress={() => !loading && setIsBranchSheetOpen(true)}
      disabled={loading}
      style={{ marginHorizontal: 16 }}
    >
      {loading ? (
        <SkeletonBox
          width="100%"
          height={50}
          borderRadius={12}
          style={{ marginTop: 16 }}
        />
      ) : (
        <YStack
          marginTop={16}
          borderRadius={12}
          style={{
            borderWidth: 1,
            borderColor: '#e0e0e0',
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            overflow: 'hidden',
          }}
        >
          <XStack
            paddingVertical={12}
            paddingHorizontal={16}
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack alignItems="center" space={8}>
              <AntDesign name="enviromento" size={16} color={colors.primary} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: '600',
                  maxWidth: 200,
                }}
                numberOfLines={1}
              >
                {selectedBranch?.name || 'Select a Branch'}
              </Text>
            </XStack>
            <AntDesign name="down" size={16} color={colors.text} />
          </XStack>
        </YStack>
      )}
    </Pressable>
  )
}
