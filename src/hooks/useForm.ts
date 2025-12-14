import { useForm as useReactHookForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

/**
 * Custom useForm hook with Zod validation support
 */
export function useForm<T extends FieldValues>(
  schema: ZodType<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  return useReactHookForm<T>({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: options?.mode ?? 'onBlur',
  });
}

/**
 * Re-export form utilities from react-hook-form
 */
export { useWatch, useFieldArray, useFormContext, FormProvider } from 'react-hook-form';
export type { UseFormReturn, FieldError, SubmitHandler, FieldValues } from 'react-hook-form';
