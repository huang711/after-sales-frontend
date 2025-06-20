import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/Layout.vue';

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
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '主控台', requiresAuth: true }
        },
        // --- 基础数据管理 ---
        {
          path: 'base/users',
          name: 'UserManagement',
          component: () => import('@/views/base/UserManagement.vue'),
          meta: { title: '用户管理', requiresAuth: true }
        },
        {
          path: 'base/customers',
          name: 'CustomerManagement',
          component: () => import('@/views/base/CustomerManagement.vue'),
          meta: { title: '客户管理', requiresAuth: true }
        },
        {
          path: 'base/suppliers',
          name: 'SupplierManagement',
          component: () => import('@/views/base/SupplierManagement.vue'),
          meta: { title: '供应商管理', requiresAuth: true }
        },
        {
          path: 'base/projects',
          name: 'ProjectManagement',
          component: () => import('@/views/base/ProjectManagement.vue'),
          meta: { title: '项目管理', requiresAuth: true }
        },
        {
          path: 'base/categories',
          name: 'ProductCategoryManagement',
          component: () => import('@/views/base/ProductCategoryManagement.vue'),
          meta: { title: '商品类别管理', requiresAuth: true }
        },
        // --- 核心业务模块 ---
        {
          path: 'business/products',
          name: 'ProductManagement',
          component: () => import('@/views/business/ProductManagement.vue'),
          meta: { title: '商品型号管理', requiresAuth: true }
        },
        {
          path: 'business/instances',
          name: 'ProductInstanceManagement',
          component: () => import('@/views/business/ProductInstanceManagement.vue'),
          meta: { title: '库存实例管理', requiresAuth: true }
        },
        // ★★★ 在这里补全剩下的核心业务模块路由 ★★★
        {
          path: 'business/warehousing',
          name: 'WarehousingManagement',
          component: () => import('@/views/business/WarehousingManagement.vue'),
          meta: { title: '入库管理', requiresAuth: true }
        },
        {
          path: 'business/delivery',
          name: 'DeliveryManagement',
          component: () => import('@/views/business/DeliveryManagement.vue'),
          meta: { title: '出库管理', requiresAuth: true }
        },
        {
          path: 'business/returns',
          name: 'ReturnManagement',
          component: () => import('@/views/business/ReturnManagement.vue'),
          meta: { title: '退货管理', requiresAuth: true }
          
        },
        // ... 其他 children 路由 ...
{
  path: 'business/returns', // 这是你之前已有的最后一条路由
  name: 'ReturnManagement',
  component: () => import('@/views/business/ReturnManagement.vue'),
  meta: { title: '退货管理', requiresAuth: true }
},
// ★★★ 在这里添加新的路由规则 ★★★
{
  path: '/profile', 
  name: 'Profile',
  component: () => import('@/views/profile/index.vue'),
  meta: { title: '个人中心', requiresAuth: true }
}
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      next();
    } else {
      next({ name: 'login', query: { unauthorized: 'true' } });
    }
  } else {
    if (isLoggedIn && to.name === 'login') {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  }
});

export default router;