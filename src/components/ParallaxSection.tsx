import React, { useEffect, useMemo, useRef } from 'react';
import { cn, withBasePath } from '@/lib/utils';

interface ParallaxSectionProps extends React.HTMLAttributes<HTMLElement> {
  backgroundImage?: string;
  overlayClassName?: string;
  speed?: number;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  backgroundImage,
  overlayClassName,
  speed = 0.2,
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  const isReactSnap = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return navigator.userAgent.includes('ReactSnap');
  }, []);

  useEffect(() => {
    if (!backgroundImage) return;
    if (typeof window === 'undefined') return;
    if (isReactSnap) return;

    const update = () => {
      const container = containerRef.current;
      const bg = bgRef.current;
      if (!container || !bg) return;

      const rect = container.getBoundingClientRect();
      const offset = -rect.top;
      const translateY = Math.round(offset * speed);

      bg.style.transform = `translate3d(0, ${translateY}px, 0)`;
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [backgroundImage, isReactSnap, speed]);

  return (
    <section ref={containerRef} className={cn('relative overflow-hidden', className)} {...props}>
      {backgroundImage ? (
        <div
          ref={bgRef}
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${withBasePath(backgroundImage)})` }}
          aria-hidden="true"
        />
      ) : null}
      {overlayClassName ? <div className={cn('pointer-events-none absolute inset-0 z-0', overlayClassName)} aria-hidden="true" /> : null}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default ParallaxSection;
