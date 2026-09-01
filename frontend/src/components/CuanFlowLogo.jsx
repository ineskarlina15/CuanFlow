import React from 'react'

export default function CuanFlowLogo({ className = '', iconOnly = false, size = 'md' }) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' }
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official CuanFlow Gradient Arc Logo */}
      <svg 
        width={currentSize.icon} 
        height={currentSize.icon} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="cuanflowGradient" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="80%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Circular Gradient Arc C shape */}
        <path
          d="M 68 22 A 38 38 0 1 0 72 75"
          fill="none"
          stroke="url(#cuanflowGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Top Gold Dot at tip */}
        <circle cx="70" cy="24" r="8" fill="#F59E0B" />
      </svg>

      {!iconOnly && (
        <span className={`font-black tracking-tight text-blue-900 font-heading ${currentSize.text}`}>
          CUANFLOW
        </span>
      )}
    </div>
  )
}
