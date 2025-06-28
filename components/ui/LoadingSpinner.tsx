import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "blue" | "gray";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    blue: "border-blue-600 border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 rounded-full animate-spin`}
      />
      {text && <p className="text-gray-600 mt-2 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
