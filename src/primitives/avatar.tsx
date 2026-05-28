'use client';
import * as React from 'react';
import { cn } from './cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
};

export function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground overflow-hidden shrink-0',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src && !imageError ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
          {!imageLoaded && <span aria-hidden="true">{fallback.charAt(0).toUpperCase()}</span>}
        </>
      ) : (
        <span aria-hidden="true">{fallback.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
