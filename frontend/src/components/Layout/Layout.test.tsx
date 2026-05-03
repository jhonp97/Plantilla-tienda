import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@i18n/config';
import { Layout } from './Layout';

// Force Spanish for consistent tests
i18n.changeLanguage('es');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>{component}</BrowserRouter>
    </I18nextProvider>
  );
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
    // Check nav links in header (not footer) - use getAllByRole since both header and footer may have similar links
    const productosLinks = screen.getAllByRole('link', { name: /Productos/i });
    const carritoLinks = screen.getAllByRole('link', { name: /Carrito/i });
    expect(productosLinks.length).toBeGreaterThanOrEqual(1);
    expect(carritoLinks.length).toBeGreaterThanOrEqual(1);
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