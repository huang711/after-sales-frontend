<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>售后库存管理系统 - 登录</span>
        </div>
      </template>

      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="输入 admin 或 warehouse" 
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="输入 123456" 
            show-password 
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            class="login-button"
            :loading="loading"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import type { LoginRequest } from '@/api/types';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);

const loginForm = reactive<LoginRequest>({
  username: 'admin',
  password: '123456'
});

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }
  loading.value = true;
  try {
    await userStore.login(loginForm);
    ElMessage.success('登录成功！');
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.unauthorized === 'true') {
    ElMessage.warning('请先登录！');
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 450px;
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.login-button {
  width: 100%;
}
</style>