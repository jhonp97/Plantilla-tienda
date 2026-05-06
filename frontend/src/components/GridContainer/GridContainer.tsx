import { ReactNode, createElement, ElementType } from 'react';
import styles from './GridContainer.module.css';

export interface GridContainerProps {
  /** Number of visual columns (1-12). Default: 12 */
  columns?: number;
  /** Gap from spacing scale. Default: '4' (32px) */
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8';
  children: ReactNode;
  className?: string;
  /** HTML element to render. Default: 'div' */
  as?: ElementType;
}

/**
 * GridContainer — 12-column responsive CSS Grid.
 * Columns collapse: 12 → 6 (≤768px) → 4 (≤640px).
 * Use `columns` prop for content-aware column count.
 */
export function GridContainer({
  columns,
  gap = '4',
  children,
  className = '',
  as = 'div',
}: GridContainerProps) {
  const gridClass = [
    styles.grid,
    styles[`gap-${gap}` as keyof typeof styles],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties | undefined = columns
    ? {
        gridTemplateColumns: `repeat(${Math.min(columns, 12)}, 1fr)`,
      }
    : undefined;

  return createElement(
    as as ElementType,
    { className: gridClass, style },
    children,
  );
}

export default GridContainer;
