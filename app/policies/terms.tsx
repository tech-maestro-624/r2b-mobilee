import React, {useEffect} from 'react'
import { YStack, Text } from 'tamagui';
import { useNavigation } from 'expo-router'


function Terms() {
    const navigation = useNavigation()
     useEffect(() => {
            navigation.setOptions({
              title: 'Terms and Conditions',
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
        <Text>Terms and Condition</Text>
    </YStack>
  )
}

export default Terms;