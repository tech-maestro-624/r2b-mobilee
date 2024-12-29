import apiClient from "./https";

const updateUser = async(id=String, data={})=>{
    try {
        const response = await apiClient().put(`/user/${id}`, data)
        return response;
    } catch (error) {
        throw error;
    }
}

const getUserData = async()=>{
    try {
        const response = await getUserData()
        return response;
    } catch (error) {
        throw error;
    }
}


export {updateUser, getUserData}