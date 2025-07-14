/**
 * 지역 상태 기반 모달 매니저
 * props로 받은 모달 상태에 따라 렌더링
 */
'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import ModalContent from './ModalContent';
import ModalOverlay from './ModalOverlay';
import ModalProvider from './ModalProvider';

interface ModalManagerProps {
  isOpen: boolean;
  content: React.ReactNode;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  isOpen,
  content,
  onClose,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !content || typeof window === 'undefined') return null;

  return createPortal(
    <ModalProvider onClose={onClose}>
      <ModalOverlay closeOnOverlayClick={closeOnOverlayClick} onClose={onClose}>
        <ModalContent className={className}>{content}</ModalContent>
      </ModalOverlay>
    </ModalProvider>,
    document.body
  );
};

export default ModalManager;
