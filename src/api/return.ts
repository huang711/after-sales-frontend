// src/api/return.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 对应后端的 ReturnRecord.java
export interface ReturnRecord {
  returnType: string;
  returnAmount: number;
  returnReason: string;
  returnRemark?: string;
  originalDeliveryRecord: { id: number };
  customerServiceStaff: { id: number };
}

// 对应后端的 ReturnApplyRequest.java
export interface ReturnApplyRequest {
  record: ReturnRecord;
  productInstanceIds: number[];
}

// 对应后端的 ReturnRecordResponseDto.java
export interface ReturnRecordResponse {
  id: number;
  returnType: string;
  returnStatus: string;
  returnAmount: number;
  returnReason: string;
  customerServiceStaffUsername: string;
  originalDeliveryRecordId: number;
  // 可以根据需要添加更多字段
}

/**
 * 搜索退货记录
 * @param params 搜索参数，例如 { returnStatus: '待确认' }
 * @returns 退货记录列表
 */
export const searchReturnRecords = async (params: { returnStatus?: string }): Promise<ReturnRecordResponse[]> => {
  const response: AxiosResponse<ReturnRecordResponse[]> = await request({
    url: '/return-records/search',
    method: 'get',
    params,
  });
  return response.data;
};

/**
 * 申请新的退货
 * @param data 退货申请的请求体
 * @returns 创建成功的退货记录
 */
export const applyReturn = async (data: ReturnApplyRequest): Promise<ReturnRecordResponse> => {
  const response: AxiosResponse<ReturnRecordResponse> = await request({
    url: '/return-records/apply',
    method: 'post',
    data,
  });
  return response.data;
};