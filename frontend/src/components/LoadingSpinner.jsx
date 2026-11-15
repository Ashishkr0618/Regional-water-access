import React from 'react';

/**
 * LoadingSpinner — centered animated spinner.
 * Props:
 *   message  {string} — optional label below spinner
 *   size     {string} — "sm" | "md" (default) | "lg"
 */
export default function LoadingSpinner({ message = 'Loading…', size = 'md' }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`${sizeMap[size]} rounded-full border-aqua/20 border-t-aqua animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && (
        <p className="text-sm text-slate-500 font-medium">{message}</p>
      )}
    </div>
  );
}
