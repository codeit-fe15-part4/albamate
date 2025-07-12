'use client';
import Image from 'next/image';
import { useState } from 'react';

import PrivateWrapper from '@/shared/components/common/PrivateWrapper';
import Profile from '@/shared/components/common/profile/Profile';
import ProfileEdit from '@/shared/components/common/profile/ProfileEdit';

const TaesikTest = () => {
  const [isp, setIsp] = useState(true);
  return (
    <div className="bg-background-300">
      <div>태식 테스트 페이지</div>
      <Profile imageUrl="https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/Albaform/user/415/1752142046479/15-2_5882_1752141901515.jpeg" />
      <PrivateWrapper isPrivate={isp}>
        <div className="flex flex-col">
          <div className="relative h-208 w-327">
            <Image
              fill
              alt="카드 이미지"
              className="rounded-2xl"
              sizes="327px"
              src="https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/Albaform/user/415/1752142046479/15-2_5882_1752141901515.jpeg"
            />
          </div>
          <div className="mt-24 flex gap-4 text-sm">
            <span className="rounded-xs bg-mint-50 px-4 text-mint-100">
              공개
            </span>
            <span className="rounded-xs bg-mint-50 px-4 text-mint-100">
              모집 중
            </span>
            <span className="text-gray-200">2024.05.22 ~ 2024.05.31</span>
          </div>
          <p className="font-bold">
            코드잇 스터디카페 관리 (주말 오전) 모집합니다 서울 종로구 용산구
            서대문
          </p>
        </div>
      </PrivateWrapper>
      <button className="block" onClick={() => setIsp(prev => !prev)}>
        변환
      </button>
      <Profile className="size-26 border-none lg:size-26" sizes="26px" />
      <Profile
        className="size-26 border-none lg:size-26"
        imageUrl="https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/Albaform/user/415/1752142046479/15-2_5882_1752141901515.jpeg"
        sizes="26px"
      />
      <ProfileEdit />
      <ProfileEdit imageUrl="https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/Albaform/user/415/1752142046479/15-2_5882_1752141901515.jpeg" />
    </div>
  );
};
export default TaesikTest;
