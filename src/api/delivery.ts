import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 对应后端的 ProductInstanceRequestDto.java
export interface DeliveryInstanceRequest {
  instanceId: number;
  actualUnitPrice: number;
}

// 对应后端的 DeliveryRecord.java 实体，用于创建请求
export interface DeliveryRecord {
  recordNumber: string;
  deliveryTime: string;
  customer: { id: number };
  project?: { id?: number }; // 项目是可选的
  operator: { id: number };
  totalSalesAmount: number;
}

// 对应后端的 DeliveryRecordRequest.java
export interface DeliveryRecordRequest {
  record: DeliveryRecord;
  instanceRequests: DeliveryInstanceRequest[];
}

// 对应后端的 DeliveryRecordResponseDto.java
export interface DeliveryRecordResponse {
  id: number;
  recordNumber: string;
  // 可以根据需要从后端DTO添加更多字段
}

// 用于获取出库单详情的完整类型
export interface DeliveryRecordDetail extends DeliveryRecordResponse {
  customerName: string;
  projectName?: string;
  deliveredInstances: Array<{
    instanceId: number;
    serialNumber: string;
    afterSalesCode: string;
    actualSellingPrice: number;
  }>;
}

/**
 * 创建新的出库记录
 * @param data 包含主记录和实例列表的请求体
 * @returns 创建成功的出库记录
 */
export const createDeliveryRecord = async (data: DeliveryRecordRequest): Promise<DeliveryRecordResponse> => {
  const response: AxiosResponse<DeliveryRecordResponse> = await request({
    url: '/delivery-records',
    method: 'post',
    data,
  });
  return response.data;
};

/**
 * 根据ID获取出库单详情
 * @param id 出库单ID
 * @returns 出库单详细信息
 */
export const getDeliveryRecordDetail = async (id: number): Promise<DeliveryRecordDetail> => {
  const response: AxiosResponse<DeliveryRecordDetail> = await request({
    url: `/delivery-records/${id}`,
    method: 'get',
  });
  return response.data;
};