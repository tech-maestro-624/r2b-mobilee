import apiClient from "./https";

const getBranches = async(params)=>{
    try {
        const response = await apiClient().get('/branches', {params})
        return response;
    } catch (error) {
        throw error;
    }
}

export { getBranches }