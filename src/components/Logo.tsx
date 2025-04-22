
import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 800 400"
      className={className}
      role="img"
      aria-label="Paperboy logo"
    >
      <path
        d="M260 50c-30 0-54.4 24.4-54.4 54.4 0 23 14.2 42.7 34.4 50.6v195h40V155c20.2-7.9 34.4-27.6 34.4-50.6C314.4 74.4 290 50 260 50zM466.7 200l-13.3-40h-80l-13.3 40h-43.4l66.7-200h60l66.7 200h-43.4zm-50-120l-26.7 80h53.3l-26.7-80zM600 200V0h40v200h-40z"
        fill="currentColor"
      />
      <path
        d="M180 120c0-22.1 17.9-40 40-40s40 17.9 40 40-17.9 40-40 40-40-17.9-40-40zm146.7 80H280v-40h46.7v40zm160 0h-46.7v-40H520v40z"
        fill="currentColor"
      />
    </svg>
  );
};

