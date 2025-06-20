<template>
  <div class="customer-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchQuery">
        <el-form-item label="客户名称">
          <el-input v-model="searchQuery.customerName" placeholder="输入客户名称搜索" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增客户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="customerName" label="客户名称" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="600px" @close="resetForm">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName"></el-input>
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
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer
} from '@/api/customer';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';

// --- state ---
const list = ref<Customer[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const searchQuery = reactive({
  customerName: ''
});

const form = reactive<Partial<Customer>>({
  id: undefined,
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
});

// --- computed ---
const filteredList = computed(() => {
  if (!searchQuery.customerName) {
    return list.value;
  }
  return list.value.filter(item =>
    item.customerName.toLowerCase().includes(searchQuery.customerName.toLowerCase())
  );
});

// --- methods ---
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getAllCustomers();
    // 修正：如果 getAllCustomers 直接返回 Customer[]，则直接赋值
    list.value = res;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    ElMessage.error('获取客户列表失败！'); // 添加用户提示
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // 前端搜索由 computed 属性 filteredList 自动处理
  // 如果需要后端搜索，这里会调用 fetchData 并传递 searchQuery
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    customerName: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
  });
  if (formRef.value) {
    formRef.value.clearValidate(); // 清除表单验证状态
  }
};

const handleAdd = () => {
  resetForm();
  isEdit.value = false;
  dialogVisible.value = true;
};

const handleEdit = (row: Customer) => {
  resetForm();
  isEdit.value = true;
  // 使用 Object.assign 深度拷贝 row 的属性到 form
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(
    `您确定要删除客户 "${row.customerName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteCustomer(row.id!);
      ElMessage.success('删除成功！');
      fetchData(); // 重新获取数据以更新列表
    } catch (error) {
      console.error("Failed to delete customer:", error);
      ElMessage.error('删除失败！请稍后再试。'); // 添加用户提示
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const submitForm = async () => {
  try {
    // 您可以在这里添加表单验证，例如：
    // await formRef.value.validate();

    if (isEdit.value) {
      // 确保 form 作为一个完整的 Customer 类型传递给 updateCustomer
      await updateCustomer(form.id!, form as Customer);
      ElMessage.success('客户信息更新成功！');
    } else {
      // 确保 form 作为一个完整的 Customer 类型传递给 createCustomer
      await createCustomer(form as Customer);
      ElMessage.success('新客户添加成功！');
    }
    dialogVisible.value = false; // 关闭弹窗
    fetchData(); // 重新获取数据以更新列表
  } catch (error) {
    console.error("Failed to submit form:", error);
    ElMessage.error('操作失败！请检查输入或稍后再试。'); // 添加用户提示
  }
};

// --- lifecycle ---
onMounted(() => {
  fetchData(); // 组件挂载时获取客户数据
});
</script>

<style scoped>
.customer-management-container {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.el-form-item.add-button {
  float: right;
}
.table-card {
  /* 确保表格卡片与操作栏有间距，如果需要 */
  margin-bottom: 20px;
}
</style>