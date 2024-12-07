import apiClient from "./https";

const createOrder = async(data={})=>{
    try {
        const response = await apiClient().post('/order/create', data)
        return response;
    } catch (error) {
        throw error;
    }
}

export { createOrder }