'use client';

import { useState } from 'react';

import PrimaryButton from '@/shared/components/common/button/PrimaryButton';
import CardPagination from '@/shared/components/common/pagination/CardPagination';
import Indicator from '@/shared/components/common/pagination/Indicator';
import Paginator from '@/shared/components/common/pagination/Paginator';

import RoundedButton from '../../../shared/components/common/button/RoundedButton';

const TestPage = () => {
  const [page, setPage] = useState(1);
  const nextCursor = 120; // 예시로 120일 사용 API연결 시 API 커서 값 사용
  const itemsPerPage = 6; // 페이지당 보여줄 아이템의 수
  const totalPages = Math.ceil(nextCursor / itemsPerPage); // 전체 페이지 수 계산
  return (
    <div className="flex flex-col items-center justify-center gap-20">
      <h1>Test Page</h1>
      <Paginator
        currentPage={page}
        totalPages={totalPages}
        onChange={setPage}
      />
      {/* CardPagination, Indicator - 임시로 커서값 사용, 실 사용에선 이미지 총 개수로 대체 */}
      <CardPagination currentPage={page} totalPage={totalPages} />
      <Indicator current={page - 1} total={totalPages} />

      {/* Solid Button, Outline Button 구현 */}
      <PrimaryButton
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        disabled={false}
        label="solid"
        type="button"
        variant="solid"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        disabled={false}
        label="outline"
        type="button"
        variant="outline"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        label="cancelSolid"
        type="button"
        variant="cancelSolid"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        label="cancelOutline"
        type="button"
        variant="cancelOutline"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="solid"
        type="button"
        variant="solid"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="outline"
        type="button"
        variant="outline"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        className="w-full max-w-640 py-20 text-lg text-gray-300 lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="cancelSolid"
        type="button"
        variant="cancelSolid"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="cancelOutline"
        type="button"
        variant="cancelOutline"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        responsiveLabel
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="cancelSolid"
        type="button"
        variant="cancelSolid"
        onClick={() => setPage(prev => prev + 1)}
      />
      <PrimaryButton
        disabled
        responsiveLabel
        className="w-full max-w-640 py-20 text-lg lg:text-xl"
        iconSrc="/icons/trash-can.svg"
        label="cancelOutline"
        type="button"
        variant="cancelOutline"
        onClick={() => setPage(prev => prev + 1)}
      />

      <RoundedButton
        buttonClassName="w-full max-w-640 py-20 text-lg lg:text-xl bg-mint-300 hover:bg-mint-400 text-gray-100"
        label="Rounded Button"
        type="button"
        onClick={() => setPage(prev => prev + 1)}
      />

      <RoundedButton
        buttonClassName="w-full max-w-640 py-20 text-lg lg:text-xl bg-mint-300 hover:bg-mint-400 text-gray-100"
        iconClassName="w-24 h-24"
        iconSrc="/icons/trash-can.svg"
        label="Rounded Button"
        type="button"
        onClick={() => setPage(prev => prev + 1)}
      />
    </div>
  );
};

export default TestPage;
