import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const service = axios.create({
    baseURL: 'http://localhost:8081/api', 
    timeout: 10000, 
});

service.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        if (userStore.token) {
            config.headers['Authorization'] = `Bearer ${userStore.token}`;
        }
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    response => {
        return response; // 直接返回原始响应
    },
    error => {
        console.error('Response Error:', error);
        let message = '网络错误，请稍后再试';
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        }

        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000,
        });

        return Promise.reject(error);
    }
);

export default service;