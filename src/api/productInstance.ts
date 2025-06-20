// src/api/productInstance.ts

import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 对应后端的 ProductInstanceDetailDto.java 
export interface ProductInstanceDetail {
  id: number;
  serialNumber: string;
  afterSalesCode: string;
  currentStatus: string;
  productId: number;
  productName: string; //
  currentWarehouseLocation?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// 定义搜索参数的类型
export interface InstanceSearchParams {
  keyword?: string;
  productId?: number;
  status?: string;
}

/**
 * 根据条件搜索库存实例
 * @param params 包含 keyword, productId, status 的搜索对象
 * @returns 库存实例详情列表
 */
export const searchProductInstances = async (params: InstanceSearchParams): Promise<ProductInstanceDetail[]> => {
  const response: AxiosResponse<ProductInstanceDetail[]> = await request({
    url: '/product-instances/search', // 对应 ProductInstanceController 的 search 方法 
    method: 'get',
    params, // GET请求使用params来传递查询字符串
  });
  return response.data;
};

/**
 * 更新库存实例信息
 * @param id 要更新的实例ID
 * @param data 包含要更新字段的对象
 * @returns 更新后的库存实例详情
 */
export const updateProductInstance = async (id: number, data: Partial<ProductInstanceDetail>): Promise<ProductInstanceDetail> => {
  const response: AxiosResponse<ProductInstanceDetail> = await request({
    url: `/product-instances/${id}`, // 对应 ProductInstanceController 的 updateProductInstance 方法 
    method: 'put',
    data,
  });
  return response.data;
};