/**
 * ButtonBase 컴포넌트
 *
 * ✅ 용도:
 * - HTML `<button>` 요소를 감싸는 기본 버튼 컴포넌트입니다.
 * - 실제 렌더링 역할을 하며, 상위 컴포넌트(`PrimaryButton` 등)에서 스타일, 로직 등을 제어한 뒤 이 컴포넌트를 통해 출력합니다.
 *
 * ✅ 특징:
 * - `children`을 받아 버튼 내부에 내용을 표시합니다.
 * - `className`으로 Tailwind 등 CSS 클래스를 외부에서 주입하여 유연하게 스타일 적용이 가능합니다.
 * - `...props`를 통해 `onClick`, `disabled`, `type` 등 HTML `<button>` 속성을 그대로 전달할 수 있습니다.
 *
 * ✅ 사용 예시:
 * ```tsx
 * <ButtonBase
 *   className="px-4 py-2 bg-blue-500 text-white"
 *   type="submit"
 *   onClick={() => console.log('클릭')}
 * >
 *   제출
 * </ButtonBase>
 * ```
 *
 * @param children - 버튼 내부에 표시될 React 요소 (텍스트, 아이콘 등)
 * @param className - 외부에서 전달된 Tailwind 또는 사용자 정의 클래스
 * @param props - HTML 버튼 속성 전체 (type, onClick, disabled 등)
 */

interface ButtonBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

// 버튼의 렌더링 담당
const ButtonBase = ({ children, className, ...props }: ButtonBaseProps) => {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default ButtonBase;
