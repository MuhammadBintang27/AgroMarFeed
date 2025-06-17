import React from "react";
import Link from "next/link";

// Tombol yang bisa jadi <button> atau <a>
type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  className = "",
  size = "md",
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-normal rounded-full transition-all";
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const colorStyles = "bg-yellow-500 text-black hover:bg-yellow-400";
  const combinedClassName = `${baseStyle} ${sizeStyles[size]} ${colorStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} legacyBehavior>
        <a className={combinedClassName} onClick={onClick}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};

export default Button;
