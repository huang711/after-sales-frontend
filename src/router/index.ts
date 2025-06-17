import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/Layout.vue'; // 导入主布局
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: Layout, // 所有在此根路径下的页面都使用 Layout 布局
      redirect: '/dashboard', // 访问'/'时，自动重定向到'/dashboard'
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '主控台', requiresAuth: true }
        },
        // TODO: 在这里添加其他业务页面的路由
        // 例如:
        // {
        //   path: '/base/users',
        //   name: 'users',
        //   component: () => import('@/views/base/UserManagement.vue'),
        //   meta: { title: '用户管理', requiresAuth: true }
        // }
      ]
    }
  ]
});

// 全局前置路由守卫 (与之前相同，但为了完整性再次提供)
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.token;

  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (isLoggedIn) {
      next(); // 已登录，放行
    } else {
      // 未登录，重定向到登录页
      next({ name: 'login', query: { unauthorized: 'true' } });
    }
  } else {
    // 如果目标路由不需要认证
    if (isLoggedIn && to.name === 'login') {
      next({ name: 'dashboard' }); // 已登录状态下访问登录页，直接跳转到主控台
    } else {
      next(); // 正常放行
    }
  }
});

export default router;