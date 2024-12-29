// app/restaurantMenu/RestaurantMenu.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import {
  View,
  Alert,
  BackHandler,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useNavigation, useRouter } from 'expo-router'
import { useOrder } from 'app/context/orderContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFile } from 'app/api/flleUploads'
import { getRestaurantById } from 'app/api/restaurant'
import { getBranches } from 'app/api/branch'
import { getFoodItems } from 'app/api/foodItem'

// Child sheets
import AddToCartSheet from './AddToCartSheet'
import BranchSelectionSheet from './BranchSelectionSheet'

// Our separate components
// import HeaderSection from './components/HeaderSection'
import HeaderSection from './elements/HeaderSection'
// import RestaurantHeader from './components/RestaurantHeader'
import RestaurantHeader from './elements/RestaurantHeader'
// import BranchSelector from './components/BranchSelector'
// import BranchSelectionSheet from './BranchSelectionSheet'
import BranchSelector from './elements/BranchSelector'
// import DeliveryPickupToggle from './components/DeliveryPickupToggle'
import DeliveryPickupToggle from './elements/DeliveryPickupToggle'
// import FilterMenu from './components/FilterMenu'
import FilterMenu from './elements/FilterMenu'
// import FoodItemsList from './components/FoodItemsList'
import FoodItemsList from './elements/FoodItemsList'
// import CartButton from './components/CartButton'
import CartButton from './elements/CartButton'

/** ----- Types & Interfaces (same as you had) ----- */
interface Variant {
  _id: string
  label: string
  price: number
}

interface AddOn {
  _id: string
  name: string
  price: number
}

interface MenuItem {
  _id: string
  name: string
  price?: number
  description: string
  image: string[] | string
  imageUrl?: string
  category: { _id: string; name: string }
  variants?: Variant[]
  addOns?: AddOn[]
  isAvailable: boolean
  hasVariants?: boolean
}

interface CartItem {
  id: string
  name: string
  image: string[] | string
  imageUrl?: string
  price: number
  quantity: number
  variant?: Variant
  addOns?: AddOn[]
  branchId: string
}

interface Branch {
  _id: string
  name: string
}

const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  text: '#333333',
  subtleText: '#888888',
  background: '#ffffff',
  border: '#dddddd',
  lightBackground: '#f9f9f9',
  buttonBackground: '#3498db',
  buttonText: '#ffffff',
  selectedBackground: '#e6f2fa',
  accordionHeaderBackground: 'transparent',
  accordionIcon: '#555555',
};

const screenWidth = Dimensions.get('window').width

