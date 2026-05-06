import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('should render with correct label for PENDING status', () => {
    render(<StatusPill status="PENDING" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('should render with correct label for COMPLETED status', () => {
    render(<StatusPill status="COMPLETED" />);
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('should render with correct label for CANCELLED status', () => {
    render(<StatusPill status="CANCELLED" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('should render with correct label for PROCESSING status', () => {
    render(<StatusPill status="PROCESSING" />);
    expect(screen.getByText('Procesando')).toBeInTheDocument();
  });

  it('should render with correct label for SHIPPED status', () => {
    render(<StatusPill status="SHIPPED" />);
    expect(screen.getByText('Enviado')).toBeInTheDocument();
  });

  it('should render with custom label override', () => {
    render(<StatusPill status="PENDING" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    render(<StatusPill status="COMPLETED" />);
    const pill = screen.getByText('Completado');
    expect(pill).toHaveAttribute('aria-label', 'Estado: Completado');
  });

  it('should apply correct CSS class for status variant', () => {
    const { container } = render(<StatusPill status="COMPLETED" />);
    const pill = container.querySelector('span');
    expect(pill?.className).toContain('completed');
  });
});
