import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import ButtonBase from './ButtonBase';

/**
 * RoundedButton 컴포넌트
 *
 * ✅ 용도:
 * - 아이콘과 텍스트가 함께 있는 **둥근 스타일(rounded-full)**의 버튼을 만들기 위해 사용됩니다.
 * - Tailwind 클래스와 props를 통해 버튼과 아이콘 스타일을 커스터마이징할 수 있습니다.
 *
 * ✅ 특징:
 * - `rounded-full` 스타일을 기본으로 적용하여 pill-shaped 버튼 형태로 렌더링됩니다.
 * - `iconSrc`를 전달하면 Next.js의 `<Image>`를 통해 아이콘이 함께 표시됩니다.
 * - `buttonClassName`, `iconClassName`을 통해 스타일 확장이 가능합니다.
 * - 내부적으로 `ButtonBase`를 사용하여 HTML `<button>` 속성을 모두 지원합니다.
 *
 * ✅ 사용 예시:
 * ```tsx
 * <RoundedButton
 *   label="구독하기"
 *   type="button"
 *   iconSrc="/icons/bell.svg"
 *   buttonClassName="bg-blue-500 text-white px-4 py-2"
 *   iconClassName="w-4 h-4 mr-2"
 *   onClick={() => alert('알림')}
 * />
 * ```
 *
 * @param label - 버튼에 표시할 텍스트
 * @param buttonClassName - 버튼 스타일을 위한 Tailwind 클래스 문자열
 * @param iconSrc - 아이콘 이미지 경로 (Next.js Image 사용) (선택)
 * @param iconClassName - 아이콘 스타일을 위한 클래스 문자열 (선택)
 * @param type - HTML 버튼 타입 ('button' | 'submit' | 'reset')
 * @param onClick - 버튼 클릭 시 호출될 이벤트 핸들러
 */

interface RoundedButtonProps {
  label: string;
  buttonClassName: string;
  disabled?: boolean;
  iconSrc?: string;
  iconClassName?: string;
  type: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const RoundedButton = ({
  label,
  buttonClassName,
  disabled = false,
  iconSrc,
  iconClassName,
  type,
  onClick,
}: RoundedButtonProps) => {
  const baseStyles =
    'rounded-full cursor-pointer flex items-center justify-center';

  const buttonFinalStyles = twMerge(baseStyles, buttonClassName);

  const iconBaseStyles = 'relative';
  const iconFinalStyles = twMerge(iconBaseStyles, iconClassName);

  return (
    <ButtonBase
      className={buttonFinalStyles}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {iconSrc && (
        <span className={iconFinalStyles}>
          <Image fill alt="icon" src={iconSrc} />
        </span>
      )}
      {label && <span>{label}</span>}
    </ButtonBase>
  );
};

export default RoundedButton;
