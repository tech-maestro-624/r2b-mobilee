import axios, { AxiosInstance } from 'axios';
// import global from '../../app/Utils/global';
import global from 'app/Utils/global';

export default function apiClient(): AxiosInstance {
  return axios.create({
    baseURL: global.baseURL,
    withCredentials: true,
  });
}