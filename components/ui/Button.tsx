import React from "react";
import Link from "next/link";

// Tombol yang bisa jadi <button> atau <a>
type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  className = "",
  size = "md",
  disabled = false,
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-normal rounded-full transition-all";
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const colorStyles = disabled
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-yellow-500 text-black hover:bg-yellow-400";
  const combinedClassName = `${baseStyle} ${sizeStyles[size]} ${colorStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} legacyBehavior>
        <a className={combinedClassName} onClick={onClick} aria-disabled={disabled} tabIndex={disabled ? -1 : 0}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combinedClassName} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
