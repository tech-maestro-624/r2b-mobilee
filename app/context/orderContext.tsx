// app/context/OrderContext.tsx

import React, { createContext, useContext, useState } from 'react';

// Define the structure of a food item
interface FoodItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: { name: string };
  addOns?: { name: string }[];
}

interface OrderState {
  selectedRestaurant: any; // Replace 'any' with the appropriate type
  selectedBranch: any;     // Replace 'any' with the appropriate type
  restaurantId: string | null;
  orderType: string;
  selectedFoodItems: FoodItem[];
}

interface OrderContextProps {
  orderState: OrderState;
  updateOrderState: (key: keyof OrderState, value: any) => void;
  addFoodItem: (foodItem: FoodItem) => void;
  updateFoodItem: (foodItemId: string, updates: Partial<FoodItem>) => void;
  removeFoodItem: (foodItemId: string) => void;
}

const initialOrderState: OrderState = {
  selectedRestaurant: null,
  selectedBranch: null,
  restaurantId: null,
  orderType: 'Delivery',
  selectedFoodItems: [],
};

const OrderContext = createContext<OrderContextProps>({
  orderState: initialOrderState,
  updateOrderState: () => {},
  addFoodItem: () => {},
  updateFoodItem: () => {},
  removeFoodItem: () => {},
});

export const useOrder = () => useContext(OrderContext);

export const OrderProvider: React.FC = ({ children }) => {
  const [orderState, setOrderState] = useState<OrderState>(initialOrderState);

  // General updater for any key in the state
  const updateOrderState = (key: keyof OrderState, value: any) => {
    setOrderState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // Add a new food item to the selectedFoodItems array
  const addFoodItem = (foodItem: FoodItem) => {
    setOrderState((prevState) => ({
      ...prevState,
      selectedFoodItems: [...prevState.selectedFoodItems, foodItem],
    }));
  };

  // Update an existing food item in the selectedFoodItems array
  const updateFoodItem = (foodItemId: string, updates: Partial<FoodItem>) => {
    setOrderState((prevState) => ({
      ...prevState,
      selectedFoodItems: prevState.selectedFoodItems.map((item) =>
        item.id === foodItemId ? { ...item, ...updates } : item
      ),
    }));
  };

  // Remove a food item from the selectedFoodItems array
  const removeFoodItem = (foodItemId: string) => {
    setOrderState((prevState) => ({
      ...prevState,
      selectedFoodItems: prevState.selectedFoodItems.filter(
        (item) => item.id !== foodItemId
      ),
    }));
  };

  const value: OrderContextProps = {
    orderState,
    updateOrderState,
    addFoodItem,
    updateFoodItem,
    removeFoodItem,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
