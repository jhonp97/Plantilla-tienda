import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@store/authStore';

vi.mock('@store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('should redirect to /login when not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector: (state: any) => any) => {
      const state = { isAuthenticated: false, user: null };
      return selector ? selector(state) : state;
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should not render protected content
    expect(container.textContent).not.toContain('Protected Content');
  });

  it('should render children when authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector: (state: any) => any) => {
      const state = {
        isAuthenticated: true,
        user: { id: '1', email: 'test@test.com', name: 'Test', role: 'CUSTOMER' },
      };
      return selector ? selector(state) : state;
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
