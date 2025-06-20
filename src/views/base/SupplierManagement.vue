<template>
  <div class="supplier-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchQuery">
        <el-form-item label="供应商名称">
          <el-input v-model="searchQuery.supplierName" placeholder="输入供应商名称搜索" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增供应商</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="supplierName" label="供应商名称" />
        <el-table-column prop="contactPerson" label="联系人" />
        <el-table-column prop="contactPhone" label="联系电话" />
        <el-table-column prop="address" label="地址" width="300" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑供应商' : '新增供应商'" width="600px" @close="resetForm">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="form.supplierName"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea"></el-input>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { 
  getAllSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier, 
  type Supplier 
} from '@/api/supplier';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';

// --- state ---
const list = ref<Supplier[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const searchQuery = reactive({
  supplierName: ''
});

const form = reactive<Partial<Supplier>>({
  id: undefined,
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
});

// --- computed ---
const filteredList = computed(() => {
  if (!searchQuery.supplierName) {
    return list.value;
  }
  return list.value.filter(item => 
    item.supplierName.toLowerCase().includes(searchQuery.supplierName.toLowerCase())
  );
});

// --- methods ---
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getAllSuppliers();
    list.value = data;
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // Frontend search is handled by computed property
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    supplierName: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
  });
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const handleAdd = () => {
  resetForm();
  isEdit.value = false;
  dialogVisible.value = true;
};

const handleEdit = (row: Supplier) => {
  resetForm();
  isEdit.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Supplier) => {
  ElMessageBox.confirm(
    `您确定要删除供应商 "${row.supplierName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteSupplier(row.id!);
      ElMessage.success('删除成功！');
      fetchData();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateSupplier(form.id!, form);
      ElMessage.success('更新成功！');
    } else {
      await createSupplier(form as Supplier);
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
.supplier-management-container {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.el-form-item.add-button {
  float: right;
}
</style>