<template>
  <div class="layout-wrapper">
    <el-aside width="210px" class="sidebar">
      <div class="sidebar-logo">
        <el-icon><Camera /></el-icon>
        <span>相机售后管理系统</span>
      </div>
      <el-menu
        active-text-color="#409EFF"
        background-color="#304100"
        class="el-menu-vertical"
        :default-active="route.path"
        text-color="#bfcbd9"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>主控台</span>
        </el-menu-item>
        <el-sub-menu index="/base">
          <template #title>
            <el-icon><Folder /></el-icon>
            <span>基础数据管理</span>
          </template>
          <el-menu-item index="/base/users">用户管理</el-menu-item>
          <el-menu-item index="/base/customers">客户管理</el-menu-item>
          <el-menu-item index="/base/suppliers">供应商管理</el-menu-item>
          <el-menu-item index="/base/projects">项目管理</el-menu-item>
          <el-menu-item index="/base/categories">商品类别管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/business">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>核心业务模块</span>
          </template>
          <el-menu-item index="/business/products">商品型号管理</el-menu-item>
          <el-menu-item index="/business/instances">库存实例管理</el-menu-item>
          <el-menu-item index="/business/warehousing">入库管理</el-menu-item>
          <el-menu-item index="/business/delivery">出库管理</el-menu-item>
          <el-menu-item index="/business/returns">退货管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container class="content-wrapper">
      <el-header class="header">
        <div></div>
        <el-dropdown>
          <div class="avatar-wrapper">
            <el-avatar :icon="UserFilled" :size="30" />
            <span class="username">{{ userStore.username }}</span>
            <el-icon><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/profile" style="text-decoration: none;">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// ★★★ 修改一：在 vue-router 中导入 RouterLink ★★★
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { House, Folder, Goods, ArrowDown, Camera, UserFilled } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const handleLogout = () => {
  ElMessageBox.confirm('您确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout();
    router.push('/login');
    ElMessage({ type: 'success', message: '退出成功!' });
  }).catch(() => {});
};
</script>

<style scoped>
.layout-wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
}
.sidebar {
  background-color: #304156;
  transition: width 0.28s;
  overflow-x: hidden;
}
.content-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  position: relative;
  overflow-y: auto;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b2f3a;
}
.sidebar-logo .el-icon {
  margin-right: 12px;
  font-size: 22px;
}
.el-menu {
  border-right: none;
}
.el-menu-vertical .el-menu-item.is-active {
    background-color: #409EFF !important;
    color: #fff !important;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  position: relative;
  z-index: 1;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.avatar-wrapper .username {
  margin-left: 10px;
  margin-right: 5px;
}
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>