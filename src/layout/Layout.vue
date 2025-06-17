<template>
  <div class="layout-wrapper">
    <el-aside width="210px" class="sidebar">
      <div class="sidebar-logo">
        <el-icon><Camera /></el-icon>
        <span>相机售后管理系统</span>
      </div>
      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
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
              <el-dropdown-item>个人中心</el-dropdown-item>
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
import { useRoute, useRouter } from 'vue-router';
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
/* ★★★ 核心修改：将布局控制应用到新的 div.layout-wrapper 上 ★★★ */
.layout-wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
}

/* 侧边栏和内容区的样式保持不变，它们现在是 .layout-wrapper 的子元素 */
.sidebar {
  /* el-aside 自带 width，我们只需控制背景等 */
  background-color: #304156;
  transition: width 0.28s;
  overflow-x: hidden;
}

.content-wrapper {
  /* el-container 作为 flex 子项，让它智能地占据剩余空间 */
  flex: 1;
  min-width: 0;
  /* 由于 el-container 默认的 flex-direction 是根据子元素决定的，
    为了保险起见，我们明确指定它内部是垂直排列（顶部Header + 下方Main）
  */
  display: flex;
  flex-direction: column;
}


/* --- 以下是其他的美化样式，保持不变 --- */
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
.main-content {
  /* 因为 content-wrapper 已经是 flex 布局了，
     这里需要让 main-content 自动撑满剩余的垂直空间 */
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  position: relative;
  overflow-y: auto;
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