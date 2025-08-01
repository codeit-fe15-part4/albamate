'use client';

import PrimaryButton from '@common/button/PrimaryButton';
import Input from '@common/input/Input';
import Modal from '@common/modal/Modal';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

import useApplicationStore from '@/shared/store/useApplicationStore';
import useModalStore from '@/shared/store/useModalStore';

import albaApi from '../../api/albaApi';

type FormValues = {
  name: string;
  phone: string;
  password: string;
};

interface ApplicationModalProps {
  id: number;
}

const ApplicationModal = ({ id }: ApplicationModalProps) => {
  const { closeModal } = useModalStore();
  const router = useRouter();
  const { setGuestApplication } = useApplicationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('🚀 API 호출 시작');
      const response = await albaApi().verifyMyApplication(id, {
        name: data.name,
        phoneNumber: data.phone,
        password: data.password,
      });

      const application = response.data;
      console.log('✅ API 응답 성공:', application);

      // 1. Zustand 스토어에 저장
      setGuestApplication(application);
      console.log('💾 스토어에 데이터 저장 완료');

      // 2. sessionStorage에도 백업 저장
      sessionStorage.setItem(
        'guestApplication',
        JSON.stringify({
          data: application,
          timestamp: Date.now(),
        })
      );
      console.log('💾 sessionStorage 백업 저장 완료');

      // 3. 저장 후 스토어 상태 확인
      const currentStore = useApplicationStore.getState();
      console.log('🔍 저장 후 스토어 상태:', {
        isGuestMode: currentStore.isGuestMode,
        hasGuestApplication: !!currentStore.guestApplication,
        guestApplicationId: currentStore.guestApplication?.id,
      });

      closeModal();

      // 4. 페이지 이동 전 잠시 대기 (상태 안정화)
      await new Promise(resolve => setTimeout(resolve, 100));

      // 간단한 URL로 이동
      const targetUrl = `/myapply/${id}`;
      console.log('🔄 페이지 이동:', targetUrl);
      router.push(targetUrl);
    } catch (error) {
      console.error('인증 실패:', error);
      alert('지원자 정보를 확인할 수 없습니다.');
    }
  };

  return (
    <div className="flex w-full flex-col gap-36 rounded-xl p-24">
      <Modal.Header showCloseButton>
        <div className="Text-black text-xl font-bold lg:text-2xl">
          내 지원 내역 확인하기
        </div>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-20"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="text-sm font-medium">
            이름
            <Input
              className="mt-1 h-52 rounded border border-gray-300 text-black lg:h-54"
              type="text"
              {...register('name', { required: '이름을 입력해주세요' })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error">{errors.name.message}</p>
            )}
          </label>

          <label className="text-sm font-medium">
            전화번호
            <Input
              className="mt-1 h-52 rounded border border-gray-300 px-3 py-2 pl-12 text-black lg:h-54"
              type="tel"
              {...register('phone', {
                required: '전화번호를 입력해주세요',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: '올바른 전화번호를 입력해주세요',
                },
              })}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
            )}
          </label>

          <label className="mb-12 text-sm font-medium">
            비밀번호
            <Input
              className="mt-1 h-52 rounded border border-gray-300 text-black lg:h-54"
              type="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 8,
                  message: '비밀번호는 8자 이상이어야 합니다',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-error">
                {errors.password.message}
              </p>
            )}
          </label>

          <PrimaryButton
            className="h-58 w-327 rounded-md bg-mint-400 hover:brightness-92"
            label="지원 내역 상세보기"
            type="submit"
            variant="solid"
          />
        </form>
      </Modal.Body>
    </div>
  );
};

export default ApplicationModal;
