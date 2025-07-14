/**
 * 지역 상태 기반 모달 훅
 * 각 컴포넌트에서 독립적으로 모달 상태를 관리
 */
import { useState } from 'react';

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
  };

  return { isOpen, content, openModal, closeModal };
};

export default useModal;
