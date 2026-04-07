import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Layout', () => {
  it('should render children', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render Header component', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    // Check for MiTienda in header specifically (logo)
    expect(screen.getByRole('link', { name: /ir a la página principal/i })).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByText(/todos los derechos reservados/i)).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    // Check nav links in header (not footer)
    expect(screen.getByRole('link', { name: /ver productos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver carrito de compras/i })).toBeInTheDocument();
  });

  it('should have proper structure with main element', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should render empty children without errors', () => {
    const { container } = renderWithRouter(<Layout>{null}</Layout>);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});