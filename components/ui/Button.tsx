import React from 'react';
import Link from 'next/link';

type ButtonProps = {
  children: React.ReactNode;
  href?: string; // Optional, jika ingin membuat tombol sebagai link
  onClick?: () => void; // Optional, untuk aksi ketika tombol diklik
  className?: string; // Bisa menambahkan class tambahan untuk styling
  size?: 'sm' | 'md' | 'lg'; // Menentukan ukuran tombol
};

const Button: React.FC<ButtonProps> = ({ children, href, onClick, className = '', size = 'md' }) => {
  const baseStyle = 'inline-flex items-center justify-center font-normal rounded-full transition-all';
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  const colorStyles = 'bg-yellow-500 text-black hover:bg-yellow-400';
  const combinedClassName = `${baseStyle} ${sizeStyles[size]} ${colorStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};

export default Button;