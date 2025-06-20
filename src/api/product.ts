// src/api/product.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';
import type { ProductCategory } from './productCategory'; // 复用之前定义的类型
import type { Supplier } from './supplier'; // 复用之前定义的类型

// 对应后端的 Product.java 和 ProductResponseDto.java
export interface Product {
  id?: number;
  brand: string;
  modelName: string;
  category: { id: number }; // 提交时只需要id
  supplier: { id: number }; // 提交时只需要id
  sensorType?: string;
  effectivePixels?: number;
  maxVideoResolution?: string;
  standardPurchasePrice: number;
  standardSellingPrice: number;
  standardWarrantyDays: number;
}

// 用于接收列表的类型
export interface ProductResponse extends Omit<Product, 'category' | 'supplier'> {
  categoryId: number;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  productName: string;
}

// 获取所有商品型号列表
export const getAllProducts = async (): Promise<ProductResponse[]> => {
  const response: AxiosResponse<ProductResponse[]> = await request({
    url: '/products',
    method: 'get',
  });
  return response.data;
};

// 创建新商品型号
export const createProduct = async (data: Product): Promise<Product> => {
  const response: AxiosResponse<Product> = await request({
    url: '/products',
    method: 'post',
    data,
  });
  return response.data;
};

// 更新商品型号信息
export const updateProduct = async (id: number, data: Partial<Product>): Promise<ProductResponse> => {
  const response: AxiosResponse<ProductResponse> = await request({
    url: `/products/${id}`,
    method: 'put',
    data,
  });
  return response.data;
};

// 删除商品型号
export const deleteProduct = async (id: number): Promise<void> => {
  await request({
    url: `/products/${id}`,
    method: 'delete',
  });
};