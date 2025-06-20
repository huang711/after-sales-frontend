// src/api/customer.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// Customer 接口定义保持不变
export interface Customer {
  id?: number;
  customerName: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
}

// ★★★ 核心修改：所有函数都使用 async/await 并返回 response.data ★★★

export const getAllCustomers = async (): Promise<Customer[]> => {
  const response: AxiosResponse<Customer[]> = await request({
    url: '/customers',
    method: 'get',
  });
  return response.data;
};

export const createCustomer = async (data: Customer): Promise<Customer> => {
  const response: AxiosResponse<Customer> = await request({
    url: '/customers',
    method: 'post',
    data,
  });
  return response.data;
};

export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer> => {
  const response: AxiosResponse<Customer> = await request({
    url: `/customers/${id}`,
    method: 'put',
    data,
  });
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await request({
    url: `/customers/${id}`,
    method: 'delete',
  });
};