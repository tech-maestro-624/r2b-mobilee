// app/restaurantMenu/components/FilterMenu.tsx

import React from 'react'
import { View, Pressable, Text, Dimensions } from 'react-native'
import { XStack } from 'tamagui'
import { AntDesign } from '@expo/vector-icons'
import { SkeletonBox } from './Skeleton'

const colors = {
  text: '#333333',
  background: '#ffffff',
  border: '#e0e0e0',
}

interface FilterMenuProps {
  loading: boolean
  showFiltersMenu: boolean
  setShowFiltersMenu: React.Dispatch<React.SetStateAction<boolean>>
  filterButtonLayout: { x: number; y: number; width: number; height: number } | null
  handleFilterButtonLayout: (evt: any) => void
  screenWidth: number
  sortLowToHigh: () => void
  sortHighToLow: () => void
}

export default function FilterMenu({
  loading,
  showFiltersMenu,
  setShowFiltersMenu,
  filterButtonLayout,
  handleFilterButtonLayout,
  screenWidth,
  sortLowToHigh,
  sortHighToLow,
}: FilterMenuProps) {
  if (loading) {
    return (
      <View style={{ position: 'relative', paddingHorizontal: 16, paddingBottom: 8 }}>
        <XStack paddingVertical={8} justifyContent="flex-end" alignItems="center">
          <SkeletonBox width={80} height={40} borderRadius={16} />
        </XStack>
      </View>
    )
  }

  return (
    <View style={{ position: 'relative', paddingHorizontal: 16, paddingBottom: 8 }}>
      <XStack paddingVertical={8} justifyContent="flex-end" alignItems="center">
        <Pressable
          onLayout={handleFilterButtonLayout}
          onPress={() => setShowFiltersMenu(!showFiltersMenu)}
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginRight: 8 }}>
            Filters
          </Text>
          <AntDesign name="down" size={14} color={colors.text} />
        </Pressable>
      </XStack>

      {showFiltersMenu && filterButtonLayout && (
        <View
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            paddingVertical: 4,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            borderWidth: 1,
            borderColor: colors.border,
            top: filterButtonLayout.y + filterButtonLayout.height + 8,
            // compute left based on screen width
            left: (() => {
              const menuWidth = filterButtonLayout.width * 1.5
              let leftPos = filterButtonLayout.x
              if (leftPos + menuWidth > screenWidth - 16) {
                leftPos = screenWidth - menuWidth - 16
              }
              return leftPos
            })(),
            width: filterButtonLayout.width * 1.5,
            maxWidth: 250,
          }}
        >
          {/* Low to High */}
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
            onPress={() => {
              setShowFiltersMenu(false)
              sortLowToHigh()
            }}
          >
            <AntDesign name="arrowup" size={18} color={colors.text} style={{ marginRight: 10 }} />
            <Text style={{ color: colors.text, fontSize: 14 }}>Low to High</Text>
          </Pressable>

          {/* High to Low */}
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
            onPress={() => {
              setShowFiltersMenu(false)
              sortHighToLow()
            }}
          >
            <AntDesign name="arrowdown" size={18} color={colors.text} style={{ marginRight: 10 }} />
            <Text style={{ color: colors.text, fontSize: 14 }}>High to Low</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
