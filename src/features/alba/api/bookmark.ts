import { axiosInstance } from '@/shared/lib/axios';

// 스크랩 추가
export const addBookmark = async (formId: string | number) => {
  return axiosInstance.post(`/forms/${formId}/scrap`);
};

// 스크랩 취소
export const removeBookmark = async (formId: string | number) => {
  return axiosInstance.delete(`/forms/${formId}/scrap`);
};

// 스크랩 상태 조회 (필요한 경우)
export const getBookmarkStatus = async (formId: string | number) => {
  return axiosInstance.get(`/forms/${formId}/scrap`);
};
