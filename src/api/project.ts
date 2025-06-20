// src/api/project.ts
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// Project 接口定义保持不变
export interface Project {
  id?: number;
  projectName: string;
  projectDescription?: string;
  createdAt?: string;
}

// ★★★ 核心修改：所有函数都使用 async/await 并返回 response.data ★★★

export const getAllProjects = async (): Promise<Project[]> => {
  const response: AxiosResponse<Project[]> = await request({
    url: '/projects',
    method: 'get',
  });
  return response.data;
};

export const createProject = async (data: Project): Promise<Project> => {
  const response: AxiosResponse<Project> = await request({
    url: '/projects',
    method: 'post',
    data,
  });
  return response.data;
};

export const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
  const response: AxiosResponse<Project> = await request({
    url: `/projects/${id}`,
    method: 'put',
    data,
  });
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await request({
    url: `/projects/${id}`,
    method: 'delete',
  });
};