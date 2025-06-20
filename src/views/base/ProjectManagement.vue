<template>
  <div class="project-management-container">
    <el-card class="action-bar" shadow="never">
      <el-form :inline="true" :model="searchQuery">
        <el-form-item label="项目名称">
          <el-input v-model="searchQuery.projectName" placeholder="输入项目名称搜索" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </el-form-item>
        <el-form-item class="add-button">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增项目</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectName" label="项目名称" width="300" />
        <el-table-column prop="projectDescription" label="项目描述" />
        <el-table-column prop="createdAt" label="创建时间" width="200" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑项目' : '新增项目'" width="600px" @close="resetForm">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName"></el-input>
        </el-form-item>
        <el-form-item label="项目描述" prop="projectDescription">
          <el-input v-model="form.projectDescription" type="textarea" :rows="4"></el-input>
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
  getAllProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  type Project
} from '@/api/project';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';

// --- state ---
const list = ref<Project[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const searchQuery = reactive({
  projectName: ''
});

const form = reactive<Partial<Project>>({
  id: undefined,
  projectName: '',
  projectDescription: '',
});

// --- computed ---
const filteredList = computed(() => {
  if (!searchQuery.projectName) {
    return list.value;
  }
  return list.value.filter(item => 
    item.projectName.toLowerCase().includes(searchQuery.projectName.toLowerCase())
  );
});

// --- methods ---
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getAllProjects();
    list.value = data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    projectName: '',
    projectDescription: '',
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

const handleEdit = (row: Project) => {
  resetForm();
  isEdit.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Project) => {
  ElMessageBox.confirm(
    `您确定要删除项目 "${row.projectName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteProject(row.id!);
      ElMessage.success('删除成功！');
      fetchData();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateProject(form.id!, form);
      ElMessage.success('更新成功！');
    } else {
      await createProject(form as Project);
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
.project-management-container {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.el-form-item.add-button {
  float: right;
}
</style>