import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user'; // 稍后我们会创建这个文件

// 创建 Axios 实例
const service = axios.create({
    // 你的后端 API 地址
    baseURL: 'http://localhost:8081/api', //  (参考后端端口)
    timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        // 如果存在 token，则在请求头中添加 Authorization
        if (userStore.token) {
            config.headers['Authorization'] = `Bearer ${userStore.token}`; // 
        }
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 后端返回的数据通常在 response.data 中
        const res = response.data;
        // 这里我们假设所有成功的请求都直接返回后端给的数据体
        return res;
    },
    error => {
        console.error('Response Error:', error);
        // 从后端 GlobalExceptionHandler.java  可知，错误信息在 error.response.data.message 中
        let message = '网络错误，请稍后再试';
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message; // 
        }

        // 使用 Element Plus 的 ElMessage 组件显示错误信息
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000,
        });

        return Promise.reject(error);
    }
);

export default service;