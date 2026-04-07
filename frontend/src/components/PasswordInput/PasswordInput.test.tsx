import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('should render password input by default', () => {
    const { getByLabelText } = render(<PasswordInput label="Password" />);
    const input = getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility', () => {
    const { getByLabelText, getByRole } = render(<PasswordInput label="Password" />);
    const input = getByLabelText(/password/i);
    const toggleButton = getByRole('button', { name: /mostrar contraseña/i });
    
    // Initially should show hidden password
    expect(input).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
    
    // Click toggle again to hide password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should hide toggle button when showToggle is false', () => {
    const { queryByRole } = render(<PasswordInput label="Password" showToggle={false} />);
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render with custom value', () => {
    const { getByLabelText } = render(
      <PasswordInput label="Password" value="mysecretpass" />
    );
    const input = getByLabelText(/password/i);
    expect(input).toHaveValue('mysecretpass');
  });

  it('should handle onChange', () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <PasswordInput label="Password" onChange={handleChange} />
    );
    const input = getByLabelText(/password/i);
    fireEvent.change(input, { target: { value: 'newpassword' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render error state', () => {
    const { getByRole } = render(
      <PasswordInput label="Password" error="Password required" />
    );
    expect(getByRole('alert')).toHaveTextContent('Password required');
  });

  it('should render helper text', () => {
    const { getByText } = render(
      <PasswordInput label="Password" helperText="Min 8 characters" />
    );
    expect(getByText('Min 8 characters')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PasswordInput label="Password" className="custom-password" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-password');
  });
});