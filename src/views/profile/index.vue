<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>关于我</span>
            </div>
          </template>
          <div class="user-info">
            <el-avatar :size="100" :icon="UserFilled" />
            <div class="user-bio">
              <div class="user-name">{{ userStore.username }}</div>
              <div class="user-role">{{ userStore.roles.join(' | ') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card shadow="never">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="个人资料" name="profile">
              <el-form :model="profileForm" label-width="80px">
                <el-form-item label="用户名">
                  <el-input v-model="profileForm.username" disabled />
                </el-form-item>
                <el-form-item label="角色">
                  <el-select v-model="profileForm.role" :disabled="!isAdmin">
                    <el-option label="系统管理员" value="系统管理员"></el-option>
                    <el-option label="仓库管理员" value="仓库管理员"></el-option>
                    <el-option label="售后客服人员" value="售后客服人员"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateProfile">保存资料</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密码" name="changePassword">
              <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword">更新密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="用户列表" name="userList" v-if="isAdmin">
              <el-table :data="allUsers" v-loading="loading" stripe border max-height="400px">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="role" label="角色" />
                <el-table-column prop="createdAt" label="创建时间" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { updateUser, updateUserPassword, getAllUsers, type User } from '@/api/user';
import { ElMessage, type FormInstance, type FormRules, type TabsPaneContext } from 'element-plus';
import { UserFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const activeTab = ref('profile');
const loading = ref(false);

// --- 个人资料表单 ---
const profileForm = reactive({
  username: userStore.username,
  role: userStore.roles.length > 0 ? userStore.roles[0] : '',
});

// --- 修改密码表单 ---
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

// --- 用户列表（管理员） ---
const allUsers = ref<User[]>([]);
const isAdmin = computed(() => userStore.roles.includes('系统管理员'));

// 表单校验规则
const validatePassConfirm = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};
const passwordRules = reactive<FormRules>({
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }, { validator: validatePassConfirm, trigger: 'blur' }],
});

// --- 方法 ---

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!userStore.id) {
    ElMessage.error('无法获取用户ID');
    return;
  }
  try {
    await updateUser(userStore.id, { role: profileForm.role });
    ElMessage.success('资料更新成功！请注意，如角色变更，需重新登录以更新权限。');
    // 可选：更新 Pinia store 中的角色信息
    // userStore.roles = [profileForm.role];
  } catch (error) {
    console.error("Failed to update profile:", error);
  }
};

// 更新密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!userStore.id) {
        ElMessage.error('无法获取用户ID，请重新登录');
        return;
      }
      try {
        await updateUserPassword(userStore.id, passwordForm.newPassword);
        ElMessage.success('密码修改成功，请重新登录！');
        userStore.logout();
        router.push('/login');
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    }
  });
};

// 获取所有用户列表（仅当点击对应tab时）
const handleTabClick = async (tab: TabsPaneContext) => {
  if (tab.paneName === 'userList' && allUsers.value.length === 0) {
    loading.value = true;
    try {
      allUsers.value = await getAllUsers();
    } catch (error) {
      ElMessage.error('获取用户列表失败');
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}
.user-info {
  text-align: center;
}
.user-bio {
  margin-top: 20px;
}
.user-name {
  font-weight: bold;
  font-size: 24px;
}
.user-role {
  margin-top: 10px;
  color: #909399;
}
</style>