import { InputHTMLAttributes } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function InputField({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}
