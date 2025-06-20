<template>
  <div class="product-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchQuery">
        <el-form-item label="关键字">
          <el-input v-model="searchQuery.keyword" placeholder="输入品牌或型号名称搜索" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增商品型号</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="brand" label="品牌" width="150" />
        <el-table-column prop="modelName" label="型号名称" width="200" />
        
        <el-table-column prop="categoryName" label="类别" />
        <el-table-column prop="supplierName" label="供应商" />
        <el-table-column prop="standardPurchasePrice" label="标准进货价" />
        <el-table-column prop="standardSellingPrice" label="标准售价" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品型号' : '新增商品型号'" width="600px" @close="resetForm">
      <el-form :model="form" ref="formRef" label-width="120px">
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand"></el-input>
        </el-form-item>
        <el-form-item label="型号名称" prop="modelName">
          <el-input v-model="form.modelName"></el-input>
        </el-form-item>
        <el-form-item label="商品类别" prop="categoryId">
          <el-select v-model="form.category.id" placeholder="请选择类别" style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
           <el-select v-model="form.supplier.id" placeholder="请选择供应商" style="width: 100%">
            <el-option
              v-for="item in suppliers"
              :key="item.id"
              :label="item.supplierName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标准进货价" prop="standardPurchasePrice">
          <el-input-number v-model="form.standardPurchasePrice" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="标准售价" prop="standardSellingPrice">
          <el-input-number v-model="form.standardSellingPrice" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="标准质保期(天)" prop="standardWarrantyDays">
          <el-input-number v-model="form.standardWarrantyDays" :step="30" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// ★★★ 新增：导入 computed 和 reactive ★★★
import { ref, reactive, onMounted, computed } from 'vue';
import { getAllProducts, createProduct, updateProduct, deleteProduct, type Product, type ProductResponse } from '@/api/product';
import { getAllCategories, type ProductCategory } from '@/api/productCategory';
import { getAllSuppliers, type Supplier } from '@/api/supplier';
import { ElMessage, ElMessageBox } from 'element-plus';
// ★★★ 新增：导入 Search 图标 ★★★
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';

// --- state ---
const list = ref<ProductResponse[]>([]);
const categories = ref<ProductCategory[]>([]);
const suppliers = ref<Supplier[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

// ★★★ 新增：用于搜索的响应式对象 ★★★
const searchQuery = reactive({
  keyword: ''
});

const form = reactive<Product>({
  id: undefined,
  brand: '',
  modelName: '',
  category: { id: 0 },
  supplier: { id: 0 },
  standardPurchasePrice: 0,
  standardSellingPrice: 0,
  standardWarrantyDays: 365,
});

// ★★★ 新增：计算属性，用于根据搜索关键字过滤列表 ★★★
const filteredList = computed(() => {
  const keyword = searchQuery.keyword.toLowerCase().trim();
  if (!keyword) {
    return list.value;
  }
  return list.value.filter(item => {
    const brandMatch = item.brand.toLowerCase().includes(keyword);
    const modelMatch = item.modelName.toLowerCase().includes(keyword);
    return brandMatch || modelMatch;
  });
});

// --- methods ---
const fetchData = async () => {
  loading.value = true;
  try {
    const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
      getAllSuppliers()
    ]);
    list.value = productsRes;
    categories.value = categoriesRes;
    suppliers.value = suppliersRes;
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    brand: '',
    modelName: '',
    category: { id: undefined },
    supplier: { id: undefined },
    standardPurchasePrice: 0,
    standardSellingPrice: 0,
    standardWarrantyDays: 365,
  });
};

const handleAdd = () => {
  resetForm();
  isEdit.value = false;
  dialogVisible.value = true;
};

const handleEdit = (row: ProductResponse) => {
  resetForm();
  isEdit.value = true;
  Object.assign(form, {
    ...row,
    category: { id: row.categoryId },
    supplier: { id: row.supplierId }
  });
  dialogVisible.value = true;
};

const handleDelete = (row: ProductResponse) => {
  const productName = `${row.brand} ${row.modelName}`;
  ElMessageBox.confirm(`您确定要删除商品型号 "${productName}" 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProduct(row.id!);
      ElMessage.success('删除成功！');
      fetchData();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const submitForm = async () => {
  if (!form.category.id || !form.supplier.id) {
    ElMessage.error('请选择商品类别和供应商');
    return;
  }
  
  try {
    if (isEdit.value) {
      await updateProduct(form.id!, form);
      ElMessage.success('更新成功！');
    } else {
      await createProduct(form);
      ElMessage.success('新增成功！');
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error("Failed to submit form:", error);
  }
};

// --- lifecycle ---
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.product-management-container {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.add-button {
  float: right;
}
</style>