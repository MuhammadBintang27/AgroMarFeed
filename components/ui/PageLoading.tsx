import React from 'react';
import Image from 'next/image';

interface PageLoadingProps {
  text?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Memuat...',
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'text-green-600',
    secondary: 'text-yellow-500',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const barClasses = {
    primary: 'bg-green-500',
    secondary: 'bg-yellow-400',
    white: 'bg-white',
    gray: 'bg-gray-400'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-yellow-100">
      <div className="text-center">
        {/* Animated Farm Scene */}
        <div className="relative mb-8">
          {/* Sun */}
          <div className="absolute -top-6 -right-6 w-10 h-10 bg-yellow-400 rounded-full animate-pulse shadow-lg">
            <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
          </div>
          
          {/* Animated Cow */}
          <div className="relative">
            <div className="animate-bounce">
              <div className="animate-pulse" style={{ animationDuration: '3s' }}>
                <Image
                  src="/images/home/logo.png"
                  alt="AgroMarFeed Loading"
                  width={90}
                  height={90}
                  className="mx-auto drop-shadow-lg transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            {/* Grass field */}
            <div className="flex justify-center items-end space-x-1 mt-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-green-600 to-green-400 rounded-t-full animate-pulse shadow-sm"
                  style={{
                    height: `${Math.random() * 6 + 3}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 bg-current ${color === 'secondary' ? 'text-yellow-400' : colorClasses[color]} rounded-full animate-ping`}
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${30 + i * 10}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="mb-6">
          <p className={`text-lg font-semibold ${colorClasses[color]} animate-pulse`}>
            {text}
          </p>
          <div className="flex justify-center space-x-1 mt-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-current ${color === 'secondary' ? 'text-yellow-400' : colorClasses[color]} animate-bounce`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-56 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden shadow-inner">
          <div 
            className={`h-full ${barClasses[color]} rounded-full animate-pulse`}
            style={{
              width: '65%',
              animationDuration: '2s'
            }}
          />
        </div>
        
        {/* Farm message */}
        <p className="text-sm text-gray-500 mt-4 animate-pulse">
          AgroMarFeed sedang menyiapkan pakan terbaik...
        </p>
      </div>
    </div>
  );
};

export default PageLoading; 