<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">系统用户</div>
            <span class="card-panel-num">{{ userCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-camera">
             <el-icon><CameraFilled /></el-icon>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">相机型号</div>
            <span class="card-panel-num">{{ productModelCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-inventory">
            <el-icon><Box /></el-icon>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">在库实例</div>
            <span class="card-panel-num">{{ inStockInstanceCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-records">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日出库</div>
            <span class="card-panel-num">{{ deliveryTodayCount }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="box-card shortcuts-card">
      <template #header>
        <div class="card-header">
          <span>核心业务操作</span>
        </div>
      </template>
      <div class="shortcut-group">
        <router-link to="/warehousing/create" class="shortcut-item">
          <div class="shortcut-icon-wrapper icon-inbound"><el-icon><CirclePlus /></el-icon></div>
          <span>创建入库单</span>
        </router-link>
        <router-link to="/delivery/create" class="shortcut-item">
          <div class="shortcut-icon-wrapper icon-outbound"><el-icon><Remove /></el-icon></div>
          <span>创建出库单</span>
        </router-link>
        <router-link to="/return/apply" class="shortcut-item">
          <div class="shortcut-icon-wrapper icon-return"><el-icon><RefreshLeft /></el-icon></div>
          <span>发起退货</span>
        </router-link>
         <router-link to="/products/instances" class="shortcut-item">
          <div class="shortcut-icon-wrapper icon-search"><el-icon><Search /></el-icon></div>
          <span>查询库存实例</span>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { User, CameraFilled, Box, Tickets, CirclePlus, Remove, RefreshLeft, Search } from '@element-plus/icons-vue';

const userCount = ref(0);
const productModelCount = ref(0);
const inStockInstanceCount = ref(0);
const deliveryTodayCount = ref(0);

onMounted(() => {
  fetchDashboardData();
});

const fetchDashboardData = () => {
  setTimeout(() => {
    userCount.value = 3;
    productModelCount.value = 2; 
    inStockInstanceCount.value = 8;
    deliveryTodayCount.value = 2;
  }, 300);
};
</script>

<style scoped>
/* 顶部数据统计卡片样式 */
.panel-group {
  margin-bottom: 20px;
}
.card-panel-col {
  margin-bottom: 20px;
}
.card-panel {
  height: 108px;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  overflow: hidden;
  color: #666;
  background: #fff;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
  border-color: rgba(0, 0, 0, .05);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  transition: all 0.3s ease-in-out;
}
.card-panel:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}
.card-panel-icon-wrapper {
  padding: 16px;
  transition: all 0.3s ease-out;
  border-radius: 6px;
  color: #fff;
}
.icon-people { background: #40c9c6; }
.icon-camera { background: #36a3f7; }
.icon-inventory { background: #f4516c; }
.icon-records { background: #34bfa3; }
.card-panel .el-icon {
  font-size: 48px;
}
.card-panel-description {
  flex-grow: 1;
  margin-left: 15px;
  text-align: center;
}
.card-panel-text {
  line-height: 18px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  margin-bottom: 12px;
}
.card-panel-num {
  font-size: 20px;
  font-weight: bold;
}

/* 快捷入口卡片样式 */
.shortcuts-card {
    border-radius: 4px;
}
.shortcut-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}
.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  border-radius: 4px;
  text-decoration: none;
  color: #303133;
  transition: all 0.3s;
}
.shortcut-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}
.shortcut-icon-wrapper {
  font-size: 36px;
  padding: 15px;
  border-radius: 50%;
  margin-bottom: 15px;
  color: #fff;
}
.shortcut-item span {
    font-size: 14px;
    font-weight: 500;
}
/* 定义快捷入口图标颜色 */
.icon-inbound { background-color: #36a3f7; }
.icon-outbound { background-color: #f4516c; }
.icon-return { background-color: #f6b26b; }
.icon-search { background-color: #40c9c6; }
</style>