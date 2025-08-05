import { forwardRef } from 'react';
/**
 * DayCheckbox 컴포넌트
 *
 * 요일 선택을 위한 체크박스 UI 컴포넌트입니다.
 * 접근성(aria-label, aria-describedby) 및 키보드 조작(Enter, Space) 지원을 포함합니다.
 *
 * @author sumin
 * @date 2025-07-12
 *
 * @component
 * @param {Object} props - DayCheckbox 컴포넌트의 props
 * @param {string} props.day - 표시할 요일 텍스트
 * @param {string} props.name - input name 속성
 * @param {string} props.value - input value 속성
 * @param {boolean} [props.checked] - 체크 여부 (제어 컴포넌트)
 * @param {(checked: boolean, value: string) => void} [props.onChange] - 체크 상태 변경 핸들러
 * @param {boolean} [props.disabled] - 비활성화 여부
 * @param {boolean} [props.required] - 필수 입력 여부
 * @param {string} [props['aria-label']] - 접근성 라벨
 * @param {React.Ref<HTMLInputElement>} ref - input ref
 * @returns {JSX.Element} 요일 체크박스 리스트 아이템
 */

interface DayCheckboxProps {
  day: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (checked: boolean, value: string) => void;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
  isInvalid?: boolean;
}

const DayCheckbox = forwardRef<HTMLInputElement, DayCheckboxProps>(
  (
    {
      day,
      name,
      value,
      checked = false,
      onChange,
      disabled = false,
      required = false,
      ariaLabel: ariaLabel,
      isInvalid,
      ...props
    },
    ref
  ) => {
    const inputId = `${name}-${value}`;
    const descriptionId = `${inputId}-description`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked, value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          const newChecked = !checked;
          onChange?.(newChecked, value);
        }
      }
    };

    return (
      <li>
        <input
          ref={ref}
          aria-label={ariaLabel || `${day} 선택`}
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          id={inputId}
          name={name}
          required={required}
          type="checkbox"
          value={value}
          onChange={handleChange}
          {...props}
        />
        <label
          aria-checked={checked}
          aria-disabled={disabled}
          className={`flex h-48 w-38 cursor-pointer items-center justify-center rounded-xl bg-background-200 text-lg text-gray-500 transition-colors focus-within:ring-2 focus-within:ring-mint-300 focus-within:ring-offset-2 lg:h-64 lg:w-50 lg:rounded-2xl lg:text-xl dark:bg-gray-800 dark:text-gray-100 dark:caret-mint-350 dark:outline-mint-350 dark:hover:bg-gray-700 ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-background-300'
          } ${isInvalid && 'border border-error caret-error hover:border-error focus:border-0 dark:caret-error'} peer-checked:bg-mint-300 peer-checked:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:dark:bg-mint-400`}
          htmlFor={inputId}
          id={descriptionId}
          role="checkbox"
          tabIndex={0}
          onKeyDown={handleInputKeyDown}
        >
          {day}
        </label>
      </li>
    );
  }
);

DayCheckbox.displayName = 'DayCheckbox';

export default DayCheckbox;
