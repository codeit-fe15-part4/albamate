import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface PrivateWrapperProps {
  /**
   * 래퍼로 감싸져 비공개 처리될 내용 (자식 React 요소)입니다.
   */
  children: React.ReactNode;
  /**
   * 컴포넌트의 비공개 상태를 결정합니다.
   * `true`이면 비공개 상태입니다.
   */
  isPrivate: boolean;
  /**
   * 래퍼 컴포넌트의 최상위 `div`에 추가로 적용할 클래스입니다.
   */
  className?: string;
  /**
   * 표시될 메시지입니다.
   * 기본값은 `'비공개 처리된 알바폼이에요'` 입니다.
   */
  content?: string;
}

/**
 * PrivateWrapper 컴포넌트는 전달된 `children` 콘텐츠를 비공개 상태로 표시합니다,
 *
 * `isPrivate` prop이 `true`일 경우, 자물쇠 아이콘과 함께 설정된 메시지를 포함하는
 * 반투명 오버레이가 콘텐츠 위에 덮여 사용자 클릭을 방지합니다.
 * `false`일 경우 children 요소만 반환 됩니다.
 *
 * @example
 * // 기본 메시지로 비공개 처리된 카드 렌더링
 * <PrivateWrapper isPrivate={true} className="w-96 h-64">
 * <div>여기에 비공개 처리될 카드 내용이 들어갑니다.</div>
 * </PrivateWrapper>
 *
 */
const PrivateWrapper = ({
  children,
  isPrivate,
  className,
  content = '비공개 처리된 알바폼이에요',
}: PrivateWrapperProps) => {
  return isPrivate ? (
    <div
      className={twMerge(
        'relative inline-block overflow-hidden rounded-xl',
        className
      )}
    >
      {children}
      <div className="absolute inset-0 flex cursor-not-allowed flex-col items-center justify-center gap-16 rounded-xl border border-gray-200 bg-[#3e3e3e]/60 backdrop-blur-md lg:gap-24 lg:rounded-2xl lg:border-2">
        <Image
          alt="비공개"
          className="size-80 lg:size-120"
          height={120}
          src="/icons/private.svg"
          width={120}
        />
        <p className="text-md font-medium text-gray-50 lg:text-2lg">
          {content}
        </p>
      </div>
    </div>
  ) : (
    children
  );
};
export default PrivateWrapper;
