import React, {useEffect} from 'react'
import { YStack, Text } from 'tamagui';
import { useNavigation } from 'expo-router'


function Content() {
    const navigation = useNavigation()
     useEffect(() => {
            navigation.setOptions({
              title: 'Content Policy',
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
        <Text>Content</Text>
    </YStack>
  )
}

export default Content;