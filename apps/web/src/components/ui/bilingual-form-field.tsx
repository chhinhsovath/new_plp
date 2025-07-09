"use client";

import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "./bilingual-text";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface BilingualFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  labelEn: string;
  labelKm: string;
  descriptionEn?: string;
  descriptionKm?: string;
  placeholderEn?: string;
  placeholderKm?: string;
  required?: boolean;
  className?: string;
  render: (props: {
    field: any;
    placeholder?: string;
  }) => ReactNode;
}

export function BilingualFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  labelEn,
  labelKm,
  descriptionEn,
  descriptionKm,
  placeholderEn,
  placeholderKm,
  required,
  className,
  render,
}: BilingualFormFieldProps<TFieldValues, TName>) {
  const { isKhmer } = useLanguage();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            <BilingualLabel en={labelEn} km={labelKm} />
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {render({
              field,
              placeholder: isKhmer ? placeholderKm : placeholderEn,
            })}
          </FormControl>
          {(descriptionEn || descriptionKm) && (
            <FormDescription>
              {isKhmer ? descriptionKm : descriptionEn}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience wrapper for bilingual select options
interface BilingualOption {
  value: string;
  labelEn: string;
  labelKm: string;
}

export function BilingualSelectOptions({ 
  options 
}: { 
  options: BilingualOption[] 
}) {
  const { isKhmer } = useLanguage();

  return (
    <>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {isKhmer ? option.labelKm : option.labelEn}
        </option>
      ))}
    </>
  );
}