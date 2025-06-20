// src/api/productCategory.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 对应后端的 ProductCategory.java 
export interface ProductCategory {
  id?: number;
  categoryName: string; // 
  createdAt?: string;
}

// 获取所有商品类别
export const getAllCategories = async (): Promise<ProductCategory[]> => {
  const response: AxiosResponse<ProductCategory[]> = await request({
    url: '/product-categories', //
    method: 'get',
  });
  return response.data;
};

// 创建新类别
export const createCategory = async (data: ProductCategory): Promise<ProductCategory> => {
  const response: AxiosResponse<ProductCategory> = await request({
    url: '/product-categories', //
    method: 'post',
    data,
  });
  return response.data;
};

// 更新类别
export const updateCategory = async (id: number, data: Partial<ProductCategory>): Promise<ProductCategory> => {
  const response: AxiosResponse<ProductCategory> = await request({
    url: `/product-categories/${id}`, //
    method: 'put',
    data,
  });
  return response.data;
};

// 删除类别
export const deleteCategory = async (id: number): Promise<void> => {
  await request({
    url: `/product-categories/${id}`, //
    method: 'delete',
  });
};