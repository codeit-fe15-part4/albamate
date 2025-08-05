import InputFileImage from '@common/input/InputFileImage';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface UploadMultipleImageProps {
  /**
   * 사용자가 새 이미지를 선택하거나 삭제했을 때 호출되는 콜백 함수입니다.
   * 선택된 `File`들의 배열을 인자로 받습니다.
   */
  onImageChange: (files: File[]) => void;
  /**
   * 이미 업로드된 이미지 배열입니다.
   */
  uploadedImageUrls?: string[];
  /**
   * 이미 업로드된 이미지 배열 setter함수 입니다.
   */
  setUploadedImageUrls?: Dispatch<SetStateAction<string[]>>;
  /**
   * input 요소의 고유 ID입니다. `label`의 `htmlFor` 속성과 연결하는 데 사용될 수 있습니다.
   */
  id?: string;
}

/**
 * 여러개의 이미지 파일을 업로드하고 미리보기를 표시하는 컴포넌트입니다.
 * 사용자가 이미지를 선택하면 기존 이미지에 추가되어 미리보기가 보여지고,
 * 미리보기 위의 x 버튼을 통해 선택된 이미지를 삭제할 수도 있습니다.
 * 선택된 `File` 리스트를 `onImageChange` 콜백을 통해 상위 컴포넌트로 전달합니다.
 */
const UploadMultipleImage = ({
  onImageChange,
  id,
  uploadedImageUrls,
  setUploadedImageUrls,
}: UploadMultipleImageProps) => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const previewImagesRef = useRef<string[]>([]);

  useEffect(() => {
    previewImagesRef.current = previewImages;
  }, [previewImages]);

  useEffect(() => {
    return () => {
      previewImagesRef.current.forEach(previewImage =>
        URL.revokeObjectURL(previewImage)
      );
    };
  }, []);

  useEffect(() => {
    onImageChange(currentFiles);
  }, [currentFiles, onImageChange]);

  const handleImageChange = (files: File[]) => {
    if (!files[0]) return;
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...urls]);
    setCurrentFiles(prev => [...prev, ...files]);
  };

  const removeUploadedImage = (idx: number) => {
    setUploadedImageUrls?.(prev => prev.filter((_, index) => index !== idx));
  };

  const removePreviewImage = (idx: number) => {
    if (previewImages[idx]) URL.revokeObjectURL(previewImages[idx]);
    setPreviewImages(prev => prev.filter((_, index) => index !== idx));
    setCurrentFiles(prev => prev.filter((_, index) => index !== idx));
  };

  return (
    <div className="flex flex-wrap gap-20 lg:gap-24">
      <div className="relative flex size-80 items-center justify-center rounded-lg bg-background-200 transition-all duration-200 ease-in-out hover:bg-background-300 lg:size-116 dark:bg-gray-800 hover:dark:bg-gray-700">
        <Image
          alt="이미지 넣기"
          className="size-24 invert-60 lg:size-36 dark:invert-80"
          height={36}
          sizes="24px (min-width:64rem) 36px"
          src="/icons/upload.svg"
          width={36}
        />

        <InputFileImage
          multiple
          className="absolute inset-0 cursor-pointer"
          id={id}
          onImageChange={handleImageChange}
        />
      </div>
      {uploadedImageUrls &&
        uploadedImageUrls.map((imageUrl, idx) => (
          <div key={imageUrl} className="relative size-80 lg:size-116">
            <Image
              fill
              alt="이미지 미리보기"
              className="rounded-lg object-cover object-center"
              sizes="80px (min-width:64rem) 116px"
              src={imageUrl}
            />
            <button
              aria-label="이미지 삭제"
              className="absolute -top-10 -right-10 size-24 transition-all duration-200 ease-in-out hover:brightness-90 lg:-top-14 lg:-right-14 lg:size-36 dark:brightness-75 dark:invert-100 dark:hover:brightness-65"
              type="button"
              onClick={() => removeUploadedImage(idx)}
            >
              <Image
                fill
                alt="x버튼"
                className="object-cover object-center"
                sizes="24px (min-width:64rem) 36px"
                src="/icons/x-circle.svg"
              />
            </button>
          </div>
        ))}
      {previewImages &&
        previewImages.map((previewImage, idx) => (
          <div key={previewImage} className="relative size-80 lg:size-116">
            <Image
              fill
              alt="이미지 미리보기"
              className="rounded-lg object-cover object-center"
              sizes="80px (min-width:64rem) 116px"
              src={previewImage}
            />
            <button
              aria-label="이미지 삭제"
              className="absolute -top-10 -right-10 size-24 transition-all duration-200 ease-in-out hover:brightness-90 lg:-top-14 lg:-right-14 lg:size-36 dark:brightness-75 dark:invert-100 dark:hover:brightness-65"
              type="button"
              onClick={() => removePreviewImage(idx)}
            >
              <Image
                fill
                alt="x버튼"
                className="object-cover object-center"
                sizes="24px (min-width:64rem) 36px"
                src="/icons/x-circle.svg"
              />
            </button>
          </div>
        ))}
    </div>
  );
};
export default UploadMultipleImage;
