import apiClient from "./https";


const sendOtp = async (data: {}) => {
    try {
      const response = await apiClient().post('/login', data);
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  const verifyOtp = async (data: {}) => {
    try {
      const response = await apiClient().post('/verify-login', data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  export {sendOtp, verifyOtp}