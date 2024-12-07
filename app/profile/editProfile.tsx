import React, { useCallback, useState, useEffect } from 'react';
import { TextInput, View, ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import toastConfig from 'app/toast/toastConfig';

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      phone: '',
      email: ''
    }
  });



  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data
    };

    setLoading(true);
    try {
      if (user) {
       
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Error updating profile',
        position: 'bottom',
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
        navigation.goBack();
      }, 350);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Profile',
      headerStyle: {
        backgroundColor: '#ffffff',
      },
      headerTitleStyle: {
        color: '#000000',
        fontWeight: 'bold',
      },
      headerTintColor: '#000000',
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <YStack style={{ flex: 1, padding: 20, backgroundColor: '#FFFFFF' }}>
          {/* Name Field */}
          <YStack style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 5 }}>
              Name
            </Text>
            <XStack style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 }}>
              <FontAwesome name="user" size={20} color="#666" />
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: '#333',  paddingVertical: 10, marginLeft: 10 }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Name"
                    placeholderTextColor="#999"
                  />
                )}
              />
            </XStack>
            {errors.name && <Text style={{ color: 'red' }}>{errors.name.message}</Text>}
          </YStack>

          {/* Phone Field */}
          <YStack style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 5 }}>
              Phone
            </Text>
            <XStack style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 }}>
              <FontAwesome name="phone" size={20} color="#666" />
              <Controller
                control={control}
                name="phone"
                render={({ field: { value } }) => (
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: '#333',  paddingVertical: 10, marginLeft: 10 }}
                    value={value}
                    editable={false}
                    placeholder="Enter Phone"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                )}
              />
            </XStack>
          </YStack>

          {/* Email Field */}
          <YStack style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 5 }}>
              Email
            </Text>
            <XStack style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 }}>
              <FontAwesome name="envelope" size={20} color="#666" />
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: '#333',  paddingVertical: 10, marginLeft: 10 }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />
                )}
              />
            </XStack>
            {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
          </YStack>

        </YStack>
       
      </ScrollView>
      <XStack
          style={{
            justifyContent: 'space-evenly',
            // padding: 10,
            backgroundColor: '#fff',
            elevation: 4,
            paddingBottom : 30
          }}
        >
          <Button
            style={{
              backgroundColor: '#ffffff',
              paddingHorizontal: 50,
              borderRadius: 5,
              borderWidth: 1, 
              borderColor: '#8c57ff'
            }}
            onPress={() => navigation.goBack()}
          >
            <Text color='#8c57ff'>Cancel</Text>
          </Button>
          <Button
            style={{
              backgroundColor: '#8c57ff',
              paddingHorizontal: 50,
              borderRadius: 5,
            }}
            onPress={handleSubmit(onSubmit)}
          >
            <Text color='#ffffff'>Save</Text>
          </Button>
        </XStack>
      <Toast config={toastConfig} />
    </View>
  );
}

export default EditProfile;