import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle = "rounded-md font-medium transition";
  const variantStyle =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "border border-gray-300 text-gray-700 hover:bg-gray-100";
  const sizeStyle =
    size === "sm"
      ? "px-2 py-1 text-xs"
      : size === "lg"
      ? "px-6 py-3 text-lg"
      : "px-4 py-2 text-sm";

  return (
    <button
      {...props}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
    >
      {children}
    </button>
  );
}
