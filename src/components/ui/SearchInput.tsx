'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  className?: string;
  ariaLabel?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
  ariaLabel = 'Search',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleClearAll = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <label htmlFor="search-input" className="sr-only">
        {ariaLabel}
      </label>

      <div className="absolute left-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5"
          style={{ color: 'var(--color-primary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2 
          bg-gray-100 
          text-[var(--color-foreground)]
          placeholder-gray-400
          rounded-full
          border-2 border-transparent
          focus:border-[var(--color-primary)] 
          focus:bg-white 
          focus:outline-none 
          transition-all
        "
        style={{ fontFamily: 'var(--font-body)' }}
      />

      {query && (
        <button
          type="button"
          onClick={handleClearAll}  
          className="absolute right-3 p-1 flex items-center justify-center focus:outline-none hover:opacity-70 transition-opacity"
          style={{ 
            backgroundColor: 'transparent', 
            color: 'var(--color-primary)',
          }}
          aria-label="Clear search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}