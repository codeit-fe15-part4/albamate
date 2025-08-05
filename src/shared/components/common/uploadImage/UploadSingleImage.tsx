'use client';

import InputFileImage from '@common/input/InputFileImage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface UploadSingleImageProps {
  /**
   * 사용자가 새 이미지를 선택했을 때 호출되는 콜백 함수입니다.
   * 선택된 단일 `File` 을 인자로 받습니다.
   */
  onImageChange: (file: File) => void;
  /**
   * input 요소의 고유 ID입니다. `label`의 `htmlFor` 속성과 연결하는 데 사용될 수 있습니다.
   */
  id?: string;
  /**
   * [추가된 속성] 수정 모드에서 초기 미리보기로 보여줄 이미지 URL입니다.
   * 'blob:' URL 또는 서버에서 받은 실제 URL이 될 수 있습니다.
   */
  initialImageUrl?: string | null;
}

/**
 * 단일 이미지 파일을 업로드하고 미리보기를 표시하는 컴포넌트입니다.
 * 사용자가 이미지를 선택하면 해당 이미지를 미리보기로 보여주고,
 * 선택된 `File` 을 `onImageChange` 콜백을 통해 상위 컴포넌트로 전달합니다.
 */
const UploadSingleImage = ({
  onImageChange,
  id,
  initialImageUrl,
}: UploadSingleImageProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);
  const handleImageChange = (files: File[]) => {
    if (!files[0]) return;
    const url = URL.createObjectURL(files[0]);
    setPreviewImage(url);

    onImageChange(files[0]);
  };
  return (
    <div className="relative flex size-160 flex-col items-center justify-center gap-8 overflow-hidden rounded-lg bg-background-200 transition-all duration-200 ease-in-out hover:bg-background-300 lg:size-240 dark:bg-gray-800 dark:hover:bg-gray-700">
      {initialImageUrl && (
        <Image
          fill
          alt="이미지 미리보기"
          className="object-cover object-center"
          sizes="160px (min-width:64rem) 240px"
          src={initialImageUrl}
        />
      )}
      {previewImage ? (
        <Image
          fill
          alt="이미지 미리보기"
          className="object-cover object-center"
          sizes="160px (min-width:64rem) 240px"
          src={previewImage}
        />
      ) : (
        <>
          <Image
            alt="이미지 넣기"
            className="size-36 invert-80 dark:invert-100"
            height={36}
            src="/icons/upload.svg"
            width={36}
          />
          <p className="text-lg font-medium text-gray-500 lg:text-2lg dark:text-gray-100">
            이미지 넣기
          </p>
        </>
      )}

      <InputFileImage
        className="absolute inset-0 cursor-pointer"
        id={id}
        onImageChange={handleImageChange}
      />
    </div>
  );
};
export default UploadSingleImage;
