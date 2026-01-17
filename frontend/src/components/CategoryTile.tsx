'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface CategoryTileProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradientFrom: string;
  gradientTo: string;
  iconBg?: string;
  delay?: number;
  itemCount?: number;
  itemLabel?: string;
}

export function CategoryTile({
  title,
  description,
  icon,
  href,
  gradientFrom,
  gradientTo,
  iconBg = 'bg-white/20',
  delay = 0,
  itemCount,
  itemLabel,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group block h-full"
      style={{ animationDelay: `${delay}ms` }}
      onClick={(e) => {
        console.log(`[CategoryTile] Clicked: ${title}, href: ${href}`);
      }}
    >
      <div className="relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-[1.03] hover:-translate-y-2">
        {/* Animated gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
        
        {/* Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* Icon with animation */}
          <div className="mb-6 relative">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${iconBg} backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-500 inline-block animate-float">
                {icon}
              </span>
            </div>
            {/* Floating particles effect */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 flex-grow group-hover:text-white/90 transition-colors duration-300">
            {description}
          </p>

          {/* Item count badge */}
          {itemCount !== undefined && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                {itemCount} {itemLabel || 'items'}
              </span>
            </div>
          )}

          {/* CTA Arrow */}
          <div className="flex items-center text-primary-600 font-semibold group-hover:text-white transition-colors duration-300 mt-auto">
            <span>Explore {title}</span>
            <span className="ml-2 text-xl group-hover:translate-x-2 transition-transform duration-300 inline-block">
              →
            </span>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-125 transition-transform duration-700" />
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </Link>
  );
}
