import { axiosInstance } from '@/shared/lib/axios';
import { addBookmark, removeBookmark } from '@/features/alba/api/bookmark';

const useAlbaListApi = () => {
  // 알바 상세 정보 조회
  const getAlbaDetail = async (formId: number) => {
    return axiosInstance.get(`/forms/${formId}`);
  };

  // 알바 리스트 조회
  const getAlbaList = async (params?: any) => {
    return axiosInstance.get('/forms', { params });
  };

  // 스크랩 추가
  const scrapAlba = async (formId: number) => {
    return addBookmark(formId);
  };

  // 스크랩 취소
  const cancelScrapAlba = async (formId: number) => {
    return removeBookmark(formId);
  };

  return {
    getAlbaDetail,
    getAlbaList,
    scrapAlba,
    cancelScrapAlba,
  };
};

export default useAlbaListApi;