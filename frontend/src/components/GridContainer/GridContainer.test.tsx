import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GridContainer } from './GridContainer';

describe('GridContainer', () => {
  it('should render children', () => {
    const { getByText } = render(
      <GridContainer>
        <div>Grid Item</div>
      </GridContainer>
    );
    expect(getByText('Grid Item')).toBeInTheDocument();
  });

  it('should render as div by default', () => {
    const { container } = render(
      <GridContainer>
        <div>Content</div>
      </GridContainer>
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render with custom element via as prop', () => {
    const { container } = render(
      <GridContainer as="section">
        <div>Content</div>
      </GridContainer>
    );
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <GridContainer className="custom-grid">
        <div>Content</div>
      </GridContainer>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('custom-grid');
  });

  it('should apply grid style with custom columns', () => {
    const { container } = render(
      <GridContainer columns={4}>
        <div>Content</div>
      </GridContainer>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
  });

  it('should cap columns at 12', () => {
    const { container } = render(
      <GridContainer columns={20}>
        <div>Content</div>
      </GridContainer>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(12, 1fr)');
  });

  it('should not apply inline style when columns is undefined', () => {
    const { container } = render(
      <GridContainer>
        <div>Content</div>
      </GridContainer>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('');
  });

  it('should apply gap class', () => {
    const { container } = render(
      <GridContainer gap="8">
        <div>Content</div>
      </GridContainer>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('gap-8');
  });
});
