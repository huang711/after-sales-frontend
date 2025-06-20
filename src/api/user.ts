import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// User 接口定义
export interface User {
  id?: number;
  username: string;
  password?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

// 获取所有用户列表
export const getAllUsers = async (): Promise<User[]> => {
  const response: AxiosResponse<User[]> = await request({
    url: '/users',
    method: 'get',
  });
  return response.data;
};

// 创建新用户
export const createUser = async (data: User): Promise<User> => {
  const response: AxiosResponse<User> = await request({
    url: '/users',
    method: 'post',
    data,
  });
  return response.data;
};

// 更新用户信息
export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response: AxiosResponse<User> = await request({
    url: `/users/${id}`,
    method: 'put',
    data,
  });
  return response.data;
};

// 删除用户
export const deleteUser = async (id: number): Promise<void> => {
  await request({
    url: `/users/${id}`,
    method: 'delete',
  });
};

/**
 * ★★★ 新增：根据用户名获取用户详情（包含ID）★★★
 * @param username 用户名
 * @returns 完整的用户对象
 */
export const getUserByUsername = async (username: string): Promise<User> => {
  const response: AxiosResponse<User> = await request({
    url: `/users/byUsername/${username}`,
    method: 'get',
  });
  return response.data;
};
/**
 * ★★★ 新增：更新用户密码 ★★★
 * @param id 用户ID
 * @param newPassword 新密码字符串
 * @returns 
 */
export const updateUserPassword = async (id: number, newPassword: string): Promise<void> => {
  // 根据后端接口，新密码直接作为请求体发送
  await request({
    url: `/users/${id}/password`,
    method: 'put',
    data: newPassword,
    // 明确请求体是纯文本
    headers: { 'Content-Type': 'text/plain' }
  });
};