import apiClient from "./https";

const getRestaurant = async(params ={})=>{
    try {
        const response = await apiClient().get('/restaurants', {params : params})
        return response;
    } catch (error) {
        throw error;
    }
}

const getRestaurantById = async(id)=>{
    try {
        const response = await apiClient().get(`/restaurant/${id}`)
        return response;
    } catch (error) {
        throw error;
    }
}

const getRestaurantByCategory = async(id = String)=>{
    try {
        const response = await apiClient().get(`/restaurant-by-category/${id}`)
        return response;
    } catch (error) {
        throw error;
    }
}

export {getRestaurant, getRestaurantById, getRestaurantByCategory}