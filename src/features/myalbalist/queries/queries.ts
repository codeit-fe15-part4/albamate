import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { useSessionUtils } from '@/shared/lib/auth/use-session-utils';

import { useMyAlbalistApi } from '../api/api';

export interface ApplicantQueryParams {
  limit?: number;
  cursor?: number;
  status?: 'REJECTED' | 'INTERVIEW_PENDING' | 'INTERVIEW_COMPLETED' | 'HIRED';
  keyword?: string;
}

export interface OwnerQueryParams {
  limit?: number;
  cursor?: number;
  orderBy?: 'mostRecent' | 'highestWage' | 'mostApplied' | 'mostScrapped';
  keyword?: string;
  isPublic?: boolean;
  isRecruiting?: boolean;
}

export const useApplicantMyAlbalistQuery = (
  params: ApplicantQueryParams = { limit: 10 }
) => {
  const { data: session, status } = useSession();
  const { isApplicant } = useSessionUtils();
  const api = useMyAlbalistApi();

  return useQuery({
    queryKey: ['applicantMyAlbalist', params],
    queryFn: async () => {
      try {
        const response = await api.getApplicantMyAlbalist(params);
        console.log('Applicant API 응답:', response.data);
        return response.data.data;
      } catch (error: any) {
        console.error('Applicant API 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            headers: error.config?.headers,
          },
          fullError: error,
        });

        // data와 config 객체의 내용을 별도로 출력
        console.error(
          '에러 응답 데이터:',
          JSON.stringify(error.response?.data, null, 2)
        );
        console.error(
          '요청 설정:',
          JSON.stringify(
            {
              url: error.config?.url,
              method: error.config?.method,
              params: error.config?.params,
              headers: {
                ...error.config?.headers,
                Authorization: error.config?.headers?.Authorization
                  ? 'Bearer [TOKEN]'
                  : '없음',
              },
            },
            null,
            2
          )
        );

        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    enabled:
      status === 'authenticated' &&
      !!(session as any)?.accessToken &&
      isApplicant,
    staleTime: 30000, // 30초 동안 데이터를 신선하다고 간주
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 리페치 비활성화
  });
};

export const useOwnerMyAlbalistQuery = (
  params: OwnerQueryParams = { limit: 10 }
) => {
  const { data: session, status } = useSession();
  const { isOwner } = useSessionUtils();
  const api = useMyAlbalistApi();

  return useQuery({
    queryKey: ['ownerMyAlbalist', params],
    queryFn: async () => {
      try {
        const response = await api.getOwnerMyAlbalist(params);
        console.log('Owner API 응답:', response.data);
        return response.data.data;
      } catch (error: any) {
        console.error('Owner API 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            headers: error.config?.headers,
          },
          fullError: error,
        });

        // data와 config 객체의 내용을 별도로 출력
        console.error(
          '에러 응답 데이터:',
          JSON.stringify(error.response?.data, null, 2)
        );
        console.error(
          '요청 설정:',
          JSON.stringify(
            {
              url: error.config?.url,
              method: error.config?.method,
              params: error.config?.params,
              headers: {
                ...error.config?.headers,
                Authorization: error.config?.headers?.Authorization
                  ? 'Bearer [TOKEN]'
                  : '없음',
              },
            },
            null,
            2
          )
        );

        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    enabled:
      status === 'authenticated' && !!(session as any)?.accessToken && isOwner,
    staleTime: 30000, // 30초 동안 데이터를 신선하다고 간주
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 리페치 비활성화
  });
};
