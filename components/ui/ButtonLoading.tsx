import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  size = 'sm',
  color = 'yellow',
  text,
  className = '',
}) => {
  // Ukuran font mengikuti Button
  const textSize = size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm';
  // Warna teks default mengikuti warna spinner, fallback ke gray jika putih
  const textColor = color === 'white' ? 'text-gray-700' : color === 'yellow' ? 'text-yellow-600' : color === 'green' ? 'text-green-700' : color === 'gray' ? 'text-gray-600' : 'text-black';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LoadingSpinner
        size={size}
        color={color}
        className=""
      />
      {text && (
        <span className={`${textSize} font-semibold ${textColor}`}>{text}</span>
      )}
    </span>
  );
};

export default ButtonLoading; 