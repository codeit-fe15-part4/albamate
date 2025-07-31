'use client';

import AlbaCardItem from '@common/list/AlbaCardItem';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCallback, useState, useEffect, useMemo } from 'react';

import { useAuthSession } from '@/features/auth';
import type { AlbaItem } from '@/shared/types/alba';

import useAlbaListApi from '../api/albaListApi';

interface Props {
  item: AlbaItem & { isScrapped?: boolean };
}

const AlbaCard = ({ item }: Props) => {
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useAuthSession();
  const { scrapAlba, cancelScrapAlba, getAlbaDetail } = useAlbaListApi();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  // 캐시에서 현재 스크랩 상태를 가져오는 메모이제이션된 함수 (성능 최적화)
  const currentScrapState = useMemo(() => {
    // 1. 알바 상세 캐시 확인 (가장 신뢰할 수 있는 데이터)
    const detailCache = queryClient.getQueryData([
      'albaDetail',
      item.id,
    ]) as any;
    if (detailCache && typeof detailCache.isScrapped === 'boolean') {
      return {
        isScrapped: detailCache.isScrapped,
        scrapCount: detailCache.scrapCount ?? 0,
      };
    }

    // 2. 알바 리스트 캐시 확인
    const listCache = queryClient.getQueryData(['albaList']) as
      | { pages: { data: any[] }[] }
      | undefined;

    if (listCache?.pages) {
      for (const page of listCache.pages) {
        const matched = page.data.find((alba: any) => alba.id === item.id);
        if (matched && typeof matched.isScrapped === 'boolean') {
          return {
            isScrapped: matched.isScrapped,
            scrapCount: matched.scrapCount ?? 0,
          };
        }
      }
    }

    // 3. props 기본값 (서버에서 받은 초기 데이터)
    return {
      isScrapped: item.isScrapped ?? false,
      scrapCount: item.scrapCount ?? 0,
    };
  }, [queryClient, item.id, item.isScrapped, item.scrapCount]);

  // 서버 데이터로 캐시 초기화 (새로고침 시 데이터 일관성 보장)
  useEffect(() => {
    if (item.isScrapped !== undefined || item.scrapCount !== undefined) {
      // 서버에서 받은 데이터를 캐시에 설정 (단일 진실 소스)
      queryClient.setQueryData(['albaDetail', item.id], (oldData: any) => ({
        ...oldData,
        id: item.id,
        isScrapped: item.isScrapped ?? false,
        scrapCount: item.scrapCount ?? 0,
      }));
    }
  }, [item.isScrapped, item.scrapCount, item.id, queryClient]);

  const handleCardClick = useCallback(async () => {
    // 상세 페이지 이동 전 프리페치
    queryClient.prefetchQuery({
      queryKey: ['albaDetail', item.id],
      queryFn: () => getAlbaDetail(item.id).then(res => res.data),
    });
    router.push(`/alba/${item.id}`);
  }, [item.id, queryClient, getAlbaDetail, router]);

  // 캐시 업데이트 함수 (안전하고 단순하게)
  const updateAllCaches = useCallback(
    (newScrapState: boolean, countDelta: number) => {
      // 1. 리스트 캐시 업데이트
      queryClient.setQueriesData({ queryKey: ['albaList'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data:
              page.data?.map((alba: any) =>
                alba.id === item.id
                  ? {
                      ...alba,
                      isScrapped: newScrapState,
                      scrapCount: Math.max(0, (alba.scrapCount ?? 0) + countDelta),
                    }
                  : alba
              ) || [],
          })),
        };
      });

      // 2. 상세 캐시 업데이트
      queryClient.setQueryData(['albaDetail', item.id], (oldData: any) =>
        oldData
          ? {
              ...oldData,
              isScrapped: newScrapState,
              scrapCount: Math.max(0, (oldData.scrapCount ?? 0) + countDelta),
            }
          : {
              id: item.id,
              isScrapped: newScrapState,
              scrapCount: Math.max(0, countDelta),
            }
      );
    },
    [item.id, queryClient]
  );

  // 서버와 동기화 함수
  const syncWithServer = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['albaList'] }),
      queryClient.invalidateQueries({ queryKey: ['albaDetail', item.id] }),
      queryClient.invalidateQueries({ queryKey: ['myScrapList'] }),
      queryClient.invalidateQueries({ queryKey: ['myAlbaList'] }),
    ]);
  }, [item.id, queryClient]);

  const handleScrapToggle = useCallback(async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    const wasScraped = currentScrapState.isScrapped;
    const newScrapState = !wasScraped;
    const countDelta = newScrapState ? 1 : -1;

    // 옵티미스틱 업데이트
    updateAllCaches(newScrapState, countDelta);

    try {
      // 세션 갱신
      await refreshSession();

      if (wasScraped) {
        // 스크랩 취소
        await cancelScrapAlba(item.id);
        alert(`${item.title} 스크랩 취소 완료!`);
      } else {
        // 스크랩 추가
        try {
          await scrapAlba(item.id);
          alert(`${item.title} 스크랩 완료!`);
        } catch (error: any) {
          // 이미 스크랩된 경우 처리
          if (
            error?.response?.data?.message === '이미 스크랩한 알바폼입니다.' ||
            error?.response?.data?.message?.includes('이미 스크랩')
          ) {
            await cancelScrapAlba(item.id);
            // 옵티미스틱 업데이트를 취소로 수정 (원래 +1했으므로 -2로 보정)
            updateAllCaches(false, -2);
            alert(`${item.title} 스크랩 취소 완료!`);
          } else {
            throw error;
          }
        }
      }

      // 성공 후 서버와 동기화
      await syncWithServer();
    } catch (error: any) {
      // 실패 시 롤백
      updateAllCaches(wasScraped, -countDelta);

      if (error?.response?.status === 401 || error?.message?.includes('세션')) {
        console.warn('세션 만료. 로그아웃 진행.');
        signOut({ callbackUrl: '/signin', redirect: true });
      } else {
        alert('요청 중 오류가 발생했습니다.');
        console.error('스크랩 처리 오류:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isAuthenticated,
    currentScrapState.isScrapped,
    item.id,
    item.title,
    router,
    refreshSession,
    scrapAlba,
    cancelScrapAlba,
    updateAllCaches,
    syncWithServer,
  ]);

  const dropdownOptions = [
    {
      label: '지원하기',
      onClick: () => router.push(`/apply/${item.id}`),
    },
    {
      label: currentScrapState.isScrapped ? '스크랩 취소' : '스크랩',
      onClick: handleScrapToggle,
      disabled: isLoading,
    },
  ];

  return (
    <AlbaCardItem
      dropdownOptions={dropdownOptions}
      isScrapped={currentScrapState.isScrapped}
      item={{ ...item, scrapCount: currentScrapState.scrapCount }}
      onClick={handleCardClick}
    />
  );
};

export default AlbaCard;
