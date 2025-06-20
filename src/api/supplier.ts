import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 定义 Supplier 类型，与后端实体对应
export interface Supplier {
  id?: number;
  supplierName: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
}

// 获取所有供应商列表
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  const response: AxiosResponse<Supplier[]> = await request({
    url: '/suppliers',
    method: 'get',
  });
  return response.data;
};

// 创建新供应商
export const createSupplier = async (data: Supplier): Promise<Supplier> => {
  const response: AxiosResponse<Supplier> = await request({
    url: '/suppliers',
    method: 'post',
    data,
  });
  return response.data;
};

// 更新供应商信息
export const updateSupplier = async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
  const response: AxiosResponse<Supplier> = await request({
    url: `/suppliers/${id}`,
    method: 'put',
    data,
  });
  return response.data;
};

// 删除供应商
export const deleteSupplier = async (id: number): Promise<void> => {
  await request({
    url: `/suppliers/${id}`,
    method: 'delete',
  });
};