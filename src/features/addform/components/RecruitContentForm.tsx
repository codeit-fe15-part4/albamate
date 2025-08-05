'use client';

import { Dispatch, SetStateAction } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { CreateFormRequest } from '@/features/addform/schema/addform.schema';
import DatePicker from '@/shared/components/common/date-picker';
import ErrorMessage from '@/shared/components/common/input/ErrorMessage';
import Input from '@/shared/components/common/input/Input';
import Label from '@/shared/components/common/input/Label';
import Textarea from '@/shared/components/common/input/Textarea';
import UploadMultipleImage from '@/shared/components/common/uploadImage/UploadMultipleImage';
import { cn } from '@/shared/lib/cn';

import AddFormSection from './AddFormSection';

const RecruitContentForm = ({
  className,
  onImageChange,
  uploadedImageUrls,
  setUploadedImageUrls,
}: {
  className?: string;
  onImageChange: (files: File[]) => void;
  uploadedImageUrls: string[];
  setUploadedImageUrls: Dispatch<SetStateAction<string[]>>;
}) => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CreateFormRequest>();
  return (
    <div
      className={cn(
        'flex flex-col gap-32 px-24 py-32 lg:gap-52 lg:py-48',
        className
      )}
    >
      <AddFormSection>
        <Label isRequired htmlFor="title">
          알바폼 제목
        </Label>
        <Input
          {...register('title')}
          required
          id="title"
          isInvalid={!!errors.title}
          placeholder="제목을 입력해주세요."
        />
        <ErrorMessage
          isVisible={!!errors.title}
          message={errors.title?.message}
        />
      </AddFormSection>
      <AddFormSection>
        <Label isRequired htmlFor="description">
          소개글
        </Label>
        <Textarea
          required
          id="description"
          isInvalid={!!errors.description}
          maxLength={200}
          {...register('description')}
          placeholder="최대 200자까지 입력 가능합니다."
        />
        <ErrorMessage
          isVisible={!!errors.description}
          message={errors.description?.message}
        />
      </AddFormSection>
      <AddFormSection>
        <Label isRequired>모집 기간</Label>
        <Controller
          control={control}
          name="recruitmentStartDate"
          render={({ field }) => {
            const recruitmentEndDate = watch('recruitmentEndDate');
            const selectedRange = {
              from: field.value ? new Date(field.value) : undefined,
              to: recruitmentEndDate ? new Date(recruitmentEndDate) : undefined,
            };
            return (
              <DatePicker
                isInvalid={!!errors.recruitmentStartDate}
                value={selectedRange}
                onDateRangeChange={range => {
                  field.onChange(range?.from ? range.from.toISOString() : '');
                  setValue(
                    'recruitmentEndDate',
                    range?.to ? range.to.toISOString() : '',
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  );
                }}
              />
            );
          }}
        />
        <ErrorMessage
          isVisible={!!errors.recruitmentStartDate}
          message={errors.recruitmentStartDate?.message}
        />
      </AddFormSection>
      <AddFormSection>
        <Label htmlFor="uploadImage">이미지 첨부</Label>
        <UploadMultipleImage
          id="uploadImage"
          setUploadedImageUrls={setUploadedImageUrls}
          uploadedImageUrls={uploadedImageUrls}
          onImageChange={onImageChange}
        />
      </AddFormSection>
    </div>
  );
};
export default RecruitContentForm;
