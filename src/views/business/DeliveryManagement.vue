<template>
  <div class="delivery-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>创建新出库单</span>
        </div>
      </template>

      <el-form :model="mainForm" label-width="120px" ref="mainFormRef">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出库单据号" prop="recordNumber">
              <el-input v-model="mainForm.recordNumber" placeholder="例如：CK-YYYYMMDD-001"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="mainForm.customer.id" placeholder="选择客户" filterable style="width: 100%;">
                <el-option v-for="item in customerList" :key="item.id" :label="item.customerName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
             <el-form-item label="项目 (可选)" prop="projectId">
              <el-select v-model="mainForm.project.id" placeholder="选择关联项目" filterable clearable style="width: 100%;">
                <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库时间" prop="deliveryTime">
              <el-date-picker v-model="mainForm.deliveryTime" type="datetime" placeholder="选择出库时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
           <el-col :span="8">
            <el-form-item label="销售总金额">
              <el-input :value="totalSalesAmount.toFixed(2)" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider />

      <div class="header-with-button">
        <h3>本次出库设备列表</h3>
        <el-button type="primary" :icon="Plus" @click="openInstanceSelector">从库存选择设备</el-button>
      </div>
      <el-table :data="selectedInstances" style="width: 100%" border>
        <el-table-column prop="serialNumber" label="序列号 (SN)" />
        <el-table-column prop="productName" label="商品型号" />
        <el-table-column label="实际销售单价" width="200">
          <template #default="scope">
            <el-input-number v-model="scope.row.actualUnitPrice" :precision="2" :step="100" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" :icon="Delete" circle @click="removeInstance(scope.$index)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider />

      <div style="text-align: right;">
        <el-button @click="resetAllForms">重置所有</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交出库单</el-button>
      </div>
    </el-card>

    <el-dialog v-model="selectorVisible" title="选择库存设备" width="60%">
      <el-form :inline="true" :model="selectorSearchParams" @submit.prevent="handleDialogSearch">
        <el-form-item label="关键字">
          <el-input v-model="selectorSearchParams.keyword" placeholder="序列号/售后编码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleDialogSearch">查询可用库存</el-button>
        </el-form-item>
      </el-form>
      <el-table 
        :data="availableInstances" 
        v-loading="selectorLoading"
        @selection-change="handleDialogSelectionChange"
        max-height="400px"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="serialNumber" label="序列号" />
        <el-table-column prop="afterSalesCode" label="售后编码" />
        <el-table-column prop="productName" label="商品型号" />
        <el-table-column prop="currentWarehouseLocation" label="仓库位置" />
      </el-table>
      <template #footer>
        <el-button @click="selectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确认选择</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { createDeliveryRecord, type DeliveryRecord, type DeliveryRecordRequest } from '@/api/delivery';
import { searchProductInstances, type ProductInstanceDetail, type InstanceSearchParams } from '@/api/productInstance';
import { getAllCustomers, type Customer } from '@/api/customer';
import { getAllProjects, type Project } from '@/api/project';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { format } from 'date-fns';

// --- state ---
const userStore = useUserStore();
const submitLoading = ref(false);
const mainFormRef = ref();

// 关联下拉列表数据
const customerList = ref<Customer[]>([]);
const projectList = ref<Project[]>([]);

// 已选择用于出库的实例列表
const selectedInstances = ref<Array<ProductInstanceDetail & { actualUnitPrice: number }>>([]);

// 弹窗选择器相关状态
const selectorVisible = ref(false);
const selectorLoading = ref(false);
const selectorSearchParams = reactive<InstanceSearchParams>({ status: '未出库' });
const availableInstances = ref<ProductInstanceDetail[]>([]);
const dialogMultiSelection = ref<ProductInstanceDetail[]>([]);


// ★★★ 核心修改：为 mainForm 定义一个明确的接口类型 ★★★
interface MainFormType {
  recordNumber: string;
  deliveryTime: Date;
  customer: { id: number | undefined };
  project: { id: number | undefined };
}

const mainForm = reactive<MainFormType>({
  recordNumber: '',
  deliveryTime: new Date(),
  customer: { id: undefined },
  project: { id: undefined },
});

// --- computed ---
const totalSalesAmount = computed(() => {
  return selectedInstances.value.reduce((total, item) => total + (item.actualUnitPrice || 0), 0);
});

// --- methods ---
const loadInitialData = async () => {
  try {
    const [customers, projects] = await Promise.all([getAllCustomers(), getAllProjects()]);
    customerList.value = customers;
    projectList.value = projects;
  } catch (error) {
    ElMessage.error("加载客户或项目列表失败");
  }
};

const openInstanceSelector = async () => {
  selectorVisible.value = true;
  await handleDialogSearch();
};

const handleDialogSearch = async () => {
  selectorLoading.value = true;
  try {
    const data = await searchProductInstances(selectorSearchParams);
    const selectedIds = new Set(selectedInstances.value.map(i => i.id));
    availableInstances.value = data.filter(i => !selectedIds.has(i.id));
  } finally {
    selectorLoading.value = false;
  }
};

const handleDialogSelectionChange = (selection: ProductInstanceDetail[]) => {
  dialogMultiSelection.value = selection;
};

const confirmSelection = () => {
  const newInstances = dialogMultiSelection.value.map(item => ({
    ...item,
    actualUnitPrice: 0, 
  }));
  selectedInstances.value.push(...newInstances);
  selectorVisible.value = false;
};

const removeInstance = (index: number) => {
  selectedInstances.value.splice(index, 1);
};

const resetAllForms = () => {
  Object.assign(mainForm, {
    recordNumber: '',
    deliveryTime: new Date(),
    customer: { id: undefined },
    project: { id: undefined },
  });
  selectedInstances.value = [];
  if (mainFormRef.value) mainFormRef.value.clearValidate();
};

const handleSubmit = async () => {
  if (!mainForm.customer.id || !mainForm.recordNumber) {
    ElMessage.warning('请填写出库单据号和客户');
    return;
  }
  if (selectedInstances.value.length === 0) {
    ElMessage.warning('请至少选择一台出库设备');
    return;
  }
  if (!userStore.id) {
    ElMessage.error('无法获取当前操作员ID，请重新登录');
    return;
  }

  submitLoading.value = true;

  const recordPayload: DeliveryRecord = {
    recordNumber: mainForm.recordNumber,
    deliveryTime: format(new Date(mainForm.deliveryTime), "yyyy-MM-dd'T'HH:mm:ss"),
    customer: { id: mainForm.customer.id },
    operator: { id: userStore.id },
    totalSalesAmount: totalSalesAmount.value,
    ...(mainForm.project.id && { project: { id: mainForm.project.id } }),
  };

  const payload: DeliveryRecordRequest = {
    record: recordPayload,
    instanceRequests: selectedInstances.value.map(inst => ({
      instanceId: inst.id,
      actualUnitPrice: inst.actualUnitPrice,
    })),
  };

  try {
    await createDeliveryRecord(payload);
    ElMessage.success('出库成功！');
    resetAllForms();
  } finally {
    submitLoading.value = false;
  }
};

// --- lifecycle ---
onMounted(loadInitialData);
</script>

<style scoped>
.delivery-container {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.el-divider {
  margin: 30px 0;
}
.header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
h3 {
  margin: 0;
}
</style>