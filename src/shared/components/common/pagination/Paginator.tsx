import Image from 'next/image';

import useViewport from '@/shared/hooks/useViewport';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Paginator = ({ currentPage, totalPages, onChange }: PaginatorProps) => {
  const { isTablet, isMobile } = useViewport(); // 현재 화면 너비를 가져오는 훅 사용
  const visiblePages = isTablet || isMobile ? 3 : 5; // 769px 이하는 3개, 그 이상은 5개 페이지 버튼 표시

  const renderPageNumbers = () => {
    // 페이지 번호 렌더링 함수
    const pages: (string | number)[] = [];

    const createRange = (start: number, end: number) => {
      // 페이지 번호 범위를 생성하는 함수
      const range: number[] = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      return range;
    };

    if (totalPages <= visiblePages) {
      // 전체 페이지 수가 적으면 모두 표시
      pages.push(...createRange(1, totalPages));
    } else {
      const showLeft = currentPage <= visiblePages - 1;
      const showRight = currentPage >= totalPages - (visiblePages - 2);
      if (showLeft) {
        // 앞쪽 페이지 구간(현재 페이지가 왼쪽에 가까운 경우)
        pages.push(...createRange(1, visiblePages));
        pages.push('...', totalPages);
      } else if (showRight) {
        // 뒤쪽 페이지 구간(현재 페이지가 오른쪽에 가까운 경우)
        pages.push(1, '...');
        pages.push(...createRange(totalPages - visiblePages + 1, totalPages));
      } else {
        // 중간 페이지 구간(현재 페이지가 중간에 있는 경우)
        const sidePages = Math.floor((visiblePages - 2) / 2); // 양쪽에 표시할 페이지 수
        pages.push(1, '...');
        pages.push(
          ...createRange(currentPage - sidePages, currentPage + sidePages)
        );
        pages.push('...', totalPages);
      }
    }

    return pages.map((page, index) => {
      const pageClassName =
        currentPage === page
          ? 'text-black-400 font-semibold'
          : 'text-gray-200 font-medium';
      return page === '...' ? (
        <div
          key={`ellipsis-${index}`} // ellipsis의 경우 변경 가능성이 낮다고 생각하여 index 사용
          className="pb-1/3 flex h-34 w-34 items-center justify-center rounded-md bg-background-200 text-md font-medium text-gray-200 lg:h-48 lg:w-48 lg:rounded-lg lg:text-2lg"
        >
          <span className="h-fit pb-9 leading-none">...</span>
        </div>
      ) : (
        <button
          key={`page-${page}`}
          className={`flex h-34 w-34 cursor-pointer items-center justify-center rounded-md bg-background-200 text-center text-md lg:h-48 lg:w-48 lg:rounded-lg lg:text-2lg ${pageClassName}`}
          disabled={currentPage === page}
          onClick={() => onChange(Number(page))}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        className="h-34 w-34 cursor-pointer rounded-md bg-background-200 p-9 disabled:cursor-default lg:h-48 lg:w-48 lg:rounded-lg lg:p-12"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        <div className="relative h-full w-full">
          <Image
            fill
            alt="previous page"
            sizes="(min-width: 1024px) 24px, 16px"
            src={
              currentPage === 1
                ? '/icons/chevron-left.svg'
                : '/icons/chevron-left-black.svg'
            }
          />
        </div>
      </button>
      {renderPageNumbers()}
      <button
        className="h-34 w-34 cursor-pointer rounded-md bg-background-200 p-9 disabled:cursor-default lg:h-48 lg:w-48 lg:rounded-lg lg:p-12"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        <div className="relative h-full w-full">
          <Image
            fill
            alt="next page"
            sizes="(min-width: 1024px) 24px, 16px"
            src={
              currentPage === totalPages
                ? '/icons/chevron-right.svg'
                : '/icons/chevron-right-black.svg'
            }
          />
        </div>
      </button>
    </div>
  );
};

export default Paginator;
