import apiClient from "./https";

const getCategory = async(params)=> {
    try {
        const response = await apiClient().get('/categories', {params : params})
        return response;
    } catch (error) {
        throw error;
    }
}

export {getCategory}