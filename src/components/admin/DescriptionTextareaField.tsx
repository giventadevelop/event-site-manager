'use client';

import type { FieldError, Path, UseFormRegister } from 'react-hook-form';

const MAX_DESCRIPTION_LENGTH = 1000;

interface DescriptionTextareaFieldProps<T extends { description?: string }> {
  register: UseFormRegister<T>;
  currentLength: number;
  error?: FieldError;
  label?: string;
  placeholder?: string;
}

export default function DescriptionTextareaField<T extends { description?: string }>({
  register,
  currentLength,
  error,
  label = 'Description',
  placeholder = 'Brief about the organization (shown on About pages and admin reference)',
}: DescriptionTextareaFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        {...register('description' as Path<T>, {
          maxLength: {
            value: MAX_DESCRIPTION_LENGTH,
            message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
          },
        })}
        rows={5}
        maxLength={MAX_DESCRIPTION_LENGTH}
        className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-400 focus:border-blue-500'
        }`}
        placeholder={placeholder}
      />
      <p className="mt-1 text-sm text-gray-500" aria-live="polite">
        {currentLength}/{MAX_DESCRIPTION_LENGTH} characters
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
