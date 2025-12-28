import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
};

// Generate static params for all service category pages
export async function generateStaticParams() {
  return [
    { category: 'haircuts-styling' },
    { category: 'hair-color-treatments' },
    { category: 'nail-care' },
    { category: 'skin-care-facials' },
    { category: 'massage-body-treatments' },
    { category: 'makeup-beauty' },
    { category: 'waxing-hair-removal' },
    { category: 'braiding-weaving' },
    { category: 'mens-grooming' },
    { category: 'bridal-services' },
    { category: 'wig-installations' },
    { category: 'natural-hair-specialists' },
    { category: 'lashes-brows' },
    { category: 'aesthetics-advanced-skin' },
    { category: 'tattoos-piercings' },
    { category: 'wellness-holistic-spa' },
  ];
}

const CATEGORY_INFO: Record<string, { title: string; description: string; keywords: string }> = {
  'haircuts-styling': {
    title: '✂️ Haircuts & Styling Services | Book Top Stylists in SA',
    description: '✓ Expert hairstylists for cuts, styling & transformations ✓ Instant booking ✓ Verified reviews. Find the best hair salons in South Africa!',
    keywords: 'haircut, hair styling, hairstylist, hair salon, barber, hair transformation, professional haircut, South Africa',
  },
  'hair-color-treatments': {
    title: '🎨 Hair Coloring & Treatments | Expert Color Specialists in SA',
    description: '✓ Balayage, highlights, ombre & keratin treatments ✓ Top colorists ✓ Book online today. Professional hair color services across South Africa!',
    keywords: 'hair color, hair dye, balayage, highlights, ombre, hair treatment, keratin treatment, colorist, South Africa',
  },
  'nail-care': {
    title: '💅 Nail Salon Services | Manicures, Pedicures & Nail Art in SA',
    description: '✓ Gel nails, acrylics & custom nail art ✓ Top technicians ✓ Book instantly. Find the best nail salons in South Africa!',
    keywords: 'nail salon, manicure, pedicure, gel nails, acrylic nails, nail art, nail technician, nail care, South Africa',
  },
  'skin-care-facials': {
    title: '✨ Skin Care & Facials | Professional Estheticians in SA',
    description: '✓ Facials, anti-aging & acne treatments ✓ Expert skin therapists ✓ Book online. Find top estheticians across South Africa!',
    keywords: 'facial, skin care, esthetician, skin treatment, spa facial, anti-aging, acne treatment, skincare specialist, South Africa',
  },
  'massage-body-treatments': {
    title: '💆 Massage & Body Treatments | Wellness Spas in SA',
    description: '✓ Deep tissue, Swedish & hot stone massage ✓ Top therapists ✓ Book today. Find wellness spas across South Africa!',
    keywords: 'massage, body treatment, spa, massage therapy, wellness, relaxation, deep tissue, Swedish massage, hot stone, South Africa',
  },
  'makeup-beauty': {
    title: '💄 Makeup Artists | Professional Makeup Services in SA',
    description: '✓ Bridal, event & editorial makeup ✓ Expert artists ✓ Book instantly. Find professional makeup artists across South Africa!',
    keywords: 'makeup artist, beauty services, bridal makeup, special event makeup, professional makeup, makeup application, beauty specialist, South Africa',
  },
  'waxing-hair-removal': {
    title: '🌸 Waxing & Hair Removal | Professional Waxing in SA',
    description: '✓ Brazilian, full body & laser hair removal ✓ Expert technicians ✓ Book online. Find professional waxing services in South Africa!',
    keywords: 'waxing, hair removal, Brazilian wax, laser hair removal, body waxing, threading, wax specialist, South Africa',
  },
  'braiding-weaving': {
    title: '👑 Braiding & Weaving | Expert Braiders in South Africa',
    description: '✓ Box braids, cornrows, Ghana braids & weaves ✓ Top braiders ✓ Book today. Find professional braiding specialists across SA!',
    keywords: 'braiding, hair braiding, box braids, cornrows, Ghana braids, weaving, hair extensions, braider, crochet braids, South Africa',
  },
  'mens-grooming': {
    title: '🧔 Men\'s Grooming | Barbers & Male Grooming in SA',
    description: '✓ Haircuts, beard trims & hot shaves ✓ Expert barbers ✓ Book instantly. Find professional men\'s grooming across South Africa!',
    keywords: 'men\'s grooming, barber, men\'s haircut, beard trim, hot shave, male grooming, barber shop, South Africa',
  },
  'bridal-services': {
    title: '👰 Bridal Beauty Services | Wedding Hair & Makeup in SA',
    description: '✓ Bridal hair, makeup & packages ✓ Experienced specialists ✓ Book your special day. Find wedding beauty experts in South Africa!',
    keywords: 'bridal services, wedding hair, wedding makeup, bridal makeup artist, bridal hairstylist, wedding beauty, bridal package, South Africa',
  },
  'wig-installations': {
    title: '💇‍♀️ Wig Installation | Professional Wig Specialists in SA',
    description: '✓ Lace front, full lace & custom wigs ✓ Expert stylists ✓ Book online. Find wig installation specialists in South Africa!',
    keywords: 'wig installation, wig, wigs, wig specialist, wig stylist, lace front wig, full lace wig, wig fitting, wig customization, wig services, South Africa',
  },
  'natural-hair-specialists': {
    title: '🌿 Natural Hair Specialists | Natural Hair Care in SA',
    description: '✓ 4c hair, silk press, protective styles ✓ Expert stylists ✓ Book today. Find natural hair specialists across South Africa!',
    keywords: 'natural hair salon, natural hair specialist, 4c hair specialist, natural hair treatments, silk press, wash and go, twist out, braid out, protective styles, curly cut, deva cut, natural hair consultation, South Africa',
  },
  'lashes-brows': {
    title: '👁️ Lashes & Brows | Lash Extensions & Microblading in SA',
    description: '✓ Volume lashes, microblading & brow lamination ✓ Expert technicians ✓ Book instantly. Find lash & brow specialists in South Africa!',
    keywords: 'lash extensions, microblading, brow specialist, volume lashes, hybrid lashes, lash lift and tint, brow lamination, henna brows, lash bar, brow bar, eyebrow artist, South Africa',
  },
  'aesthetics-advanced-skin': {
    title: '💉 Aesthetics & Advanced Skin | Med-Spa Services in SA',
    description: '✓ Botox, fillers, microneedling & laser ✓ Expert clinics ✓ Book online. Find advanced skin treatments in South Africa!',
    keywords: 'aesthetics clinic, med-spa, microneedling, chemical peel, Botox, dermal fillers, laser hair removal, dermaplaning, IV drip therapy, skin clinic, anti-aging treatments, South Africa',
  },
  'tattoos-piercings': {
    title: '🎨 Tattoos & Piercings | Professional Tattoo Artists in SA',
    description: '✓ Custom tattoos, fine-line & body piercings ✓ Top artists ✓ Book today. Find tattoo studios across South Africa!',
    keywords: 'tattoo artist, tattoo studio, custom tattoo, fine-line tattoo, portrait tattoo, body piercing, ear piercing, nose piercing, piercing studio, tattoo removal, South Africa',
  },
  'wellness-holistic-spa': {
    title: '🧘 Wellness & Holistic Spa | Complete Wellness in SA',
    description: '✓ Massage, reflexology, reiki & spa packages ✓ Wellness centres ✓ Book instantly. Find holistic spa experiences in South Africa!',
    keywords: 'wellness centre, holistic spa, massage therapy, reflexology, reiki healing, energy healing, sauna, steam room, flotation therapy, spa day package, self-care, South Africa',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = CATEGORY_INFO[category] || {
    title: 'Beauty Services | Stylr SA',
    description: 'Find and book professional beauty services in South Africa',
    keywords: 'beauty services, salon, South Africa',
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const canonicalUrl = `${siteUrl}/services/${category}`;

  return {
    title: categoryInfo.title,
    description: categoryInfo.description,
    keywords: categoryInfo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: categoryInfo.title,
      description: categoryInfo.description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-transparent.png`,
          width: 800,
          height: 600,
          alt: 'Stylr SA',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryInfo.title,
      description: categoryInfo.description,
    },
  };
}

export default async function ServiceCategoryLayout({ children, params }: Props) {
  const { category } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  // Structured data for service category
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${siteUrl}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: CATEGORY_INFO[category]?.title.split('|')[0].trim() || 'Category',
        item: `${siteUrl}/services/${category}`,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: CATEGORY_INFO[category]?.title.split('|')[0].trim() || 'Beauty Service',
    provider: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    description: CATEGORY_INFO[category]?.description || '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  );
}

