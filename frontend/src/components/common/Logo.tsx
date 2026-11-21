import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showLink?: boolean;
  to?: string;
  height?: number | string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showLink = true,
  to = '/',
  height = 44,
}) => {
  const imgElement = (
    <img
      src="/naam-logo.png"
      alt="NAAM (നാം) — Community Environmental Communication and Monitoring Platform"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-auto object-contain select-none transition-transform duration-200 ${className}`}
    />
  );

  if (showLink) {
    return (
      <Link
        to={to}
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#087C63] focus:ring-offset-2 rounded-lg"
      >
        {imgElement}
      </Link>
    );
  }

  return imgElement;
};
