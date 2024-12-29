import { useNavigation } from 'expo-router'
import React, {useEffect} from 'react'

import { YStack, Text } from 'tamagui'

function Services() {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
          title: 'Services',
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
    <YStack>
        <Text>Services</Text>
    </YStack>
  )
}

export default Services;