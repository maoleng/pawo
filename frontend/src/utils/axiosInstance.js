import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: 'https://pawo.skrt.cc/api/',
})
