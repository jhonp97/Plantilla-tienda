import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  pathname?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'Tienda Online';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';

/**
 * SEO - Injects meta tags and JSON-LD structured data per route.
 *
 * @param title - Page title (appended with site name)
 * @param description - Meta description
 * @param image - Open Graph image URL
 * @param type - Open Graph type (website, article, product)
 * @param pathname - Current path for canonical URL
 * @param jsonLd - Optional JSON-LD structured data object
 */
export function SEO({
  title,
  description,
  image,
  type = 'website',
  pathname,
  jsonLd,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = pathname ? `${BASE_URL}${pathname}` : BASE_URL;
  const ogImage = image || `${BASE_URL}/og-default.jpg`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * buildProductJsonLd - Helper to build JSON-LD Product schema.
 */
export function buildProductJsonLd(product: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  reviewCount?: number;
  ratingValue?: number;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EUR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
    },
    ...(product.reviewCount && product.ratingValue
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}
