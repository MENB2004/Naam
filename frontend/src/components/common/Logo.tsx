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
      decoding="async"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`max-w-full w-auto object-contain select-none transition-transform duration-200 ${className}`}
    />
  );

  if (showLink) {
    return (
      <Link
        to={to}
        className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {imgElement}
      </Link>
    );
  }

  return imgElement;
};
