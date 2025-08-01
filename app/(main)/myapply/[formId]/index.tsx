'use client';

import PrimaryButton from '@common/button/PrimaryButton';
import { Slide } from '@common/imageCarousel/carousel';
import ImageCarousel from '@common/imageCarousel/ImageCarousel';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import AlbaDescription from '@/shared/components/alba/AlbaDescription';
import AlbaDetail from '@/shared/components/alba/AlbaDetail';
import { useSessionUtils } from '@/shared/lib/auth/use-session-utils';
import useApplicationStore from '@/shared/store/useApplicationStore';
import { createSlidesFromUrls } from '@/shared/utils/carousel';

import {
  useAlbaformDetailQuery,
  useApplicationByIdQuery,
  useMyApplicationQuery,
} from '../../queries/queries';
import ApplicationProfile from './ApplicationProfile';
import ApplicationState from './ApplicationState';

interface ApplicationDetailProps {
  formId: string;
  applicationId?: string;
}

const ApplicationDetail = ({
  formId,
  applicationId,
}: ApplicationDetailProps) => {
  console.log('🎯 ApplicationDetail 렌더링 시작:', { formId, applicationId });

  const router = useRouter();

  // Zustand 스토어에서 비회원 데이터 가져오기
  const {
    guestApplication,
    isGuestMode,
    clearGuestApplication,
    _hasHydrated,
  } = useApplicationStore();

  const {
    isOwner,
    isApplicant,
    isAuthenticated,
    isLoading: sessionLoading,
    user,
  } = useSessionUtils();

  // 페이지 벗어날 때 비회원 데이터 정리
  useEffect(() => {
    return () => {
      if (isGuestMode) {
        console.log('🧹 페이지 벗어남 - 게스트 데이터 정리');
        clearGuestApplication();
      }
    };
  }, [isGuestMode, clearGuestApplication]);

  // 공통: 알바폼 상세 조회
  const {
    data: albaformData,
    isLoading: albaLoading,
    error: albaError,
  } = useAlbaformDetailQuery(formId);

  // 지원자: 내 지원서 조회 (로그인된 지원자만)
  const {
    data: myApplicationData,
    isLoading: myAppLoading,
    error: myAppError,
  } = useMyApplicationQuery(formId, {
    enabled: isApplicant && isAuthenticated && !isGuestMode,
  });

  // 사장님용: 특정 지원서 조회
  const {
    data: ownerApplicationData,
    isLoading: ownerAppLoading,
    error: ownerAppError,
  } = useApplicationByIdQuery(applicationId, {
    enabled: isOwner && isAuthenticated && !!applicationId,
  });

  // 최종 데이터 결정 - 메모이제이션으로 안정화
  const finalData = useMemo(() => {
    let applicationData;
    let appLoading;
    let appError;

    if (isGuestMode) {
      applicationData = guestApplication;
      appLoading = false; // 비회원 데이터는 이미 로드됨
      appError = !guestApplication; // 비회원 데이터가 없으면 에러
    } else if (isApplicant) {
      applicationData = myApplicationData;
      appLoading = myAppLoading;
      appError = myAppError;
    } else {
      applicationData = ownerApplicationData;
      appLoading = ownerAppLoading;
      appError = ownerAppError;
    }

    return { applicationData, appLoading, appError };
  }, [
    isGuestMode,
    guestApplication,
    isApplicant,
    myApplicationData,
    myAppLoading,
    myAppError,
    ownerApplicationData,
    ownerAppLoading,
    ownerAppError,
  ]);

  const { applicationData, appLoading, appError } = finalData;

  // 디버깅용 로그 추가
  console.log('🔍 Debug Info:', {
    sessionLoading,
    albaLoading,
    appLoading,
    isGuestMode,
    isAuthenticated,
    isOwner,
    isApplicant,
    guestApplication: !!guestApplication,
    albaformData: !!albaformData,
    _hasHydrated,
  });

  // Zustand hydration이 완료되지 않은 경우 로딩 처리
  if (!_hasHydrated) {
    console.log('⏳ Zustand hydration 대기 중...');
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-gray-600">데이터를 복원하는 중...</p>
      </div>
    );
  }

  // 초기 렌더링 처리 (hydration 완료 후)
  const isInitialRender =
    !sessionLoading &&
    !albaLoading &&
    !appLoading &&
    !isGuestMode &&
    !isAuthenticated &&
    !isOwner &&
    !isApplicant;

  const isLoading =
    sessionLoading || albaLoading || appLoading || isInitialRender;

  console.log('⏰ Loading States:', {
    isInitialRender,
    isLoading,
    finalCondition:
      sessionLoading || albaLoading || appLoading || isInitialRender,
    _hasHydrated,
  });

  // 1. 로딩 처리
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 2. 에러 처리 (인증보다 먼저)
  if (albaError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">오류가 발생했습니다</h1>
        <p className="text-gray-600">알바 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 3. 인증 확인 (비회원 모드가 아닌 경우만)
  if (!isGuestMode && !isAuthenticated) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          로그인이 필요합니다
        </h1>
        <p className="text-gray-600">지원서를 확인하려면 로그인해주세요.</p>
      </div>
    );
  }

  // 4. 알바폼 데이터 확인
  if (!albaformData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          알바 정보를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600">요청하신 알바 정보가 존재하지 않습니다.</p>
        <PrimaryButton
          className="p-15"
          label="홈으로 돌아가기"
          type="button"
          variant="solid"
          onClick={() => router.push('/')}
        />
      </div>
    );
  }

  // 5. 지원서 관련 에러 처리
  if ((isApplicant || isGuestMode) && (appError || !applicationData)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          지원 내역이 없습니다
        </h1>
        <p className="text-gray-600">
          {isGuestMode
            ? '지원서 정보를 확인할 수 없습니다. 다시 시도해주세요.'
            : '아직 이 알바에 지원하지 않았습니다.'}
        </p>
        <PrimaryButton
          className="p-15"
          label="알바 상세로 돌아가기"
          type="button"
          variant="solid"
          onClick={() => router.push(`/alba/${formId}`)}
        />
      </div>
    );
  }

  // 6. 사장님인데 지원서 데이터가 없는 경우
  if (isOwner && !applicationData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          지원서를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600">요청하신 지원서가 존재하지 않습니다.</p>
      </div>
    );
  }

  // 7. 최종 안전성 체크
  if (!applicationData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          데이터를 불러올 수 없습니다
        </h1>
        <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  // 권한 체크: 사장님인데 본인 공고가 아닌 경우
  if (isOwner && Number(albaformData.ownerId) !== Number(user?.id)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">
          접근 권한이 없습니다
        </h1>
        <p className="text-gray-600">
          본인이 작성한 공고의 지원서만 확인할 수 있습니다.
        </p>
        <PrimaryButton
          className="p-15"
          label="내 공고 목록으로 돌아가기"
          type="button"
          variant="solid"
          onClick={() => router.push('/myalbalist')}
        />
      </div>
    );
  }

  // 권한 체크: 로그인된 지원자인데 본인 지원서가 아닌 경우 (비회원 모드는 제외)
  if (
    !isGuestMode &&
    isApplicant &&
    applicationData &&
    Number(applicationData.applicantId) !== Number(user?.id)
  ) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">
          접근 권한이 없습니다
        </h1>
        <p className="text-gray-600">본인의 지원서만 확인할 수 있습니다.</p>
        <PrimaryButton
          className="p-15"
          label="내 지원 목록으로 돌아가기"
          type="button"
          variant="solid"
          onClick={() => router.push('/myalbalist')}
        />
      </div>
    );
  }

  // 이미지 처리
  const images =
    albaformData.imageUrls?.length > 0
      ? albaformData.imageUrls
      : ['/images/list-default.png'];
  const carouselSlides: Slide[] = createSlidesFromUrls(images);

  // 8. 정상 렌더링
  return (
    <div className="mx-auto flex w-full max-w-375 min-w-320 flex-col gap-40 py-40 text-sm lg:max-w-7xl lg:gap-80 lg:text-lg">
      <ImageCarousel showCounter interval={4000} slides={carouselSlides} />

      <div className="space-y-40 lg:grid lg:grid-cols-2 lg:gap-150 lg:space-y-0">
        <div className="space-y-40">
          <AlbaDetail item={albaformData} />
          <AlbaDescription description={albaformData.description} />
        </div>
        <div>
          <ApplicationState
            createdAt={applicationData.createdAt}
            recruitmentEndDate={albaformData.recruitmentEndDate}
            status={applicationData.status}
          />
        </div>
      </div>

      <div className="border-4 border-line-100 dark:border-gray-800" />

      <ApplicationProfile data={applicationData} />

      {/* 비회원 모드일 때 추가 안내 */}
      {isGuestMode && (
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-700">
            비회원으로 지원서를 확인하고 있습니다. 회원가입 후 더 편리한
            서비스를 이용해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;