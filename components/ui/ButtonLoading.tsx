import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'white' | 'gray';
  text?: string;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  size = 'sm',
  color = 'yellow',
  text
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <LoadingSpinner
        size={size}
        color={color}
        className=""
      />
      {text && (
        <span className="text-sm font-semibold text-gray-700">{text}</span>
      )}
    </div>
  );
};

export default ButtonLoading; 