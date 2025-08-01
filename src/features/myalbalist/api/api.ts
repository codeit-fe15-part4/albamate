import { useAxiosWithAuth } from '@/shared/lib/axios';

interface PaginationParams {
  limit?: number;
  cursor?: number;
}

interface OwnerFilterParams extends PaginationParams {
  orderBy?: 'mostRecent' | 'highestWage' | 'mostApplied' | 'mostScrapped';
  keyword?: string;
  isPublic?: boolean;
  isRecruiting?: boolean;
}

interface ApplicantFilterParams extends PaginationParams {
  status?: 'REJECTED' | 'INTERVIEW_PENDING' | 'INTERVIEW_COMPLETED' | 'HIRED';
  keyword?: string;
}

// 커스텀 훅으로 인증된 axios 인스턴스 사용
export const useMyAlbalistApi = () => {
  const authAxios = useAxiosWithAuth();

  return {
    getApplicantMyAlbalist: (params: ApplicantFilterParams = { limit: 10 }) => {
      return authAxios.get('users/me/applications', {
        params,
      });
    },
    getOwnerMyAlbalist: (params: OwnerFilterParams = { limit: 10 }) => {
      return authAxios.get('users/me/forms', {
        params,
      });
    },
  };
};
