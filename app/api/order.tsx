import apiClient from "./https";

const createOrder = async(data={})=>{
    try {
        const response = await apiClient().post('/order/create', data)
        return response;
    } catch (error) {
        throw error;
    }
}

const getOrder = async(params={}) =>{
    try {
        const response = await apiClient().get('/order', {params : params})
        return response;
    } catch (error) {
        throw error;
    }
}

const getCustomerOrder = async(id=String)=>{
    console.log('id :', id);
    
    try {
        const response = await apiClient().get(`/customer-orders/${id}`)
        return response;
    } catch (error) {
        throw error;
    }
}

const verifyPayment = async(data={}) => {
    try {
        const response = await apiClient().post('/payment/verify',data)
        return response
    } catch (error) {
        throw error
    }
}
export { createOrder, verifyPayment, getOrder, getCustomerOrder}