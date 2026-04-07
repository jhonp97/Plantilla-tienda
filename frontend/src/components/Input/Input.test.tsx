import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('should render without icons', () => {
    const { getByLabelText } = render(<Input label="Email" />);
    expect(getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render with leading icon', () => {
    const leadingIcon = <span data-testid="leading-icon">🔍</span>;
    const { getByTestId } = render(
      <Input label="Search" leadingIcon={leadingIcon} />
    );
    expect(getByTestId('leading-icon')).toBeInTheDocument();
  });

  it('should render with trailing icon', () => {
    const trailingIcon = <span data-testid="trailing-icon">🔍</span>;
    const { getByTestId } = render(
      <Input label="Search" trailingIcon={trailingIcon} />
    );
    expect(getByTestId('trailing-icon')).toBeInTheDocument();
  });

  it('should render with both icons', () => {
    const leadingIcon = <span data-testid="leading">L</span>;
    const trailingIcon = <span data-testid="trailing">T</span>;
    const { getByTestId } = render(
      <Input label="Test" leadingIcon={leadingIcon} trailingIcon={trailingIcon} />
    );
    expect(getByTestId('leading')).toBeInTheDocument();
    expect(getByTestId('trailing')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const { getByRole } = render(<Input label="Email" error="Invalid email" />);
    expect(getByRole('alert')).toBeInTheDocument();
    expect(getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('should render helper text when no error', () => {
    const { getByText } = render(
      <Input label="Password" helperText="Must be 8+ characters" />
    );
    expect(getByText('Must be 8+ characters')).toBeInTheDocument();
  });

  it('should not render helper text when error exists', () => {
    const { queryByText } = render(
      <Input label="Password" error="Required" helperText="Help text" />
    );
    expect(queryByText('Help text')).not.toBeInTheDocument();
  });

  it('should handle input attributes', () => {
    const { getByLabelText } = render(
      <Input label="Email" type="email" placeholder="Enter email" />
    );
    const input = getByLabelText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
  });
});