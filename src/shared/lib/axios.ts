import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { getSession, signOut, useSession } from 'next-auth/react';
import { useMemo } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fe-project-albaform.vercel.app';
const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';

const baseURL = `${API_URL}${TEAM_ID}/`;

// 개발 환경에서는 withCredentials 비활성화
const isDevelopment = process.env.NODE_ENV === 'development';

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들을 저장하는 배열
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 갱신 함수
const refreshToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  console.log('🔄 토큰 갱신 요청 시작');
  const response = await axios.post(`${baseURL}auth/refresh`, {
    refreshToken,
  });

  console.log('✅ 토큰 갱신 성공:', response.data);
  return response.data;
};

// 공통 요청 인터셉터
const createRequestInterceptor = () => async (config: any) => {
  try {
    const session = (await getSession()) as any;
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
      console.log('📤 요청 전송:', {
        url: config.url,
        method: config.method,
        hasToken: !!session.accessToken,
      });
    }
  } catch (error) {
    console.error('세션 가져오기 실패:', error);
  }
  return config;
};

// 공통 응답 인터셉터
const createResponseInterceptor = (instance: AxiosInstance) => ({
  onFulfilled: (response: AxiosResponse) => {
    console.log('📥 응답 수신:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  onRejected: async (error: AxiosError) => {
    const originalRequest = error.config as any;

    console.log('❌ 응답 에러:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
    });

    // 401 에러가 아니거나 이미 재시도된 요청이면 그대로 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    console.log('🔄 401 에러 감지, 토큰 갱신 시작');

    // 이미 토큰 갱신 중이면 대기열에 추가
    if (isRefreshing) {
      console.log('⏳ 토큰 갱신 중, 대기열에 추가');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log('🔄 대기열 요청 재시도');
          return instance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const session = (await getSession()) as any;
      if (!session?.refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      console.log('🔄 토큰 갱신 시도 중...');
      const refreshedTokens = await refreshToken(session.refreshToken);

      // 세션 업데이트 (NextAuth JWT 콜백에서 처리됨)
      // 여기서는 단순히 대기 중인 요청들만 처리
      processQueue(null, refreshedTokens.accessToken);

      // 현재 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;
      console.log('🔄 원본 요청 재시도');
      return instance(originalRequest);
    } catch (refreshError) {
      console.error('❌ 토큰 갱신 실패:', refreshError);

      // 토큰 갱신 실패 시 대기 중인 요청들 모두 실패 처리
      processQueue(refreshError, null);

      // 로그아웃 처리
      console.log('🚪 로그아웃 처리');
      await signOut({ redirect: false });

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
});

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: !isDevelopment,
});

// 공통 인터셉터 적용
axiosInstance.interceptors.request.use(createRequestInterceptor());
axiosInstance.interceptors.response.use(
  createResponseInterceptor(axiosInstance).onFulfilled,
  createResponseInterceptor(axiosInstance).onRejected
);

export const useAxiosWithAuth = () => {
  const { data: session } = useSession();

  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL,
      withCredentials: !isDevelopment,
      headers: {
        ...((session as any)?.accessToken && {
          Authorization: `Bearer ${(session as any).accessToken}`,
        }),
      },
    });

    // 공통 인터셉터 적용
    instance.interceptors.request.use(createRequestInterceptor());
    instance.interceptors.response.use(
      createResponseInterceptor(instance).onFulfilled,
      createResponseInterceptor(instance).onRejected
    );

    return instance;
  }, [session]);

  return authAxios;
};
