<template>
  <div class="warehousing-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>创建新入库单</span>
        </div>
      </template>

      <el-form :model="mainForm" label-width="120px" ref="mainFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库单据号" prop="recordNumber">
              <el-input v-model="mainForm.recordNumber" placeholder="例如：RK-YYYYMMDD-001"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库时间" prop="warehousingTime">
              <el-date-picker
                v-model="mainForm.warehousingTime"
                type="datetime"
                placeholder="选择入库时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品型号" prop="productId">
              <el-select v-model="mainForm.product.id" placeholder="选择商品型号" filterable style="width: 100%;">
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="`${item.brand} ${item.modelName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="mainForm.supplier.id" placeholder="选择供应商" filterable style="width: 100%;">
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.supplierName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进货单价" prop="actualPurchasePrice">
              <el-input-number v-model="mainForm.actualPurchasePrice" :precision="2" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item label="入库数量">
              <el-input :value="instanceList.length" disabled placeholder="由下方实例列表自动计算"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider />

      <h3>本次入库设备列表</h3>
      <el-table :data="instanceList" style="width: 100%" border>
        <el-table-column label="序列号 (SN)" prop="serialNumber">
          <template #default="scope">
            <el-input v-model="scope.row.serialNumber" placeholder="请输入设备序列号"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="售后编码" prop="afterSalesCode">
          <template #default="scope">
            <el-input v-model="scope.row.afterSalesCode" placeholder="请输入售后编码"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="仓库位置" prop="currentWarehouseLocation">
          <template #default="scope">
            <el-input v-model="scope.row.currentWarehouseLocation" placeholder="例如：A-01-01"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" :icon="Delete" @click="removeInstanceRow(scope.$index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="success" @click="addInstanceRow" style="margin-top: 10px;">
        <el-icon><Plus /></el-icon> 添加一台设备
      </el-button>

      <el-divider />

      <div style="text-align: right;">
        <el-button @click="resetAllForms">重置所有</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交入库单</el-button>
      </div>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { getAllProducts, type ProductResponse } from '@/api/product';
import { getAllSuppliers, type Supplier } from '@/api/supplier';
import { createWarehousingRecord, type WarehousingRecordRequest, type NewProductInstanceData, type WarehousingRecord } from '@/api/warehousing';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { format } from 'date-fns';

// --- state ---
const userStore = useUserStore();

const productList = ref<ProductResponse[]>([]);
const supplierList = ref<Supplier[]>([]);
const submitLoading = ref(false);
const mainFormRef = ref();

// 为 mainForm 定义一个明确的接口类型，以解决 TypeScript 类型不兼容的问题
interface MainFormType {
  recordNumber: string;
  warehousingTime: Date;
  product: { id: number | undefined };
  supplier: { id: number | undefined };
  actualPurchasePrice: number;
}

const mainForm = reactive<MainFormType>({
  recordNumber: '',
  warehousingTime: new Date(),
  product: { id: undefined },
  supplier: { id: undefined },
  actualPurchasePrice: 0,
});

const instanceList = ref<NewProductInstanceData[]>([]);

// --- methods ---
const loadInitialData = async () => {
  try {
    const [products, suppliers] = await Promise.all([getAllProducts(), getAllSuppliers()]);
    productList.value = products;
    supplierList.value = suppliers;
  } catch (error) {
    ElMessage.error("加载基础数据失败");
    console.error(error);
  }
};

const addInstanceRow = () => {
  instanceList.value.push({
    serialNumber: '',
    afterSalesCode: '',
    currentWarehouseLocation: '主仓库',
  });
};

const removeInstanceRow = (index: number) => {
  instanceList.value.splice(index, 1);
};

const resetAllForms = () => {
  Object.assign(mainForm, {
    recordNumber: '',
    warehousingTime: new Date(),
    product: { id: undefined },
    supplier: { id: undefined },
    actualPurchasePrice: 0,
  });
  instanceList.value = [];
  if (mainFormRef.value) {
    mainFormRef.value.clearValidate();
  }
};

const handleSubmit = async () => {
  if (!mainForm.product.id || !mainForm.supplier.id || !mainForm.recordNumber) {
    ElMessage.warning('请填写完整的入库单信息（单据号、型号、供应商）');
    return;
  }
  if (instanceList.value.length === 0) {
    ElMessage.warning('请至少添加一台入库设备');
    return;
  }
  if (instanceList.value.some(inst => !inst.serialNumber || !inst.afterSalesCode)) {
    ElMessage.warning('设备列表中的序列号和售后编码不能为空');
    return;
  }
  if (!userStore.id) {
    ElMessage.error('无法获取当前操作员ID，请重新登录');
    return;
  }

  submitLoading.value = true;

  // 构造符合 WarehousingRecord 类型的对象
  const recordPayload: WarehousingRecord = {
    recordNumber: mainForm.recordNumber,
    warehousingTime: format(new Date(mainForm.warehousingTime), "yyyy-MM-dd'T'HH:mm:ss"),
    product: { id: mainForm.product.id },
    supplier: { id: mainForm.supplier.id },
    operator: { id: userStore.id },
    quantity: instanceList.value.length,
    actualPurchasePrice: mainForm.actualPurchasePrice,
  };

  const requestPayload: WarehousingRecordRequest = {
    record: recordPayload,
    productInstancesData: instanceList.value,
  };

  try {
    await createWarehousingRecord(requestPayload);
    ElMessage.success('入库成功！');
    resetAllForms();
  } catch (error) {
    // Axios 拦截器已经处理了错误信息的提示
    console.error("入库失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// --- lifecycle ---
onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
.warehousing-container {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.el-divider {
  margin: 30px 0;
}
</style>