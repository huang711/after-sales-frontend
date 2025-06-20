<template>
  <div class="simple-login-container">
    <div class="login-box">
      <h1>重写登录功能测试</h1>
      <p>此页面旨在以最直接的方式测试登录和跳转</p>
      
      <div class="input-group">
        <label for="username">用户名:</label>
        <input id="username" v-model="loginForm.username" placeholder="admin" />
      </div>

      <div class="input-group">
        <label for="password">密码:</label>
        <input id="password" v-model="loginForm.password" type="password" placeholder="123456" />
      </div>
      
      <button @click="handleLogin" :disabled="loading" class="login-button">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div v-if="message" class="message" :class="{ 'is-error': isError }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // 直接使用原始的 axios

const router = useRouter();

const loginForm = reactive({
  username: 'admin',
  password: '123456',
});

const loading = ref(false);
const message = ref('');
const isError = ref(false);

const handleLogin = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;

  console.log('开始登录，请求数据:', loginForm);

  try {
    // 直接调用 axios，不经过任何封装，目标后端地址要写全
    const response = await axios.post(
      'http://localhost:8081/api/auth/login', 
      {
        username: loginForm.username,
        password: loginForm.password
      }
    );

    console.log('API 请求成功，后端返回:', response);

    // 检查返回的数据和 token
    if (response.data && response.data.accessToken) {
      const token = response.data.accessToken;
      console.log('成功获取 Token:', token);

      // 手动将 token 存入 localStorage
      localStorage.setItem('token', token);
      console.log('Token 已存入 localStorage');

      message.value = '登录成功，即将跳转...';
      isError.value = false;

      // 延迟一秒跳转，确保我们能看到成功信息
      setTimeout(() => {
        console.log('执行 router.push("/")');
        router.push('/');
      }, 1000);

    } else {
      throw new Error('后端返回的数据格式不正确，缺少 accessToken');
    }

  } catch (error: any) {
    console.error('登录过程中发生错误:', error);
    isError.value = true;
    if (error.response) {
      // 捕获后端返回的错误信息
      message.value = `登录失败: ${error.response.data.message || '服务器错误'}`;
    } else {
      // 捕获网络层面的错误
      message.value = `登录失败: ${error.message}`;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.simple-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: sans-serif;
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 350px;
}
.input-group {
  margin-bottom: 20px;
  text-align: left;
}
.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}
.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}
.login-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}
.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: #e8f5e9;
  color: #2e7d32;
}
.message.is-error {
  background-color: #fdecea;
  color: #d32f2f;
}
</style>