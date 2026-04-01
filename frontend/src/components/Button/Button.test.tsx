import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with primary variant by default', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should be disabled when isLoading is true', () => {
    const { getByRole } = render(<Button isLoading>Loading</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    const { getByRole } = render(<Button className="custom-class">Test</Button>);
    const button = getByRole('button');
    expect(button.className).toContain('custom-class');
  });
});
