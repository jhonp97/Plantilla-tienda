import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MinimalSpinner } from './MinimalSpinner';

describe('MinimalSpinner', () => {
  it('should render an SVG element', () => {
    const { container } = render(<MinimalSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have role="status" for accessibility', () => {
    const { container } = render(<MinimalSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'status');
  });

  it('should have default aria-label', () => {
    const { container } = render(<MinimalSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'Cargando');
  });

  it('should render with custom label', () => {
    const { container } = render(<MinimalSpinner label="Guardando" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'Guardando');
  });

  it('should have default size of 24px', () => {
    const { container } = render(<MinimalSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should render with custom size', () => {
    const { container } = render(<MinimalSpinner size={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should apply custom className', () => {
    const { container } = render(<MinimalSpinner className="custom-spinner" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('custom-spinner');
  });

  it('should render a circle inside SVG', () => {
    const { container } = render(<MinimalSpinner />);
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
  });
});
