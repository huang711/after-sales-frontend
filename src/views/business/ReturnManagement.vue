<template>
  <div class="return-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="退货状态">
          <el-select v-model="searchParams.returnStatus" placeholder="按状态筛选" clearable>
            <el-option label="待确认" value="待确认"></el-option>
            <el-option label="已退货" value="已退货"></el-option>
            <el-option label="已拒绝" value="已拒绝"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="success" :icon="Plus" @click="openApplyDialog">申请退货</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="id" label="退货ID" width="80" />
        <el-table-column prop="returnType" label="退货类型" />
        <el-table-column prop="returnStatus" label="退货状态" />
        <el-table-column prop="returnAmount" label="退货金额" />
        <el-table-column prop="returnReason" label="退货原因" />
        <el-table-column prop="customerServiceStaffUsername" label="申请人" />
        <el-table-column prop="originalDeliveryRecordId" label="原出库单ID" />
      </el-table>
    </el-card>

    <el-dialog v-model="applyDialog.visible" title="申请新品退货" width="70%" @close="resetApplyDialog">
      <div v-if="applyDialog.step === 1">
        <el-form :inline="true" @submit.prevent="findDeliveryRecord">
          <el-form-item label="请输入原始出库单ID">
            <el-input-number v-model="applyDialog.deliveryRecordIdToFind" :controls="false" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="findDeliveryRecord" :loading="applyDialog.loading">查找出库单</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="applyDialog.step === 2 && applyDialog.foundDeliveryRecord">
        <el-descriptions title="出库单信息" border :column="2">
          <el-descriptions-item label="出库单号">{{ applyDialog.foundDeliveryRecord.recordNumber }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ applyDialog.foundDeliveryRecord.customerName }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px;">请勾选本次要退货的设备：</h4>
        <el-table 
          :data="applyDialog.foundDeliveryRecord.deliveredInstances"
          @selection-change="handleReturnInstanceSelection"
          border
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="serialNumber" label="序列号" />
          <el-table-column prop="afterSalesCode" label="售后编码" />
        </el-table>

        <el-form :model="applyDialog.form" label-width="100px" style="margin-top: 20px;">
          <el-form-item label="退货类型" prop="returnType">
            <el-select v-model="applyDialog.form.returnType" placeholder="请选择退货类型">
              <el-option label="维修更换" value="维修更换"></el-option>
              <el-option label="出库错误" value="出库错误"></el-option>
              <el-option label="质保期退换" value="质保期退换"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="退货金额" prop="returnAmount">
            <el-input-number v-model="applyDialog.form.returnAmount" :precision="2" />
          </el-form-item>
          <el-form-item label="退货原因" prop="returnReason">
            <el-input v-model="applyDialog.form.returnReason" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="applyDialog.visible = false">取消</el-button>
        <el-button 
          v-if="applyDialog.step === 2" 
          type="primary" 
          @click="submitApplication"
          :loading="applyDialog.loading"
        >
          提交退货申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
// ★★★ 核心修改：确保导入了 ReturnRecordResponse 类型 ★★★
import { searchReturnRecords, applyReturn, type ReturnApplyRequest, type ReturnRecordResponse } from '@/api/return';
import { getDeliveryRecordDetail, type DeliveryRecordDetail } from '@/api/delivery';
import { ElMessage } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';

// --- state for main page ---
const userStore = useUserStore();
const loading = ref(true);
// ★★★ 核心修改：为 ref 提供明确的泛型类型 ★★★
const list = ref<ReturnRecordResponse[]>([]);
const searchParams = reactive({
  returnStatus: ''
});

// --- state for apply dialog ---
const applyDialog = reactive({
  visible: false,
  loading: false,
  step: 1,
  deliveryRecordIdToFind: undefined as number | undefined,
  foundDeliveryRecord: null as DeliveryRecordDetail | null,
  form: {
    returnType: '',
    returnAmount: 0,
    returnReason: '',
  },
  selectedInstances: [] as Array<{ instanceId: number }>,
});

// --- methods ---
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await searchReturnRecords(searchParams);
    list.value = data;
  } catch (error) {
    console.error("Failed to fetch return records:", error);
  } finally {
    loading.value = false;
  }
};

const resetApplyDialog = () => {
  applyDialog.visible = false;
  applyDialog.loading = false;
  applyDialog.step = 1;
  applyDialog.deliveryRecordIdToFind = undefined;
  applyDialog.foundDeliveryRecord = null;
  applyDialog.form.returnType = '';
  applyDialog.form.returnAmount = 0;
  applyDialog.form.returnReason = '';
  applyDialog.selectedInstances = [];
};

const openApplyDialog = () => {
  resetApplyDialog();
  applyDialog.visible = true;
};

const findDeliveryRecord = async () => {
  if (!applyDialog.deliveryRecordIdToFind) {
    ElMessage.warning('请输入要查找的出库单ID');
    return;
  }
  applyDialog.loading = true;
  try {
    const data = await getDeliveryRecordDetail(applyDialog.deliveryRecordIdToFind);
    applyDialog.foundDeliveryRecord = data;
    applyDialog.step = 2;
  } catch (error) {
    console.error("Failed to find delivery record:", error);
  } finally {
    applyDialog.loading = false;
  }
};

const handleReturnInstanceSelection = (selection: Array<{ instanceId: number }>) => {
  applyDialog.selectedInstances = selection;
};

const submitApplication = async () => {
  if (!userStore.id) {
    ElMessage.error('无法获取当前操作员ID，请重新登录');
    return;
  }
  if (applyDialog.selectedInstances.length === 0) {
    ElMessage.warning('请至少勾选一台要退货的设备');
    return;
  }
  if (!applyDialog.form.returnType || !applyDialog.form.returnReason) {
    ElMessage.warning('请填写退货类型和原因');
    return;
  }

  applyDialog.loading = true;

  const payload: ReturnApplyRequest = {
    record: {
      returnType: applyDialog.form.returnType,
      returnAmount: applyDialog.form.returnAmount,
      returnReason: applyDialog.form.returnReason,
      originalDeliveryRecord: { id: applyDialog.foundDeliveryRecord!.id },
      customerServiceStaff: { id: userStore.id },
    },
    productInstanceIds: applyDialog.selectedInstances.map(i => i.instanceId),
  };

  try {
    await applyReturn(payload);
    ElMessage.success('退货申请提交成功！');
    resetApplyDialog();
    fetchData(); 
  } catch(error) {
    console.error("Failed to submit return application:", error);
  } finally {
    applyDialog.loading = false;
  }
};

// --- lifecycle ---
onMounted(fetchData);
</script>

<style scoped>
.return-management-container {
  padding: 20px;
}
.action-bar, .table-card {
  margin-bottom: 20px;
}
.add-button {
  float: right;
}
.header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
h3 { margin: 0; }
</style>