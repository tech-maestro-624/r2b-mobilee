import apiClient from "./https";

const getCoupons = async(params)=>{
    try {
        const response = await apiClient().get('/coupon', {params: params})
        return response;
    } catch (error) {
        throw error;
    }
}

export {getCoupons}