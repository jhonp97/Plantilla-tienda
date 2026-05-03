/**
 * PageTransition - GSAP page transition wrapper
 *
 * Wrap page content to get enter/exit animations.
 * Uses a ref-based approach that works with React Router.
 */

import { useRef, useEffect, type ReactNode } from 'react';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: ReactNode;
  /** CSS class for the wrapper element */
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { pageIn } = useGSAPAnimation();

  useEffect(() => {
    if (wrapperRef.current) {
      pageIn(wrapperRef.current);
    }
  }, [pageIn]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.pageWrapper}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}

export default PageTransition;
