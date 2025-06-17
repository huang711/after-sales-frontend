import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';
import type { LoginRequest } from '@/api/types'; // 稍后创建
import type { JwtAuthenticationResponse } from '@/api/types'; // 稍后创建

// 定义 User Store
export const useUserStore = defineStore('user', () => {
    // State: 使用 ref 定义响应式状态
    const token = ref<string | null>(localStorage.getItem('token'));
    const username = ref<string | null>(localStorage.getItem('username'));
    const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));

    // Action: 登录方法
    async function login(loginData: LoginRequest) {
        // 调用后端的 /api/auth/login 接口 
        const response: JwtAuthenticationResponse = await request.post('/auth/login', loginData);

        // 登录成功，更新 state 并存入 localStorage
        if (response.accessToken) { // 
            token.value = response.accessToken;
            username.value = response.username; // 
            roles.value = response.roles; // 

            localStorage.setItem('token', token.value);
            localStorage.setItem('username', username.value);
            localStorage.setItem('roles', JSON.stringify(roles.value));
        }
    }

    // Action: 登出方法
    function logout() {
        token.value = null;
        username.value = null;
        roles.value = [];

        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
    }

    // 暴露 state 和 actions
    return {
        token,
        username,
        roles,
        login,
        logout,
    };
});