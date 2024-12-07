import React, { useState, useEffect, useLayoutEffect } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { YStack, Text, Input } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { getFoodItemBySearch } from 'app/api/foodItem';

interface Restaurant {
  _id: string;
  name: string;
  image?: string;
  rating: number;
  address: string;
}

interface Category {
  _id: string;
  name: string;
}

interface FoodItem {
  _id: string;
  name: string;
}

const BranchSearch = () => {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (query.length < 3) {
      setCategories([]);
      setFoodItems([]);
      setRestaurants([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      searchRestaurants(query);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchRestaurants = async (searchQuery: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await getFoodItemBySearch({ keyword: searchQuery });
      const { categories = [], foodItems = [], restaurants = [] } = response.data || {};
      setCategories(categories);
      setFoodItems(foodItems);
      setRestaurants(restaurants);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    console.log('Selected Restaurant:', restaurant);
  };

  const handleSelectCategory = (category: Category) => {
    console.log('Selected Category:', category);
  };

  const handleSelectFoodItem = (item: FoodItem) => {
    console.log('Selected Food Item:', item);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#ffffff', flex: 1 }}>
      <YStack flex={1} padding={16} marginTop={20}>
        <YStack marginBottom={16}>
          <Input
            placeholder="What do you feel like?"
            placeholderTextColor="#808080"
            borderWidth={1}
            borderColor="#ccc"
            backgroundColor="#f9f9f9"
            color="#000"
            fontSize={16}
            padding={12}
            borderRadius={8}
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
        </YStack>

        {loading && (
          <YStack ai="center" mt={16}>
            <ActivityIndicator size="large" color="#608a8a" />
            <Text color="#608a8a" mt={8}>
              Searching...
            </Text>
          </YStack>
        )}

        {!loading && error.length > 0 && (
          <YStack ai="center" mt={16}>
            <Text color="red">{error}</Text>
          </YStack>
        )}

        {!loading && !error && (categories.length > 0 || foodItems.length > 0 || restaurants.length > 0) && (
          <ScrollView>
            <YStack space={12}>

              {categories.length > 0 && (
                <YStack>
                  <Text style={styles.sectionHeader}>Categories</Text>
                  {categories.map((category, index) => (
                    <Pressable key={`${category._id}-${index}`} onPress={() => handleSelectCategory(category)}>
                      <YStack padding={12} backgroundColor="#f0f5f5" borderRadius={8}>
                        <Text style={styles.itemText}>{category.name}</Text>
                      </YStack>
                    </Pressable>
                  ))}
                </YStack>
              )}

              {foodItems.length > 0 && (
                <YStack>
                  <Text style={styles.sectionHeader}>Food Items</Text>
                  {foodItems.map((item, index) => (
                    <Pressable key={`${item._id}-${index}`} onPress={() => handleSelectFoodItem(item)}>
                      <YStack padding={12} backgroundColor="#f0f5f5" borderRadius={8}>
                        <Text style={styles.itemText}>{item.name}</Text>
                      </YStack>
                    </Pressable>
                  ))}
                </YStack>
              )}

              {restaurants.length > 0 && (
                <YStack>
                  <Text style={styles.sectionHeader}>Restaurants</Text>
                  {restaurants.map((restaurant, index) => (
                    <Pressable key={`${restaurant._id}-${index}`} onPress={() => handleSelectRestaurant(restaurant)}>
                      <YStack
                        padding={12}
                        backgroundColor="#f0f5f5"
                        borderRadius={8}
                        flexDirection="row"
                        alignItems="center"
                      >
                        <Image
                          source={{ uri: restaurant.image || 'https://via.placeholder.com/100' }}
                          style={styles.image}
                          accessibilityLabel={restaurant.name}
                        />
                        <YStack marginLeft={12} flex={1}>
                          <Text color="#111818" fontSize={16} fontWeight="600">
                            {restaurant.name}
                          </Text>
                          <Text color="#6b7280" fontSize={14}>
                            {restaurant.address}
                          </Text>
                          <Text color="#608a8a" fontSize={14}>
                            Rating: {restaurant.rating}
                          </Text>
                        </YStack>
                      </YStack>
                    </Pressable>
                  ))}
                </YStack>
              )}

            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#111818',
    fontWeight: '600',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});

export default BranchSearch;
