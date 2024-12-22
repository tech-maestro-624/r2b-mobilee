import apiClient from "./https";

const getFile = async(id = String)=>{
    try {
        const response = await apiClient().get(`/download/${id}`)
        return response;
    } catch (error) {
        throw error;
    }
}

export {getFile}