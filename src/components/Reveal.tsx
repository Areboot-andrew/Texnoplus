import React from 'react';
import { cn } from '@/lib/utils';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
  once?: boolean;
}

const Reveal: React.FC<RevealProps> = ({ className, delayMs = 0, once = true, children, style, ...props }) => {
  return (
    <div
      className={cn(className)}
      style={{
        opacity: 1,
        visibility: 'visible',
        transform: 'none',
        transitionDelay: `${delayMs}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Reveal;
