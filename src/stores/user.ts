import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';
import type { LoginRequest, JwtAuthenticationResponse } from '@/api/types';
import { getUserByUsername, type User } from '@/api/user';

export const useUserStore = defineStore('user', () => {
    // ★★★ 1. 新增 id 状态，并从 localStorage 初始化 ★★★
    const id = ref<number | null>(JSON.parse(localStorage.getItem('userId') || 'null'));
    const token = ref<string | null>(localStorage.getItem('token'));
    const username = ref<string | null>(localStorage.getItem('username'));
    const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));

    // ★★★ 2. 修改 login 函数，增加获取和保存用户 ID 的逻辑 ★★★
    async function login(loginData: LoginRequest) {
        // 第一步：登录获取token和基本信息
        const response: JwtAuthenticationResponse = (await request.post('/auth/login', loginData)).data;
        
        if (response.accessToken) {
            token.value = response.accessToken;
            username.value = response.username;
            roles.value = response.roles;

            localStorage.setItem('token', token.value);
            localStorage.setItem('username', username.value);
            localStorage.setItem('roles', JSON.stringify(roles.value));
            
            // 第二步：根据用户名获取完整的用户信息（包含ID）
            const userDetails: User = await getUserByUsername(username.value!);
            if (userDetails && userDetails.id) {
                id.value = userDetails.id;
                localStorage.setItem('userId', String(id.value));
            }
        }
    }

    // ★★★ 3. 修改 logout 函数，增加清除用户 ID 的逻辑 ★★★
    function logout() {
        id.value = null;
        token.value = null;
        username.value = null;
        roles.value = [];

        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
    }

    // ★★★ 4. 在 return 中暴露 id ★★★
    return {
        id,
        token,
        username,
        roles,
        login,
        logout,
    };
});