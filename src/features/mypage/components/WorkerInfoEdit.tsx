import PrimaryButton from '@common/button/PrimaryButton';
import Input from '@common/input/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import ProfileEdit from '@/shared/components/common/profile/ProfileEdit';
import { usePopupStore } from '@/shared/store/popupStore';
import { FormData } from '@/shared/types/mypage';

import useMyPageApi from '../api/api';
import { useUpdateMyProfileQuery } from '../queries';
import {
  createWorkerSchema,
  UpdateWorkerMyProfileRequest,
} from '../schema/mypage.schema';

interface WorkerInfoEditProps {
  userInfo: FormData;
  close: () => void;
}

const WorkerInfoEdit = ({ userInfo, close }: WorkerInfoEditProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    userInfo?.imageUrl ?? '/icons/user-profile.svg'
  );
  const [imageFile, setImageFile] = useState<File>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWorkerMyProfileRequest>({
    resolver: zodResolver(createWorkerSchema),
    defaultValues: {
      name: userInfo?.name,
      nickname: userInfo?.nickname,
      phoneNumber: userInfo?.phoneNumber,
      imageUrl: userInfo?.imageUrl,
    },
  });

  const updateProfile = useUpdateMyProfileQuery();
  const api = useMyPageApi();
  const { showPopup } = usePopupStore();

  const handleImageChange = async (file: File) => {
    setImageFile(file);
  };

  const onSubmit = async (data: UpdateWorkerMyProfileRequest) => {
    let finalImageUrl = imageUrl ?? null;
    try {
      if (imageFile) {
        const response = await api.updateImage(imageFile);
        finalImageUrl = response.url;
      }
    } catch (error) {
      showPopup('이미지 업로드에 실패했습니다. 다시 시도해주세요.', 'error');
      console.error(error);
    }
    updateProfile.mutate(
      { ...data, imageUrl: finalImageUrl },
      {
        onSuccess: () => {
          showPopup('프로필이 성공적으로 수정되었습니다.', 'success');
          close();
        },
        onError: error => {
          showPopup('수정 중 오류가 발생했습니다.', 'error');
          console.error(error);
        },
      }
    );
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-53 flex w-full justify-center">
        <ProfileEdit
          imageUrl={imageUrl}
          onImageChange={file => handleImageChange(file)}
        />
      </div>
      <div className="mb-16 h-112 lg:mb-20">
        <label className="mb-8 text-md" htmlFor="name">
          이름 <span className="text-mint-100">*</span>
        </label>
        <Input
          id="name"
          placeholder="이름을 입력해주세요."
          variant="outlined"
          {...register('name')}
          isInvalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-16 h-112 lg:mb-20">
        <label className="mb-8 text-md" htmlFor="nickname">
          닉네임 <span className="text-mint-100">*</span>
        </label>
        <Input
          placeholder="닉네임을 입력해주세요."
          variant="outlined"
          {...register('nickname')}
          isInvalid={!!errors.nickname}
        />
        {errors.nickname && (
          <p className="text-sm text-red-500">{errors.nickname.message}</p>
        )}
      </div>

      <div className="mb-24 h-112 lg:mb-20">
        <label className="mb-8 text-md" htmlFor="phone">
          연락처 <span className="text-mint-100">*</span>
        </label>
        <Input
          placeholder="숫자만 입력해주세요."
          variant="outlined"
          {...register('phoneNumber')}
          isInvalid={!!errors.phoneNumber}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="flex gap-11">
        <PrimaryButton
          className="w-158 flex-1 rounded py-16 text-lg font-semibold lg:w-314 lg:py-20 lg:text-2lg"
          label="취소"
          type="button"
          variant="cancelSolid"
          onClick={() => close()}
        />
        <PrimaryButton
          className="w-158 flex-1 rounded py-16 text-lg font-semibold lg:w-314 lg:py-20 lg:text-2lg"
          label="수정하기"
          type="submit"
          variant="solid"
        />
      </div>
    </form>
  );
};

export default WorkerInfoEdit;
