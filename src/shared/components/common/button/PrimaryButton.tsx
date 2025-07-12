import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import ButtonBase from './ButtonBase';

/**
 * PrimaryButton 컴포넌트
 *
 * ✅ 용도:
 * - 프로젝트 전반에서 일관된 스타일의 기본 버튼 역할을 합니다.
 * - variant와 size, icon 등을 조합하여 다양한 형태의 버튼으로 사용할 수 있습니다.
 *
 * ✅ 특징:
 * - `variant`: 버튼의 스타일을 지정합니다. (색상, 테두리 등)
 * - `iconSrc`: 이미지 아이콘을 버튼 앞에 표시할 수 있습니다.
 * - `responsiveLabel`: 작은 화면에서는 텍스트를 숨기고 아이콘만 보이도록 처리할 수 있습니다.
 * - Tailwind 클래스를 props로 받아 사이즈와 여백 등 유연하게 조절할 수 있습니다.
 *
 * ✅ 사용 예시:
 * @example
 * ```tsx
 * // 텍스트만 있는 버튼
 * <PrimaryButton
 *   variant="solid"
 *   className="px-4 py-2 text-sm"
 *   label="확인"
 *   type="button"
 *   onClick={() => alert('클릭됨')}
 * />
 *
 * // 아이콘과 텍스트가 함께 있는 버튼
 * <PrimaryButton
 *   variant="outline"
 *   className="px-4 py-2 text-sm"
 *   label="삭제"
 *   iconSrc="/icons/trash.svg"
 *   type="button"
 * />
 *
 * // 반응형으로 텍스트를 숨기는 버튼 (모바일에선 아이콘만 표시)
 * <PrimaryButton
 *   variant="solid"
 *   className="p-2"
 *   iconSrc="/icons/menu.svg"
 *   responsiveLabel={true}
 *   type="button"
 * />
 * ```
 *
 * @param variant - 버튼의 스타일 타입 (solid, outline, cancelSolid, cancelOutline)
 * @param className - Tailwind 클래스 문자열로 크기 및 텍스트 사이즈, 색상 등  추가 스타일 추가 조정
 * @param label - 버튼에 표시될 텍스트 (생략 가능)
 * @param disabled - 버튼 비활성화 여부 (true일 경우 클릭 불가)
 * @param type - HTML 버튼 타입 ('button' | 'submit' | 'reset')
 * @param iconSrc - 버튼 앞에 표시할 이미지 아이콘 경로 (Next.js Image 사용)
 * @param responsiveLabel - true일 경우 버튼 텍스트를 숨기고 아이콘만 표시 (모바일 대응)
 * @param onClick - 클릭 이벤트 핸들러 함수
 */

// 버튼의 스타일 담당
interface ButtonProps {
  variant: 'solid' | 'outline' | 'cancelSolid' | 'cancelOutline'; // Variant로 버튼 스타일 구분 기본값은 'solid'
  className: string; // className로 버튼 크기 및 텍스트 사이즈, 색상 등  추가 스타일 추가 가능
  label?: string; // 버튼에 표시될 텍스트
  disabled?: boolean; // disabled 상태 여부
  type: 'button' | 'submit' | 'reset';
  iconSrc?: string; // 아이콘 이미지 경로
  responsiveLabel?: boolean; // 반응형 레이블 여부
  onClick?: () => void;
}

const PrimaryButton = ({
  variant = 'solid',
  className,
  label,
  disabled = false,
  type,
  iconSrc,
  responsiveLabel = false,
  onClick,
}: ButtonProps) => {
  // 공통 base 스타일 정의
  const baseStyles =
    'rounded-lg font-semibold transition-colors duration-200 ease-in-out flex items-center justify-center text-center gap-1';

  // variant별 스타일 정의
  const solidStyles = 'bg-mint-300 hover:bg-mint-400 text-gray-50';
  const outlineStyles =
    'border border-mint-300 hover:border-mint-400 text-mint-300 hover:text-mint-400 bg-transparent';
  const cancelSolidStyles = 'bg-gray-100 text-gray-50';
  const cancelOutlineStyles =
    'border border-gray-100 text-gray-100  bg-transparent';

  // variant에 따라 스타일 매핑
  const buttonStyle = {
    solid: solidStyles,
    outline: outlineStyles,
    cancelSolid: cancelSolidStyles,
    cancelOutline: cancelOutlineStyles,
  };

  // disabled 상태에 따라 커서 스타일 변경
  const disabledStyles = disabled ? '' : 'cursor-pointer';

  // 최종으로 적용될 클래스 병합
  const finalStyles = twMerge(
    baseStyles,
    buttonStyle[variant],
    className,
    disabledStyles
  );

  // responsiveLabel 여부에 따라 숨김 처리
  const labelStyles = responsiveLabel ? 'hidden' : 'inline-flex';

  return (
    <ButtonBase
      className={finalStyles}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {/* iconSrc 여부에 따라 아이콘 표시 */}
      {iconSrc && (
        <span className="relative inline-flex h-24 w-24 items-center justify-center lg:h-36 lg:w-36">
          <Image fill alt="icon" sizes="36px" src={iconSrc} />
        </span>
      )}
      <span className={labelStyles}>{label}</span>
    </ButtonBase>
  );
};

export default PrimaryButton;
