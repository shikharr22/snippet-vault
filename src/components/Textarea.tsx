import { TextareaHTMLAttributes } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full p-2 border  rounded-md focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}
