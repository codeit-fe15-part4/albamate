'use client';

import FloatingButton from '@common/button/FloatingButton';
import FloatingButtonContainer from '@common/button/FloatingButtonContainer';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useState, useMemo } from 'react';

import useAlbaListApi from '@/features/albalist/api/albaListApi';
import { useAuthSession } from '@/features/auth';

interface Props {
  onToggleOwner: () => void;
  formId: number;
  onSigninRedirect: () => void;
}

const FloatingButtons = ({
  onToggleOwner,
  formId,
  onSigninRedirect,
}: Props) => {
  const { isAuthenticated, refreshSession } = useAuthSession();
  const { scrapAlba, cancelScrapAlba } = useAlbaListApi();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  // 캐시에서 현재 스크랩 상태를 가져오는 메모이제이션된 함수
  const currentScrapState = useMemo(() => {
    // 1. 상세 캐시 우선 확인 (가장 신뢰할 수 있는 데이터)
    const albaDetailData = queryClient.getQueryData(['albaDetail', formId]) as any;
    if (albaDetailData && typeof albaDetailData.isScrapped === 'boolean') {
      return {
        isScrapped: albaDetailData.isScrapped,
        scrapCount: albaDetailData.scrapCount ?? 0,
      };
    }

    // 2. 리스트 캐시에서 찾기
    const albaListData = queryClient.getQueryData(['albaList']) as any;
    if (albaListData?.pages) {
      for (const page of albaListData.pages) {
        const cachedItem = page.data?.find((alba: any) => alba.id === formId);
        if (cachedItem && typeof cachedItem.isScrapped === 'boolean') {
          return {
            isScrapped: cachedItem.isScrapped,
            scrapCount: cachedItem.scrapCount ?? 0,
          };
        }
      }
    }

    // 3. 기본값
    return {
      isScrapped: false,
      scrapCount: 0,
    };
  }, [queryClient, formId]);

  // 모든 관련 캐시를 업데이트하는 함수 (안전하고 단순하게)
  const updateAllCaches = useCallback(
    (newScrapState: boolean, countDelta: number) => {
      // 1. 알바 리스트 캐시 업데이트 (모든 페이지)
      queryClient.setQueriesData({ queryKey: ['albaList'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data:
              page.data?.map((alba: any) =>
                alba.id === formId
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

      // 2. 알바 상세 캐시 업데이트
      queryClient.setQueryData(['albaDetail', formId], (oldData: any) =>
        oldData
          ? {
              ...oldData,
              isScrapped: newScrapState,
              scrapCount: Math.max(0, (oldData.scrapCount ?? 0) + countDelta),
            }
          : {
              id: formId,
              isScrapped: newScrapState,
              scrapCount: Math.max(0, countDelta),
            }
      );
    },
    [formId, queryClient]
  );

  // 서버와 동기화 함수
  const syncWithServer = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['albaList'] }),
      queryClient.invalidateQueries({ queryKey: ['albaDetail', formId] }),
      queryClient.invalidateQueries({ queryKey: ['myScrapList'] }),
      queryClient.invalidateQueries({ queryKey: ['myAlbaList'] }),
    ]);
  }, [formId, queryClient]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!isAuthenticated) {
      onSigninRedirect();
      return;
    }

    if (isLoading) return;

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
        await cancelScrapAlba(formId);
        alert('스크랩을 취소했어요.');
      } else {
        // 스크랩 추가
        try {
          await scrapAlba(formId);
          alert('스크랩했어요!');
        } catch (error: any) {
          // 이미 스크랩된 경우 처리
          if (
            error?.response?.data?.message === '이미 스크랩한 알바폼입니다.' ||
            error?.response?.data?.message?.includes('이미 스크랩')
          ) {
            // 서버에서는 이미 스크랩된 상태 -> 취소로 처리
            await cancelScrapAlba(formId);
            // 옵티미스틱 업데이트를 취소로 수정 (원래 +1했으므로 -2로 보정)
            updateAllCaches(false, -2);
            alert('스크랩을 취소했어요.');
          } else {
            throw error;
          }
        }
      }

      // 성공 후 서버 데이터로 다시 동기화
      await syncWithServer();
    } catch (error: any) {
      // 실패 시 옵티미스틱 업데이트 되돌리기
      updateAllCaches(wasScraped, -countDelta);

      if (error?.message?.includes('세션') || error?.response?.status === 401) {
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
    isAuthenticated,
    isLoading,
    currentScrapState.isScrapped,
    onSigninRedirect,
    refreshSession,
    formId,
    scrapAlba,
    cancelScrapAlba,
    updateAllCaches,
    syncWithServer,
  ]);

  return (
    <FloatingButtonContainer position="right-center">
      <FloatingButton
        isBookmarked={currentScrapState.isScrapped}
        type="bookmark"
        onClick={handleBookmarkToggle}
      />
      <FloatingButton type="share" />
      <FloatingButton type="addAlbatalk" onClick={onToggleOwner} />
    </FloatingButtonContainer>
  );
};

export default FloatingButtons;