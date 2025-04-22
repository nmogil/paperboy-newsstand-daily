
import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Paperboy logo"
    >
      {/* Paper boy newspaper icon */}
      <path
        d="M448 96h-64V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v256c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64zM64 40c13.2 0 24 10.8 24 24s-10.8 24-24 24-24-10.8-24-24 10.8-24 24-24zm384 280c0 4.4-3.6 8-8 8H72c-4.4 0-8-3.6-8-8V168c0-4.4 3.6-8 8-8h368c4.4 0 8 3.6 8 8v152z"
        fill="currentColor"
      />
      {/* Text overlay/masthead */}
      <path
        d="M128 216v96h256v-96H128zm32 64h-16v-32h16v32zm32 0h-16v-32h16v32zm32 0h-16v-32h16v32zm32 0h-16v-32h16v32zm32 0h-16v-32h16v32zm32 0h-16v-32h16v32z"
        fill="currentColor"
      />
      {/* Text at top of newspaper */}
      <path
        d="M128 184h256v16H128z"
        fill="currentColor"
      />
    </svg>
  );
};
