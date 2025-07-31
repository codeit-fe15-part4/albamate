'use client';

import ToastPopup from '@common/popup/ToastPopup';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import useAlbaListApi from '@/features/albalist/api/albaListApi';
import useModalStore from '@/shared/store/useModalStore';
import { getDDayString } from '@/shared/utils/format';

import ApplicationList from './ApplicationList';
import FloatingButtons from './button/FloatingButtons';
import ImageCarousel from './ImageCarousel';
import RecruitCloseModal from './modal/RecruitClosedModal';
import PageContent from './PageContent';

const AlbaPage = () => {
  const { formId } = useParams();
  const router = useRouter();
  const { openModal } = useModalStore();
  const queryClient = useQueryClient();

  const [popupVisible, setPopupVisible] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const { getAlbaDetail } = useAlbaListApi();

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['albaDetail', Number(formId)],
    queryFn: () => getAlbaDetail(Number(formId)).then(res => res.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    // 성공 시 캐시 동기화 강화
    onSuccess: (data) => {
      // 서버에서 받은 데이터를 다른 캐시에도 반영
      if (data?.isScrapped !== undefined) {
        queryClient.setQueriesData({ queryKey: ['albaList'] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((alba: any) =>
                alba.id === Number(formId)
                  ? {
                      ...alba,
                      isScrapped: data.isScrapped,
                      scrapCount: data.scrapCount ?? alba.scrapCount ?? 0,
                    }
                  : alba
              ) ?? [],
            })),
          };
        });
      }
    },
  });

  // 모집 마감 모달 및 팝업 표시
  useEffect(() => {
    if (!item) return;

    const dDayText = getDDayString(item.recruitmentEndDate);
    if (dDayText === '모집 마감') {
      openModal(<RecruitCloseModal />);
    }

    setPopupVisible(true);
  }, [item, openModal]);

  // 페이지 언마운트 시 알바 리스트 캐시 새로고침 (서버 동기화 강화)
  useEffect(() => {
    return () => {
      // 페이지를 떠날 때 알바 리스트 무효화하여 최신 데이터 보장
      queryClient.invalidateQueries({ queryKey: ['albaList'] });
      queryClient.invalidateQueries({ queryKey: ['myScrapList'] });
    };
  }, [queryClient]);

  // 브라우저 뒤로가기 감지 (서버 동기화 강화)
  useEffect(() => {
    const handlePopState = () => {
      // 뒤로가기 시 알바 리스트 새로고침
      queryClient.invalidateQueries({ queryKey: ['albaList'] });
      queryClient.invalidateQueries({ queryKey: ['myScrapList'] });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [queryClient]);

  const handleSigninRedirect = () => {
    // 로그인 페이지로 이동하기 전에 캐시 새로고침
    queryClient.invalidateQueries({ queryKey: ['albaList'] });
    queryClient.invalidateQueries({ queryKey: ['myScrapList'] });
    router.push('/signin');
  };

  if (isLoading) {
    return <div className="py-40 text-center">불러오는 중...</div>;
  }

  if (isError || !item) {
    return (
      <div className="py-40 text-center text-error">
        해당 알바 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-375 min-w-320 flex-col gap-40 py-120 text-sm lg:max-w-7xl lg:gap-80 lg:text-lg">
      <ToastPopup
        applyCount={item.applyCount}
        duration={5000}
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
      />

      <FloatingButtons
        formId={Number(formId)}
        onSigninRedirect={handleSigninRedirect}
        onToggleOwner={() => setIsOwner(prev => !prev)}
      />

      <ImageCarousel />
      <PageContent isOwner={isOwner} item={item} />

      {isOwner && (
        <div>
          <div className="my-40 h-8 w-full bg-gray-50 lg:my-80 lg:h-12 dark:bg-gray-800" />
          <ApplicationList />
        </div>
      )}
    </div>
  );
};

export default AlbaPage;
