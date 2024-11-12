import { useEffect, useRef } from 'react';

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      if (
        scrolled + windowHeight > elementTop &&
        scrolled < elementTop + elementHeight
      ) {
        const yPos = (scrolled - elementTop) * speed;
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}