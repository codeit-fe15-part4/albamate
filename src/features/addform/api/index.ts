'use client';

import { AxiosResponse } from 'axios';

import {
  CreateFormRequest,
  CreateFormResponse,
} from '@/features/addform/schema/addform.schema';
import { axiosInstance } from '@/shared/lib/axios';
import { generateUniqueFileName } from '@/shared/utils/generateUniqueFileName';

export const useAddformApi = () => {
  const authAxios = axiosInstance;

  return {
    postAddform: (
      form: CreateFormRequest
    ): Promise<AxiosResponse<CreateFormResponse>> => {
      return authAxios.post('/forms', form);
    },
    editAddform: ({
      formId,
      form,
    }: {
      formId: number;
      form: CreateFormRequest;
    }): Promise<AxiosResponse<CreateFormResponse>> => {
      return authAxios.patch(`/forms/${formId}`, form);
    },
    uploadImage: (file: File): Promise<AxiosResponse<{ url: string }>> => {
      const formData = new FormData();
      const newFileName = generateUniqueFileName(file);
      formData.append('image', file, newFileName);
      return authAxios.post('/images/upload', formData);
    },
  };
};
