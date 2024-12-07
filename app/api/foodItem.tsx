import apiClient from "./https";

const getFoodItems = async(id = String ,params ={})=>{
    try {
       const response = await apiClient().get(`/food-items/${id}`, {params: params})
       return response;
    } catch (error) {
        throw error;
    }
}

const getFoodItemBySearch = async(params={})=>{
    try {
        const response = await apiClient().get(`/food-item/search`, {params : params})
        return response;
    } catch (error) {
        throw error;
    }
}

export { getFoodItems, getFoodItemBySearch }