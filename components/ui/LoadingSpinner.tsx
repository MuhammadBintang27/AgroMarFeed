import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "blue" | "gray" | "green" | "yellow";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "green",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    blue: "border-blue-600 border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
    green: "border-green-500 border-t-transparent",
    yellow: "border-yellow-400 border-t-transparent",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} border rounded-full animate-spin`}
        style={{ borderWidth: 2 }}
      />
      {text && <p className="text-gray-600 mt-2 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
