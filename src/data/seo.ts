/**
 * schema.org structured data (JSON-LD) for the homepage.
 * Tells Google what deniz.studio is, where it's located (local SEO for
 * Wiesbaden/Germany) and what services it offers. The address matches the
 * imprint — keep the two in sync (NAP consistency matters for local SEO).
 */
export function homeJsonLd(lang: 'en' | 'de') {
  const description =
    lang === 'de'
      ? 'Design-Partner für Startups: Brand Identity und Landing Pages. Webdesign aus Wiesbaden – deutschlandweit und weltweit.'
      : 'Design partner for early-stage startups: brand identity and landing pages. Based in Wiesbaden, Germany — working worldwide.';

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://deniz.studio/#studio',
    name: 'deniz.studio',
    url: 'https://deniz.studio/',
    image: 'https://deniz.studio/og-image.png',
    description,
    email: 'mail@deniz.studio',
    founder: {
      '@type': 'Person',
      name: 'Deniz Ozan Kumral',
      url: 'https://deniz.studio/',
      sameAs: ['https://x.com/denizdoingstuff'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Senefelderstraße 3',
      postalCode: '65205',
      addressLocality: 'Wiesbaden',
      addressRegion: 'Hessen',
      addressCountry: 'DE',
    },
    areaServed: [
      { '@type': 'City', name: 'Wiesbaden' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'AdministrativeArea', name: 'Worldwide' },
    ],
    knowsLanguage: ['en', 'de'],
    sameAs: [
      'https://x.com/denizdoingstuff',
      'https://t.me/denizdoingstuff',
      'https://cal.com/denizkumral/intro',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: lang === 'de' ? 'Brand Identity & Branding' : 'Brand Identity Design' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: lang === 'de' ? 'Landing Pages & Webdesign' : 'Landing Page & Web Design' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: lang === 'de' ? 'Logo-Design' : 'Logo Design' },
      },
    ],
  };
}
