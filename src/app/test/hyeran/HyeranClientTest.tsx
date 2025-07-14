'use client';

import Image from 'next/image';
import { useState } from 'react';

import Checkbox from '@/shared/components/common/button/Checkbox';
import FloatingButton from '@/shared/components/common/button/FloatingButton';
import FloatingButtonContainer from '@/shared/components/common/button/FloatingButtonContainer';
import PrimaryButton from '@/shared/components/common/button/PrimaryButton';
import RadioButton, {
  RadioOption,
} from '@/shared/components/common/button/RadioButton';
import Modal from '@/shared/components/common/modal/Modal';
import ModalManager from '@/shared/components/common/modal/ModalManager';
import ThemeToggle from '@/shared/components/ThemeToggle';
import useModal from '@/shared/hooks/useModal';

const RADIO_OPTIONS: RadioOption[] = [
  { value: 'REJECTED', label: '거절' },
  { value: 'INTERVIEW_PENDING', label: '면접대기' },
  { value: 'INTERVIEW_COMPLETED', label: '면접 완료' },
  { value: 'HIRED', label: '채용 완료', disabled: true },
];

const HyeranClientTest = () => {
  // 라디오 버튼 상태
  const [selected, setSelected] = useState('');

  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [checked4, setChecked4] = useState(true);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const { isOpen, content, openModal, closeModal } = useModal();

  const handleBookmarkToggle = () => {
    const newBookmarkState = !isBookmarked;
    if (isBookmarked) {
      // 북마크 제거 API 호출 추후 구현
    } else {
      // 북마크 추가 API 호출 추후 구현
    }
    setIsBookmarked(newBookmarkState);
  };

  // 두 버튼 + 가로
  const showConfirmModal = () => {
    openModal(
      <div className="w-375 p-24 lg:w-720 lg:px-40 lg:py-32">
        <Modal.Header>
          <div className="text-2lg lg:text-3xl">사장님 정보 관리</div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="이름을 입력하세요"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="이메일을 입력하세요"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                메모
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <PrimaryButton
            className="w-full max-w-640 py-20 text-lg lg:text-xl"
            label="취소"
            type="button"
            variant="cancelOutline"
            onClick={closeModal}
          />
          <PrimaryButton
            className="w-full max-w-640 py-20 text-lg lg:text-xl"
            label="수정하기"
            type="button"
            variant="solid"
            onClick={() => {
              alert('수정되었습니다!');
              closeModal();
            }}
          />
        </Modal.Footer>
      </div>
    );
  };

  // 두 버튼 + 세로
  const showDeleteModal = () => {
    openModal(
      <div className="w-360 px-24 pt-24 pb-4">
        <Modal.Body className="justify-items-center">
          <Image alt="info_icon" height={40} src="/icons/info.svg" width={40} />
          <h3>알바를 삭제할까요?</h3>
        </Modal.Body>
        <Modal.Footer direction="vertical">
          <PrimaryButton
            className="w-full max-w-640 py-20 text-lg lg:text-xl"
            disabled={false}
            label="삭제하기"
            type="button"
            variant="solid"
            onClick={() => {
              alert('삭제되었습니다!');
              closeModal();
            }}
          />
          <PrimaryButton
            className="w-full max-w-640 py-20 text-lg text-mint-300 lg:text-xl"
            label="다음에 할게요"
            type="button"
            variant="cancelOutline"
            onClick={closeModal}
          />
        </Modal.Footer>
      </div>
    );
  };

  const showFormModal = () => {
    openModal(
      <div className="w-375 p-24 lg:w-440 lg:px-40 lg:py-32">
        <Modal.Header showCloseButton className="justify-start">
          <div className="text-3xl">내 지원 내역</div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="이름을 입력하세요"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="이메일을 입력하세요"
                type="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                메모
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <PrimaryButton
            className="w-full max-w-640 py-20 text-lg lg:text-xl"
            label="지원 내역 상세보기"
            type="button"
            variant="solid"
            onClick={() => {
              closeModal();
            }}
          />
        </Modal.Footer>
      </div>
    );
  };

  const showAlertModal = () => {
    openModal(
      <div className="w-360 px-24 pt-32 pb-24">
        <Modal.Header showCloseButton>
          <div className="w-full text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Image
                alt="info_icon"
                height={100}
                src="/icons/info.svg"
                width={100}
              />
            </div>
            모집 마감
          </div>
        </Modal.Header>
        <Modal.Body className="justify-items-center">
          모집이 종료된 알바폼입니다.
        </Modal.Body>
        <Modal.Footer>
          <PrimaryButton
            className="w-full max-w-360 py-20 text-lg lg:text-xl"
            disabled={false}
            label="홈으로 가기"
            type="button"
            variant="solid"
            onClick={() => {
              closeModal();
            }}
          />
        </Modal.Footer>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-20">
      <ThemeToggle />
      <section>
        <h1>라디오 버튼 컴포넌트</h1>
        <RadioButton
          legend="현재 진행상태를 알려주세요."
          name="applicationStatus"
          options={RADIO_OPTIONS}
          value={selected}
          onChange={setSelected}
        />
      </section>
      <section>
        <h1>체크박스 컴포넌트</h1>
        <Checkbox
          checked={checked1}
          id="test1"
          label="첫 번째 옵션"
          onChange={setChecked1}
        />
        <Checkbox
          checked={checked2}
          id="test2"
          label="두 번째 옵션 (기본 선택)"
          onChange={setChecked2}
        />
        <Checkbox
          disabled
          checked={checked3}
          id="test3"
          label="세 번째 옵션"
          onChange={setChecked3}
        />
        <Checkbox
          disabled
          checked={checked4}
          id="test4"
          label="네 번째 옵션"
          onChange={setChecked4}
        />
      </section>
      <section>
        <h1>FloatingButton</h1>
        <FloatingButton href="/forms/create" text="폼 만들기" type="addForm" />
        <FloatingButton href="/albatalk/create" type="addAlbatalk" />
        <FloatingButton
          isBookmarked={isBookmarked}
          type="bookmark"
          onClick={handleBookmarkToggle}
        />
        <FloatingButton type="share" />
        <FloatingButtonContainer position="right-center">
          <FloatingButton
            isBookmarked={isBookmarked}
            type="bookmark"
            onClick={handleBookmarkToggle}
          />
          <FloatingButton type="share" />
        </FloatingButtonContainer>
        <FloatingButtonContainer>
          <FloatingButton
            href="/forms/create"
            text="폼 만들기"
            type="addForm"
          />
        </FloatingButtonContainer>
      </section>
      <section>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi
          nesciunt, voluptas quae itaque aspernatur ullam reiciendis
          necessitatibus a sunt repellendus illum quis dolor corporis ex, in
          exercitationem incidunt, facere porro! Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Animi nesciunt, voluptas quae itaque
          aspernatur ullam reiciendis necessitatibus a sunt repellendus illum
          quis dolor corporis ex, in exercitationem incidunt, facere porro!
        </p>
      </section>
      <section>
        <h1>모달 구현</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <button
            className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            type="button"
            onClick={showAlertModal}
          >
            모집 마감
          </button>

          <button
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            type="button"
            onClick={showConfirmModal}
          >
            사장님 정보 관리
          </button>

          <button
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            type="button"
            onClick={showDeleteModal}
          >
            삭제 확인 모달
          </button>

          <button
            className="rounded bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
            type="button"
            onClick={showFormModal}
          >
            내 지원 내역 모달
          </button>
        </div>
      </section>
      <ModalManager
        closeOnEsc
        closeOnOverlayClick
        content={content}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default HyeranClientTest;
