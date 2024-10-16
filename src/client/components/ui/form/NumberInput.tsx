import React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/client/components/ui/form";
import type { InputProps } from "@/client/components/ui/input";
import { Input } from "@/client/components/ui/input";

type NumberInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  inputProps?: InputProps;
  className?: string;
};

function NumberInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  inputProps,
  className,
}: NumberInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              {...inputProps}
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default NumberInput;
