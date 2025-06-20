// src/api/warehousing.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// ★★★ 核心修复：删除了之前错误的 import 语句 ★★★

// 用于提交的单个实例的数据结构
export interface NewProductInstanceData {
  serialNumber: string;
  afterSalesCode: string;
  currentWarehouseLocation?: string;
  remarks?: string;
}

// 对应后端的 WarehousingRecord
export interface WarehousingRecord {
  recordNumber: string;
  warehousingTime: string;
  product: { id: number };
  supplier: { id: number };
  operator: { id: number };
  quantity: number;
  actualPurchasePrice: number;
}

// ---------------------------------------------------
// 备注：为了让后端能正确接收，这里的 productInstancesData
// 类型应该与 NewProductInstanceData 匹配。
// 我将原代码中的 ProductInstance 修正为 NewProductInstanceData[]
// ---------------------------------------------------
export interface WarehousingRecordRequest {
  record: WarehousingRecord;
  productInstancesData: NewProductInstanceData[]; 
}

// 对应后端的 WarehousingRecordResponseDto
export interface WarehousingRecordResponse {
  id: number;
  recordNumber: string;
}

/**
 * 创建新的入库记录
 * @param data 包含主记录和实例列表的请求体
 * @returns 创建成功的入库记录
 */
export const createWarehousingRecord = async (data: WarehousingRecordRequest): Promise<WarehousingRecordResponse> => {
  const response: AxiosResponse<WarehousingRecordResponse> = await request({
    url: '/warehousing-records',
    method: 'post',
    data,
  });
  return response.data;
};