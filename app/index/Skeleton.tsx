import React from 'react'
import { View } from 'react-native'

interface SkeletonBoxProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: any
}

export function SkeletonBox({
  width,
  height,
  borderRadius = 4,
  style = {},
}: SkeletonBoxProps) {
  return (
    <View
      style={[
        { width, height, backgroundColor: '#e0e0e0', borderRadius },
        style,
      ]}
    />
  )
}

interface SkeletonTextProps {
  width: number | string
  height?: number
  style?: any
}

export function SkeletonText({
  width,
  height = 10,
  style = {},
}: SkeletonTextProps) {
  return <SkeletonBox width={width} height={height} borderRadius={4} style={style} />
}
