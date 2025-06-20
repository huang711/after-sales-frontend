<template>
  <div class="instance-management-container">
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>库存实例查询</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchParams" @submit.prevent="handleSearch">
        <el-form-item label="关键字">
          <el-input 
            v-model="searchParams.keyword" 
            placeholder="序列号 / 售后编码" 
            clearable 
            style="width: 220px;"
          />
        </el-form-item>
        <el-form-item label="商品型号">
          <el-select 
            v-model="searchParams.productId" 
            placeholder="按型号筛选" 
            clearable 
            filterable
            style="width: 240px;"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="getProductName(product)"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-select 
            v-model="searchParams.status" 
            placeholder="按状态筛选" 
            clearable 
            style="width: 180px;"
          >
            <el-option label="未出库" value="未出库"></el-option>
            <el-option label="已出库" value="已出库"></el-option>
            <el-option label="已安装" value="已安装"></el-option>
            <el-option label="已退货" value="已退货"></el-option>
            <el-option label="维修中" value="维修中"></el-option>
            <el-option label="报废" value="报废"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="result-card">
      <el-table :data="instanceList" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="serialNumber" label="序列号" width="180" />
        <el-table-column prop="afterSalesCode" label="售后编码" width="180" />
        <el-table-column label="商品型号" width="220">
          <template #default="scope">
            {{ getProductNameById(scope.row.productId) }}
          </template>
        </el-table-column>
        <el-table-column prop="currentStatus" label="当前状态" width="120">
           <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.currentStatus)" effect="light">
              {{ scope.row.currentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentWarehouseLocation" label="仓库位置" />
        <el-table-column prop="remarks" label="备注信息" show-overflow-tooltip />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑实例信息" width="600px" @close="dialogVisible = false">
      <el-form :model="editForm" label-width="120px" v-if="editForm.id">
        <el-form-item label="序列号">
          <el-input :value="editForm.serialNumber" disabled />
        </el-form-item>
        <el-form-item label="售后编码">
          <el-input :value="editForm.afterSalesCode" disabled />
        </el-form-item>
        <el-form-item label="仓库位置">
          <el-input v-model="editForm.currentWarehouseLocation" />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="editForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpdate">保存更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { searchProductInstances, updateProductInstance, type ProductInstanceDetail, type InstanceSearchParams } from '@/api/productInstance';
import { getAllProducts, type ProductResponse } from '@/api/product';
import { ElMessage } from 'element-plus';
import { Search, Edit } from '@element-plus/icons-vue';

// --- state ---
const loading = ref(false);
const instanceList = ref<ProductInstanceDetail[]>([]);
const productList = ref<ProductResponse[]>([]);

const searchParams = reactive<InstanceSearchParams>({
  keyword: '',
  productId: undefined,
  status: '',
});

// ★★★ 这是控制编辑弹窗显示/隐藏的状态 ★★★
const dialogVisible = ref(false);
const editForm = reactive<Partial<ProductInstanceDetail>>({});

// --- methods ---
const fetchProductsForFilter = async () => {
  try {
    productList.value = await getAllProducts();
  } catch (error) {
    console.error("加载商品型号列表失败:", error);
    ElMessage.error("加载商品型号列表失败");
  }
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const data = await searchProductInstances(searchParams);
    instanceList.value = data;
    if (data.length === 0) {
      ElMessage.info("没有找到符合条件的库存实例");
    }
  } catch (error) {
    console.error("查询库存实例失败:", error);
  } finally {
    loading.value = false;
  }
};

// ★★★ 这是点击编辑按钮时触发的函数 ★★★
const handleEdit = (row: ProductInstanceDetail) => {
  // 1. 深拷贝行数据到表单对象
  Object.assign(editForm, structuredClone(row));
  // 2. 将弹窗状态设为 true，使其显示出来
  dialogVisible.value = true;
};

// ★★★ 这是在弹窗中点击“保存更新”时触发的函数 ★★★
const submitUpdate = async () => {
  if (!editForm.id) return;
  
  try {
    await updateProductInstance(editForm.id, editForm);
    ElMessage.success("更新成功！");
    dialogVisible.value = false; // 关闭弹窗
    handleSearch(); // 刷新表格数据
  } catch (error) {
    console.error("更新库存实例失败:", error);
  }
};

// --- 辅助函数 ---
const getStatusTagType = (status: string) => {
  switch (status) {
    case '未出库':
      return 'success';
    case '已出库':
      return 'primary';
    case '已安装':
      return 'warning';
    case '已退货':
    case '维修中':
      return 'danger';
    case '报废':
      return 'info';
    default:
      return 'info';
  }
};

const getProductName = (product: ProductResponse): string => {
    return `${product.brand} ${product.modelName}`;
}

const getProductNameById = (productId: number): string => {
  const product = productList.value.find(p => p.id === productId);
  if (product) {
    return getProductName(product);
  }
  return '未知型号';
};

// --- lifecycle ---
onMounted(() => {
  fetchProductsForFilter();
  handleSearch();
});
</script>

<style scoped>
.instance-management-container {
  padding: 20px;
}
.search-card, .result-card {
  margin-bottom: 20px;
}
</style>