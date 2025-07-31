'use client';

import { getPublicLabel, getStatusLabel } from '@common/chip/label';
import AlbaDropdown from '@common/list/AlbaDropdown';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays } from 'date-fns';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { OwnerMyAlbaItem } from '@/features/myalbalist/types/myalbalist';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/cn';
import { AlbaItem } from '@/shared/types/alba';
import { formatDateLong } from '@/shared/utils/format';

export interface DropdownOption {
  label: string;
  onClick: () => void;
}

interface Props {
  item: AlbaItem | OwnerMyAlbaItem;
  onClick: () => void;
  dropdownOptions: DropdownOption[];
  isScrapped?: boolean;
}

const AlbaCardItem = ({
  item,
  onClick,
  dropdownOptions,
  isScrapped,
}: Props) => {
  const queryClient = useQueryClient();
  const {
    title,
    isPublic,
    recruitmentStartDate,
    recruitmentEndDate,
    imageUrls,
    applyCount,
  } = item;

  const [imgSrc, setImgSrc] = useState(imageUrls?.[0] || '/icons/user.svg');
  const [open, setOpen] = useState(false);
  
  // 로컬 상태로 스크랩 정보 관리 (캐시와 동기화)
  const [localScrapState, setLocalScrapState] = useState({
    isScrapped: isScrapped ?? ('isScrapped' in item ? item.isScrapped : false),
    scrapCount: item.scrapCount ?? 0,
  });

  // 캐시에서 실시간으로 스크랩 상태와 카운트를 가져오는 함수
  const getCurrentScrapState = () => {
    // 1. 캐시된 상세 데이터 우선 확인
    const albaDetailCache = queryClient.getQueryData(['albaDetail', item.id]) as any;
    if (albaDetailCache && typeof albaDetailCache.isScrapped === 'boolean') {
      return {
        isScrapped: albaDetailCache.isScrapped,
        scrapCount: albaDetailCache.scrapCount ?? 0,
      };
    }

    // 2. 캐시된 알바 리스트에서 해당 아이템 찾기
    const albaListCache = queryClient.getQueryData(['albaList']) as
      | { pages: { data: any[] }[] }
      | undefined;

    if (albaListCache?.pages) {
      for (const page of albaListCache.pages) {
        const cachedItem = page.data.find((alba: any) => alba.id === item.id);
        if (cachedItem && typeof cachedItem.isScrapped === 'boolean') {
          return {
            isScrapped: cachedItem.isScrapped,
            scrapCount: cachedItem.scrapCount ?? 0,
          };
        }
      }
    }

    // 3. 기본값 반환
    return localScrapState;
  };

  // 캐시 변경을 실시간으로 감지하여 로컬 상태 업데이트
  useEffect(() => {
    const updateLocalState = () => {
      const currentState = getCurrentScrapState();
      setLocalScrapState(prev => {
        // 상태가 실제로 변경된 경우에만 업데이트
        if (prev.isScrapped !== currentState.isScrapped || 
            prev.scrapCount !== currentState.scrapCount) {
          return currentState;
        }
        return prev;
      });
    };

    // 초기 로드 시 캐시 상태로 동기화
    updateLocalState();

    // 캐시 변경 감지
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      const queryKey = event?.query?.queryKey;
      if (
        (queryKey?.[0] === 'albaList') ||
        (queryKey?.[0] === 'albaDetail' && queryKey?.[1] === item.id)
      ) {
        // 약간의 지연을 두어 캐시 업데이트가 완료된 후 상태 동기화
        setTimeout(updateLocalState, 50);
      }
    });

    return unsubscribe;
  }, [item.id, queryClient]);

  // props가 변경될 때도 상태 업데이트
  useEffect(() => {
    const newState = {
      isScrapped: isScrapped ?? ('isScrapped' in item ? item.isScrapped : false),
      scrapCount: item.scrapCount ?? 0,
    };
    
    // 캐시 데이터가 없는 경우에만 props로 업데이트
    const cachedState = getCurrentScrapState();
    if (cachedState.isScrapped === localScrapState.isScrapped && 
        cachedState.scrapCount === localScrapState.scrapCount) {
      setLocalScrapState(newState);
    }
  }, [isScrapped, item.scrapCount, item.isScrapped]);

  useClickOutside(dropdownRef, () => setOpen(false));

  const dDay = differenceInCalendarDays(recruitmentEndDate, new Date());
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 마감일에 따른 클래스 설정
  const dDayClass = cn(
    dDay < 0 && 'text-gray-400',
    dDay >= 0 && dDay <= 3 && 'text-error brightness-150 font-semibold',
    dDay > 3 && 'text-gray-600 hover:text-gray-900'
  );

  // 알바 카드의 통계 정보
  const stats = [
    {
      label: '지원자',
      value: `${applyCount}명`,
    },
    {
      label: '스크랩',
      value: `${localScrapState.scrapCount}명`,
    },
    {
      label: dDay < 0 ? '마감 완료' : `마감 D-${dDay}`,
      isDeadline: true,
    },
  ];

  return (
    <div
      className="Border-Card BG-Card cursor-pointer flex-col gap-8 rounded-2xl p-24 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="rounded-2lg relative flex aspect-[1/0.637] w-full justify-end overflow-hidden">
        <Image
          fill
          alt="알바 이미지"
          className="rounded-lg object-cover"
          src={imgSrc}
          onError={() => setImgSrc('/images/list-default.png')}
        />
      </div>

      <div className="relative mt-12 flex items-center gap-8 text-sm">
        {getPublicLabel(isPublic)}
        {getStatusLabel(recruitmentEndDate)}

        <div ref={dropdownRef} className="relative ml-auto flex-shrink-0">
          <Image
            alt="드롭다운 아이콘"
            className="cursor-pointer"
            height={24}
            src="/icons/kebab-menu.svg"
            width={24}
            onClick={e => {
              e.stopPropagation();
              setOpen(prev => !prev);
            }}
          />
          {open && <AlbaDropdown options={dropdownOptions} />}
        </div>
      </div>

      <span className="Text-gray mt-8 block text-xs font-normal whitespace-nowrap lg:text-sm">
        {formatDateLong(recruitmentStartDate)} ~{' '}
        {formatDateLong(recruitmentEndDate)}
      </span>

      <h3 className="Text-black mt-12 ml-4 flex items-center gap-4 text-2lg font-semibold">
        {title}
        {localScrapState.isScrapped ? (
          <Image
            alt="스크랩 완료"
            height={20}
            src="/icons/bookmark-mint.svg"
            width={20}
          />
        ) : (
          <Image
            alt="스크랩 안됨"
            height={20}
            src="/icons/bookmark-gray.svg"
            width={20}
          />
        )}
      </h3>

      <div className="mt-20 flex h-40 w-full justify-center rounded-lg bg-gray-25 text-xs text-gray-600 lg:h-45 dark:bg-gray-800">
        {stats.map((stat, idx) => (
          <span
            key={stat.label}
            className={cn(
              'relative flex flex-1 items-center justify-center whitespace-nowrap dark:text-gray-100',
              idx !== stats.length - 1 &&
                'after:absolute after:top-1/2 after:right-0 after:h-14 after:w-1 after:-translate-y-1/2 after:bg-gray-100',
              stat.isDeadline && dDayClass
            )}
          >
            {!stat.isDeadline ? (
              <>
                {stat.label}{' '}
                <span className="hover:brightness-150">{stat.value}</span>
              </>
            ) : (
              stat.label
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AlbaCardItem;