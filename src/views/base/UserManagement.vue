<template>
  <div class="user-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchQuery">
        <el-form-item label="用户名">
          <el-input v-model="searchQuery.username" placeholder="输入用户名搜索"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredUserList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px" @close="resetForm">
      <el-form :model="userForm" ref="userFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="系统管理员" value="系统管理员"></el-option>
            <el-option label="仓库管理员" value="仓库管理员"></el-option>
            <el-option label="售后客服人员" value="售后客服人员"></el-option>
          </el-select>
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
import { getAllUsers, createUser, updateUser, deleteUser, type User } from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

// --- state a.k.a 响应式状态定义 ---
const userList = ref<User[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const userFormRef = ref(); // 表单引用

// 搜索查询
const searchQuery = reactive({
  username: ''
});

// 新增/编辑用户的表单数据
const userForm = reactive<Partial<User>>({
  id: undefined,
  username: '',
  password: '',
  role: '',
});

// --- computed properties a.k.a 计算属性 ---
const filteredUserList = computed(() => {
  if (!searchQuery.username) {
    return userList.value;
  }
  return userList.value.filter(user => 
    user.username.toLowerCase().includes(searchQuery.username.toLowerCase())
  );
});

// --- methods a.k.a 方法 ---

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    // 此处的 res 现在已经是 User[] 类型，不再是 AxiosResponse
    const res = await getAllUsers();
    // 所以这里的赋值是类型安全的，不会再报错
    userList.value = res; 
  } catch (error) {
    console.error("Failed to fetch users:", error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索功能已通过计算属性实现，此函数可留空或用于触发API搜索
  ElMessage.info('列表已根据输入内容筛选');
};

// 重置表单
const resetForm = () => {
  userForm.id = undefined;
  userForm.username = '';
  userForm.password = '';
  userForm.role = '';
  if (userFormRef.value) {
    userFormRef.value.clearValidate();
  }
};

// 处理新增按钮点击
const handleAdd = () => {
  resetForm();
  isEdit.value = false;
  dialogVisible.value = true;
};

// 处理编辑按钮点击
const handleEdit = (row: User) => {
  resetForm();
  isEdit.value = true;
  // 将行数据复制到表单中
  Object.assign(userForm, row);
  dialogVisible.value = true;
};

// 处理删除按钮点击
const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `您确定要删除用户 "${row.username}" 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUser(row.id!);
      ElMessage.success('删除成功！');
      fetchUsers(); // 重新加载列表
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 提交表单（新增或编辑）
const submitForm = async () => {
  if (isEdit.value) {
    // 编辑用户
    try {
      // 准备更新数据，不包括密码
      const { password, ...updateData } = userForm;
      await updateUser(userForm.id!, updateData);
      ElMessage.success('更新成功！');
    } catch (error) {
      console.error("Failed to update user:", error);
      return; // 出错时停止执行
    }
  } else {
    // 新增用户
    try {
      await createUser(userForm as User);
      ElMessage.success('新增成功！');
    } catch (error) {
      console.error("Failed to create user:", error);
      return; // 出错时停止执行
    }
  }
  dialogVisible.value = false;
  fetchUsers(); // 成功后重新加载列表
};

// --- lifecycle hooks a.k.a 生命周期钩子 ---
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.el-form-item.add-button {
  float: right; /* 让新增按钮靠右 */
}
</style>