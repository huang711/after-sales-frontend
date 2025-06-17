import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --- 新增代码开始 ---
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// --- 新增代码结束 ---

import App from './App.vue'
import router from './router'

const app = createApp(App)

// --- 新增代码开始 ---
// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
// --- 新增代码结束 ---

app.use(createPinia())
app.use(router)

app.mount('#app')