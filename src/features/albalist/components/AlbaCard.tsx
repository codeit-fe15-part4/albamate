'use client';

import AlbaCardItem from '@common/list/AlbaCardItem';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCallback, useState, useEffect } from 'react';

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
  
  // 로컬 상태로 스크랩 정보 관리
  const [localScrapState, setLocalScrapState] = useState({
    isScrapped: item.isScrapped ?? false,
    scrapCount: item.scrapCount ?? 0,
  });

  // 캐시에서 실시간으로 스크랩 상태를 가져오는 함수
  const getCurrentScrapState = useCallback(() => {
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

    // 3. 현재 로컬 상태 반환 (캐시가 없는 경우)
    return localScrapState;
  }, [queryClient, item.id, localScrapState]);

  // 캐시 변경을 실시간으로 감지하여 로컬 상태 업데이트
  useEffect(() => {
    const updateLocalState = () => {
      const currentState = getCurrentScrapState();
      setLocalScrapState(prev => {
        if (prev.isScrapped !== currentState.isScrapped || 
            prev.scrapCount !== currentState.scrapCount) {
          return currentState;
        }
        return prev;
      });
    };

    // 초기 로드 시 동기화
    updateLocalState();

    // 캐시 변경 감지
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      const queryKey = event?.query?.queryKey;
      if (
        (queryKey?.[0] === 'albaList') ||
        (queryKey?.[0] === 'albaDetail' && queryKey?.[1] === item.id)
      ) {
        setTimeout(updateLocalState, 50);
      }
    });

    return unsubscribe;
  }, [getCurrentScrapState, item.id, queryClient]);

  // props 변경 시 초기화 (서버에서 새 데이터가 온 경우)
  useEffect(() => {
    const newState = {
      isScrapped: item.isScrapped ?? false,
      scrapCount: item.scrapCount ?? 0,
    };
    
    // 캐시에 데이터가 없는 경우에만 props로 업데이트
    const cachedState = getCurrentScrapState();
    if (cachedState.isScrapped === localScrapState.isScrapped && 
        cachedState.scrapCount === localScrapState.scrapCount) {
      setLocalScrapState(newState);
    }
  }, [item.isScrapped, item.scrapCount, getCurrentScrapState, localScrapState]);

  const handleCardClick = useCallback(async () => {
    queryClient.prefetchQuery({
      queryKey: ['albaDetail', item.id],
      queryFn: () => getAlbaDetail(item.id).then(res => res.data),
    });
    router.push(`/alba/${item.id}`);
  }, [item.id, queryClient, getAlbaDetail, router]);

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
                      scrapCount: Math.max(0, alba.scrapCount + countDelta),
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
              scrapCount: Math.max(0, oldData.scrapCount + countDelta),
            }
          : oldData
      );

      // 3. 기타 무효화
      queryClient.invalidateQueries({ queryKey: ['myScrapList'] });
      queryClient.invalidateQueries({ queryKey: ['myAlbaList'] });
    },
    [item.id, queryClient]
  );

  const handleScrapToggle = useCallback(async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    const newScrapState = !localScrapState.isScrapped;
    const countDelta = newScrapState ? 1 : -1;

    // 즉시 로컬 상태 업데이트 (옵티미스틱)
    setLocalScrapState(prev => ({
      isScrapped: newScrapState,
      scrapCount: Math.max(0, prev.scrapCount + countDelta),
    }));

    // 캐시 업데이트
    updateAllCaches(newScrapState, countDelta);

    try {
      await refreshSession();

      if (localScrapState.isScrapped) {
        await cancelScrapAlba(item.id);
        alert(`${item.title} 스크랩 취소 완료!`);
      } else {
        try {
          await scrapAlba(item.id);
          alert(`${item.title} 스크랩 완료!`);
        } catch (error: any) {
          if (
            error?.response?.data?.message === '이미 스크랩한 알바폼입니다.'
          ) {
            await cancelScrapAlba(item.id);
            // 이미 스크랩된 상태였으므로 취소로 처리
            setLocalScrapState(prev => ({
              isScrapped: false,
              scrapCount: Math.max(0, prev.scrapCount - 2), // 옵티미스틱 + 실제 취소
            }));
            updateAllCaches(false, -2);
            alert(`${item.title} 스크랩 취소 완료!`);
          } else {
            throw error;
          }
        }
      }

      // 성공 후 서버와 동기화
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['albaList'] }),
        queryClient.invalidateQueries({ queryKey: ['albaDetail', item.id] }),
      ]);
    } catch (error: any) {
      // 실패 시 롤백
      setLocalScrapState(prev => ({
        isScrapped: !newScrapState,
        scrapCount: Math.max(0, prev.scrapCount - countDelta),
      }));
      updateAllCaches(!newScrapState, -countDelta);

      if (error?.response?.status === 401) {
        signOut({ callbackUrl: '/signin', redirect: true });
      } else {
        alert('요청 중 오류가 발생했습니다.');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isAuthenticated,
    localScrapState.isScrapped,
    item.id,
    item.title,
    router,
    refreshSession,
    scrapAlba,
    cancelScrapAlba,
    updateAllCaches,
    queryClient,
  ]);

  const dropdownOptions = [
    {
      label: '지원하기',
      onClick: () => router.push(`/apply/${item.id}`),
    },
    {
      label: localScrapState.isScrapped ? '스크랩 취소' : '스크랩',
      onClick: handleScrapToggle,
      disabled: isLoading,
    },
  ];

  return (
    <AlbaCardItem
      dropdownOptions={dropdownOptions}
      isScrapped={localScrapState.isScrapped}
      item={{ ...item, scrapCount: localScrapState.scrapCount }}
      onClick={handleCardClick}
    />
  );
};

export default AlbaCard;