export default function RestaurantMenu() {
  const navigation = useNavigation()
  const router = useRouter()
  const { orderState } = useOrder()

  // States
  const [loading, setLoading] = useState(true)
  const [showFood, setShowFood] = useState(false) // Delay content after skeleton
  const [deliveryOption, setDeliveryOption] = useState<'Delivery' | 'Pickup'>('Delivery')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [itemQuantity, setItemQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [foodItems, setFoodItems] = useState<{ [categoryName: string]: MenuItem[] }>({})
  const [categoryIdToName, setCategoryIdToName] = useState<{ [id: string]: string }>({})
  const [restaurantDetails, setRestaurantDetails] = useState<any>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Filter menu
  const [showFiltersMenu, setShowFiltersMenu] = useState(false)
  const [filterButtonLayout, setFilterButtonLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const scrollViewRef = useRef<ScrollView>(null)

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }

  // SKELETON -> CONTENT delay
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowFood(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setShowFood(false)
    }
  }, [loading])

  // 1) Load Restaurant + Branches
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Restaurant details
        if (orderState.restaurantId) {
          const rRes = await getRestaurantById(orderState.restaurantId)
          const restData = rRes.data

          if (restData?.image) {
            try {
              let imageId: string | undefined
              if (Array.isArray(restData.image) && restData.image.length > 0) {
                imageId = restData.image[0]
              } else if (typeof restData.image === 'string') {
                imageId = restData.image
              }
              if (imageId) {
                const fileRes = await getFile(imageId)
                restData.imageUrl = fileRes.data.data
              } else {
                restData.imageUrl = 'https://via.placeholder.com/128'
              }
            } catch {
              restData.imageUrl = 'https://via.placeholder.com/128'
            }
          } else {
            restData.imageUrl = 'https://via.placeholder.com/128'
          }
          setRestaurantDetails(restData)
        }

        // Branches
        if (orderState.restaurantId) {
          const bRes = await getBranches({
            condition: { restaurant: orderState.restaurantId },
          })
          setBranches(bRes.data.branches)
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [orderState.restaurantId])

  // 2) If branches exist and none selected, pick first
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0])
    }
  }, [branches, selectedBranch])

  // 3) If branch selected, fetch items + load cart
  useEffect(() => {
    const fetchItemsAndCart = async () => {
      if (!selectedBranch?._id) return
      setLoading(true)
      try {
        // Food items
        const fiRes = await getFoodItems(selectedBranch._id)
        const groupedFoodItems = fiRes.data

        // Fetch image for each item
        const updatedFoodItems = await Promise.all(
          Object.entries(groupedFoodItems).map(async ([catName, items]) => {
            const updatedItems = await Promise.all(
              items.map(async (item: MenuItem) => {
                if (item.image) {
                  let imageId: string | undefined
                  if (Array.isArray(item.image) && item.image.length > 0) {
                    imageId = item.image[0]
                  } else if (typeof item.image === 'string') {
                    imageId = item.image
                  }
                  if (imageId) {
                    try {
                      const fileResp = await getFile(imageId)
                      return { ...item, imageUrl: fileResp.data.data }
                    } catch {
                      return { ...item, imageUrl: 'https://via.placeholder.com/70' }
                    }
                  }
                }
                return { ...item, imageUrl: 'https://via.placeholder.com/70' }
              })
            )
            return { [catName]: updatedItems }
          })
        )

        // Flatten
        const flattened = updatedFoodItems.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        setFoodItems(flattened)

        // categoryId -> categoryName
        const idToNameMap: { [id: string]: string } = {}
        Object.keys(flattened).forEach((catName) => {
          const items = flattened[catName]
          if (items.length > 0) {
            idToNameMap[items[0].category._id] = catName
          }
        })
        setCategoryIdToName(idToNameMap)

        // Expand all
        setExpandedCategories(new Set(Object.keys(flattened)))

        // Load cart
        const storedCart = await AsyncStorage.getItem('cart')
        if (storedCart) {
          const parsedCart: CartItem[] = JSON.parse(storedCart)
          if (parsedCart.length > 0 && parsedCart[0].branchId !== selectedBranch._id) {
            Alert.alert(
              'Existing cart found',
              'You have items from another branch. Clear cart?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes',
                  onPress: () => {
                    setCart([])
                    AsyncStorage.removeItem('cart')
                  },
                },
              ],
              { cancelable: false }
            )
          } else {
            setCart(parsedCart)
          }
        } else {
          setCart([])
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load items.')
      } finally {
        setLoading(false)
      }
    }
    fetchItemsAndCart()
  }, [selectedBranch])

  // ----------------------------------------------------------------
  // CART logic
  // ----------------------------------------------------------------
  const saveCartToStorage = useCallback(async (updatedCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
    } catch (error) {
      console.log('Error saving cart to storage:', error)
    }
  }, [])

  const handleAddToCart = (item: MenuItem) => {
    if (cart.length > 0 && selectedBranch) {
      if (cart[0].branchId !== selectedBranch._id) {
        Alert.alert(
          'Existing cart found',
          'You have items from another branch. Clear cart first?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                setCart([])
                AsyncStorage.removeItem('cart')
                proceedToAddItem(item)
              },
            },
          ],
          { cancelable: false }
        )
      } else {
        proceedToAddItem(item)
      }
    } else {
      proceedToAddItem(item)
    }
  }

  const proceedToAddItem = (item: MenuItem) => {
    setSelectedItem(item)
    setSelectedVariant(item.variants?.[0]?._id || null)
    setSelectedAddOns([])
    setItemQuantity(1)
    setIsSheetOpen(true)
  }

  const handleConfirmAddToCart = () => {
    if (!selectedItem || !selectedBranch) return
    let basePrice = selectedItem.price || 0
    if (selectedItem.hasVariants) {
      const variant = selectedItem.variants?.find((v) => v._id === selectedVariant)
      basePrice = variant?.price || basePrice
    }
    const addOnsPrice =
      selectedItem.addOns
        ?.filter((a) => selectedAddOns.includes(a._id))
        .reduce((sum, a) => sum + a.price, 0) || 0
    const totalPrice = basePrice + addOnsPrice

    const newFoodItem: CartItem = {
      id: selectedItem._id,
      name: selectedItem.name,
      image: selectedItem.image,
      imageUrl: selectedItem.imageUrl,
      price: totalPrice,
      quantity: itemQuantity,
      variant: selectedItem.variants?.find((v) => v._id === selectedVariant),
      addOns: selectedItem.addOns?.filter((a) => selectedAddOns.includes(a._id)),
      branchId: selectedBranch._id,
    }

    const existingIndex = cart.findIndex(
      (cItem) =>
        cItem.id === newFoodItem.id &&
        cItem.variant?._id === newFoodItem.variant?._id &&
        JSON.stringify(cItem.addOns?.map((ad) => ad._id).sort()) ===
          JSON.stringify(newFoodItem.addOns?.map((ad) => ad._id).sort())
    )

    const updatedCart = [...cart]
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += itemQuantity
    } else {
      updatedCart.push(newFoodItem)
    }
    setCart(updatedCart)
    saveCartToStorage(updatedCart)
    setIsSheetOpen(false)
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    )
  }

  const calculateTotal = () => {
    if (!selectedItem) return 0
    let basePrice = selectedItem.price || 0
    if (selectedItem.hasVariants) {
      const variant = selectedItem.variants?.find((v) => v._id === selectedVariant)
      basePrice = variant?.price || basePrice
    }
    const addOnsPrice =
      selectedItem.addOns
        ?.filter((a) => selectedAddOns.includes(a._id))
        .reduce((sum, a) => sum + a.price, 0) || 0
    return (basePrice + addOnsPrice) * itemQuantity
  }

  // Increment/Decrement
  const getItemQuantityInCart = (menuItem: MenuItem) => {
    const cartItem = cart.find((cItem) => cItem.id === menuItem._id)
    return cartItem ? cartItem.quantity : 0
  }
  const incrementCartItem = (menuItem: MenuItem) => {
    const idx = cart.findIndex((cItem) => cItem.id === menuItem._id)
    if (idx !== -1) {
      const updated = [...cart]
      updated[idx].quantity += 1
      setCart(updated)
      saveCartToStorage(updated)
    } else {
      handleAddToCart(menuItem)
    }
  }
  const decrementCartItem = (menuItem: MenuItem) => {
    const idx = cart.findIndex((cItem) => cItem.id === menuItem._id)
    if (idx !== -1) {
      const updated = [...cart]
      if (updated[idx].quantity > 1) {
        updated[idx].quantity -= 1
      } else {
        updated.splice(idx, 1)
      }
      setCart(updated)
      saveCartToStorage(updated)
    }
  }

  // Hide default header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  // BackHandler override
  useEffect(() => {
    const onBackPress = () => {
      router.replace('/(tabs)/')
      return true
    }
    BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }
  }, [router])

  // Expand/collapse
  const toggleCategory = (catName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedCategories((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(catName)) nextSet.delete(catName)
      else nextSet.add(catName)
      return nextSet
    })
  }

  // Filter button layout
  const handleFilterButtonLayout = (evt: any) => {
    const { x, y, width, height } = evt.nativeEvent.layout
    setFilterButtonLayout({ x, y, width, height })
  }

  // Sort logic
  const sortLowToHigh = () => {
    const clone = { ...foodItems }
    Object.keys(clone).forEach((cat) => {
      clone[cat].sort((a, b) => (a.price || 0) - (b.price || 0))
    })
    setFoodItems(clone)
  }
  const sortHighToLow = () => {
    const clone = { ...foodItems }
    Object.keys(clone).forEach((cat) => {
      clone[cat].sort((a, b) => (b.price || 0) - (a.price || 0))
    })
    setFoodItems(clone)
  }

  // Reorder categories if there's a selectedCategory
  const { selectedCategory } = orderState
  const getReorderedCategories = () => {
    const catNames = Object.keys(foodItems)
    let prioritizedName = null
    if (selectedCategory && categoryIdToName[selectedCategory]) {
      prioritizedName = categoryIdToName[selectedCategory]
    }
    if (prioritizedName && catNames.includes(prioritizedName)) {
      return [
        prioritizedName,
        ...catNames.filter((nm) => nm !== prioritizedName),
      ]
    } else {
      return catNames
    }
  }
  const reorderedCategories = getReorderedCategories()

  /** RENDER **/
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 30 }}>
      <ScrollView ref={scrollViewRef}>
        {/* 1) Header */}
        <HeaderSection loading={loading} />

        {/* 2) RestaurantHeader */}
        <RestaurantHeader loading={loading} restaurantDetails={restaurantDetails} />

        {/* 3) BranchSelector */}
        <BranchSelector
          loading={loading}
          selectedBranch={selectedBranch}
          setIsBranchSheetOpen={setIsBranchSheetOpen}
        />

        {/* 4) Delivery/Pickup Toggle */}
        <DeliveryPickupToggle
          loading={loading}
          deliveryOption={deliveryOption}
          setDeliveryOption={setDeliveryOption}
        />

        {/* 5) Filter Menu */}
        <FilterMenu
          loading={loading}
          showFiltersMenu={showFiltersMenu}
          setShowFiltersMenu={setShowFiltersMenu}
          filterButtonLayout={filterButtonLayout}
          handleFilterButtonLayout={handleFilterButtonLayout}
          screenWidth={screenWidth}
          sortLowToHigh={sortLowToHigh}
          sortHighToLow={sortHighToLow}
        />

        {/* 6) Food Items List */}
        <FoodItemsList
          loading={loading}
          showFood={showFood}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          reorderedCategories={reorderedCategories}
          foodItems={foodItems}
          getItemQuantityInCart={getItemQuantityInCart}
          incrementCartItem={incrementCartItem}
          decrementCartItem={decrementCartItem}
          handleAddToCart={handleAddToCart}
        />
      </ScrollView>

      {/* 7) Cart Button */}
      <CartButton cart={cart} loading={loading} />

      {/* Bottom Sheets */}
      <AddToCartSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedItem={selectedItem}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        selectedAddOns={selectedAddOns}
        setSelectedAddOns={setSelectedAddOns}
        itemQuantity={itemQuantity}
        setItemQuantity={setItemQuantity}
        handleConfirmAddToCart={handleConfirmAddToCart}
        calculateTotal={calculateTotal}
        handleAddOnToggle={handleAddOnToggle}
        colors={colors}
      />

      <BranchSelectionSheet
        isOpen={isBranchSheetOpen}
        onOpenChange={setIsBranchSheetOpen}
        branches={branches}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        colors={colors}
      />
    </View>
  )
}
