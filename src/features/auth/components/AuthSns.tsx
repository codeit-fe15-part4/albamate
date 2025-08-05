'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const AuthSns = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'applicant';

  const handleKakaoSignIn = () => {
    const callbackUrl = `${window.location.origin}/signin?type=${userType}`;

    signIn('kakao', {
      callbackUrl,
      redirect: true,
    });
  };

  return (
    <div>
      <h3 className="font-regular relative flex items-center justify-center gap-12 text-md text-gray-300 before:block before:h-1 before:flex-1 before:bg-line-100 after:block after:h-1 after:flex-1 after:bg-line-100 after:content-[''] lg:gap-30 lg:text-xl">
        SNS 계정으로 로그인하기
      </h3>
      <div className="mt-24 flex items-center justify-center gap-16 lg:mt-40">
        <button
          className="flex aspect-square w-48 items-center justify-center rounded-full border border-line-100 transition-colors duration-200 hover:bg-line-100 lg:w-72 dark:border-gray-300 dark:bg-gray-300 dark:hover:bg-gray-500"
          type="button"
          onClick={handleKakaoSignIn}
        >
          <Image
            alt="kakao"
            className="h-18 w-18 lg:h-27 lg:w-27"
            height={27}
            src="/logos/kakao.svg"
            width={27}
          />
        </button>
      </div>
    </div>
  );
};

export default AuthSns;
