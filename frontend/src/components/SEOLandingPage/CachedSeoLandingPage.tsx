import SEOLandingPage from './SEOLandingPage';
import styles from './SEOLandingPage.module.css';
import {
  SEO_KEYWORDS,
  slugToName,
} from '@/lib/seo-generation';
import {
  PROVINCES,
  getCityInfo,
  getProvinceInfo,
} from '@/lib/locationData';

type Breadcrumb = {
  label: string;
  url: string;
};

type RelatedLink = {
  label: string;
  url: string;
  type?: 'service' | 'location';
};

type FaqItem = {
  question: string;
  answer: string;
};

export type CachedSeoPageData = {
  h1: string;
  h2Headings: string[];
  h3Headings?: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  schemaMarkup?: unknown;
  serviceCount: number;
  salonCount: number;
  avgPrice?: number | null;
  relatedServices?: RelatedLink[];
  nearbyLocations?: RelatedLink[];
  keyword?: { keyword?: string; slug?: string };
  location?: { name?: string; province?: string; slug?: string };
};

type RouteContext = {
  segments: string[];
  keywordSlug: string;
  provinceSlug?: string;
  citySlug?: string;
  suburbSlug?: string;
  depth: 'national' | 'province' | 'city' | 'suburb';
};

function parseRouteContext(pathname: string): RouteContext {
  const segments = pathname.split('/').filter(Boolean);
  const keywordSlug = segments[0] || '';

  if (segments.length >= 4) {
    return {
      segments,
      keywordSlug,
      provinceSlug: segments[1],
      citySlug: segments[2],
      suburbSlug: segments[3],
      depth: 'suburb',
    };
  }

  if (segments.length === 3) {
    return {
      segments,
      keywordSlug,
      provinceSlug: segments[1],
      citySlug: segments[2],
      depth: 'city',
    };
  }

  if (segments.length === 2) {
    return {
      segments,
      keywordSlug,
      provinceSlug: segments[1],
      depth: 'province',
    };
  }

  return {
    segments,
    keywordSlug,
    depth: 'national',
  };
}

function buildKeywordPath(
  keywordSlug: string,
  context: RouteContext,
  override?: Partial<RouteContext>,
) {
  const nextContext = { ...context, ...override };
  const parts = [keywordSlug];

  if (nextContext.provinceSlug) {
    parts.push(nextContext.provinceSlug);
  }

  if (nextContext.citySlug) {
    parts.push(nextContext.citySlug);
  }

  if (nextContext.suburbSlug) {
    parts.push(nextContext.suburbSlug);
  }

  return `/${parts.join('/')}`;
}

function getContextProvinceName(context: RouteContext) {
  if (!context.provinceSlug) {
    return 'South Africa';
  }

  return getProvinceInfo(context.provinceSlug)?.name || slugToName(context.provinceSlug);
}

function getContextCityName(context: RouteContext) {
  if (!context.provinceSlug || !context.citySlug) {
    return null;
  }

  return (
    getCityInfo(context.provinceSlug, context.citySlug)?.name ||
    slugToName(context.citySlug)
  );
}

function pickRelatedKeywordSlugs(currentKeywordSlug: string) {
  const preferred = [
    'hair-salon',
    'nail-salon',
    'braiding',
    'barbershop',
    'makeup',
    'massage',
    'waxing',
    'spa',
  ];

  const merged = [...preferred, ...SEO_KEYWORDS];
  const unique = Array.from(new Set(merged));

  return unique
    .filter((slug) => slug !== currentKeywordSlug)
    .slice(0, 6);
}

function buildFallbackRelatedServices(context: RouteContext) {
  return pickRelatedKeywordSlugs(context.keywordSlug).map((keywordSlug) => ({
    label: `${slugToName(keywordSlug)} near ${buildLocationLabel(context)}`,
    url: buildKeywordPath(keywordSlug, context),
    type: 'service' as const,
  }));
}

function buildLocationLabel(context: RouteContext) {
  if (context.depth === 'suburb' && context.suburbSlug) {
    return slugToName(context.suburbSlug);
  }

  if (context.depth === 'city' && context.citySlug) {
    return getContextCityName(context) || slugToName(context.citySlug);
  }

  if (context.depth === 'province' && context.provinceSlug) {
    return getContextProvinceName(context);
  }

  return 'South Africa';
}

function buildFallbackNearbyLocations(context: RouteContext) {
  if (context.depth === 'national') {
    return Object.values(PROVINCES).slice(0, 8).map((province) => ({
      label: `${slugToName(context.keywordSlug)} in ${province.name}`,
      url: `/${context.keywordSlug}/${province.slug}`,
      type: 'location' as const,
    }));
  }

  if (context.depth === 'province' && context.provinceSlug) {
    const province = getProvinceInfo(context.provinceSlug);
    return (
      province?.cities.slice(0, 8).map((city) => ({
        label: `${slugToName(context.keywordSlug)} in ${city.name}`,
        url: `/${context.keywordSlug}/${context.provinceSlug}/${city.slug}`,
        type: 'location' as const,
      })) || []
    );
  }

  if (
    (context.depth === 'city' || context.depth === 'suburb') &&
    context.provinceSlug
  ) {
    const province = getProvinceInfo(context.provinceSlug);
    const currentCitySlug = context.citySlug;
    const siblingCities =
      province?.cities
        .filter((city) => city.slug !== currentCitySlug)
        .slice(0, context.depth === 'suburb' ? 5 : 7)
        .map((city) => ({
          label: `${slugToName(context.keywordSlug)} in ${city.name}`,
          url: `/${context.keywordSlug}/${context.provinceSlug}/${city.slug}`,
          type: 'location' as const,
        })) || [];

    const parentLinks = [
      {
        label: `${slugToName(context.keywordSlug)} in ${getContextProvinceName(
          context,
        )}`,
        url: `/${context.keywordSlug}/${context.provinceSlug}`,
        type: 'location' as const,
      },
    ];

    if (context.citySlug) {
      parentLinks.unshift({
        label: `${slugToName(context.keywordSlug)} in ${
          getContextCityName(context) || slugToName(context.citySlug)
        }`,
        url: `/${context.keywordSlug}/${context.provinceSlug}/${context.citySlug}`,
        type: 'location' as const,
      });
    }

    return [...parentLinks, ...siblingCities]
      .filter((link, index, array) => array.findIndex((item) => item.url === link.url) === index)
      .slice(0, 8);
  }

  return [];
}

function buildSectionParagraphs(
  heading: string,
  keyword: string,
  locationName: string,
  provinceName: string,
  serviceCount: number,
  salonCount: number,
  avgPrice?: number | null,
) {
  const keywordLower = keyword.toLowerCase();
  const supplyPhrase =
    serviceCount > 0 && salonCount > 0
      ? `${serviceCount} listed services across ${salonCount} salons and beauty professionals`
      : 'a growing mix of salons, studios, and mobile beauty professionals';

  if (/price|cost|affordable|budget/i.test(heading)) {
    return [
      avgPrice
        ? `Average pricing for ${keywordLower} in ${locationName} is currently around R${avgPrice.toFixed(0)}, although final cost usually depends on service complexity, add-ons, provider experience, and whether the appointment is mobile or in-salon.`
        : `Pricing for ${keywordLower} in ${locationName} varies from salon to salon, so it helps to compare listed menus, provider profiles, and service inclusions before choosing where to book.`,
      `Stylr SA is designed to make those comparisons easier by keeping ${keywordLower} results, location pages, and salon profiles connected, which helps users see the market more clearly in ${locationName} and the wider ${provinceName} area.`,
    ];
  }

  if (/book|appointment|online|near you/i.test(heading)) {
    return [
      `People searching for ${keywordLower} in ${locationName} usually want a provider they can trust, a location that suits their travel radius, and a booking path that does not send them back to a generic directory. This page keeps those search signals together.`,
      `Use the related service links to compare adjacent treatments, then follow the nearby area links if you want to expand the search beyond ${locationName} without losing the original ${keywordLower} intent.`,
    ];
  }

  if (/style|trend|option|popular/i.test(heading)) {
    return [
      `${locationName} search demand for ${keywordLower} often includes different service variations, specialist techniques, and mobile-friendly options. Strong salon pages make those differences clearer through service menus, galleries, and treatment descriptions.`,
      `That matters for SEO too: when users can move from a broad ${keywordLower} page into a more specific service or location page, Stylr SA creates a stronger topic cluster around ${keywordLower} in ${locationName}.`,
    ];
  }

  if (/why choose|best|top|recommended|rated/i.test(heading)) {
    return [
      `${locationName} already has ${supplyPhrase}, which gives searchers a better chance of finding providers that match their budget, service type, and preferred area.`,
      `The salons that stand out most usually combine clearer service menus, stronger trust signals, more complete profile information, and better local relevance for people searching ${keywordLower} in ${locationName}.`,
    ];
  }

  return [
    `This ${keywordLower} landing page for ${locationName} helps connect national, provincial, city, and township-level search intent to the salons and professionals already listed on Stylr SA.`,
    `If the first result set is not the right fit, use the internal links below to keep exploring ${keywordLower} in nearby areas of ${provinceName} without restarting your search.`,
  ];
}

function buildFaqItems(
  keyword: string,
  locationName: string,
  provinceName: string,
  serviceCount: number,
  salonCount: number,
  avgPrice?: number | null,
): FaqItem[] {
  const keywordLower = keyword.toLowerCase();
  const inventoryPhrase =
    serviceCount > 0 && salonCount > 0
      ? `${serviceCount} services across ${salonCount} listed salons and professionals`
      : 'a growing set of listed salons and professionals';

  return [
    {
      question: `How do I find the best ${keywordLower} in ${locationName}?`,
      answer: `Start by comparing providers with clear service menus, recent portfolio images, transparent pricing, and a location that works for you. Stylr SA groups ${keywordLower} results for ${locationName} so users can move from broad discovery to a more specific salon profile faster.`,
    },
    {
      question: `How much does ${keywordLower} cost in ${locationName}?`,
      answer: avgPrice
        ? `Current listed pricing averages around R${avgPrice.toFixed(0)}, but final cost can move up or down depending on the salon, the exact treatment, product choice, and whether the appointment is mobile or in-salon.`
        : `Pricing differs by salon and by treatment detail, so the best approach is to compare a few listed providers and check what is included in the quoted service.`,
    },
    {
      question: `Can I compare nearby ${keywordLower} options outside ${locationName}?`,
      answer: `Yes. This page links into related service and nearby location pages, so users can widen their search across ${provinceName} without leaving the ${keywordLower} journey. That makes it easier to compare ${inventoryPhrase} in one topic cluster.`,
    },
  ];
}

function buildFaqSchema(faqItems: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function combineSchema(schemaMarkup: unknown, faqItems: FaqItem[]) {
  if (!faqItems.length) {
    return schemaMarkup;
  }

  const faqSchema = buildFaqSchema(faqItems);

  if (!schemaMarkup) {
    return faqSchema;
  }

  return Array.isArray(schemaMarkup)
    ? [...schemaMarkup, faqSchema]
    : [schemaMarkup, faqSchema];
}

export default function CachedSeoLandingPage({
  pageData,
  keywordFallback,
  locationFallback,
  breadcrumbs,
  ctaButtonLink = '/salons',
}: {
  pageData: CachedSeoPageData;
  keywordFallback: string;
  locationFallback: string;
  breadcrumbs: Breadcrumb[];
  ctaButtonLink?: string;
}) {
  const keyword = pageData.keyword?.keyword || slugToName(keywordFallback);
  const locationName = pageData.location?.name || locationFallback;
  const currentPath = breadcrumbs[breadcrumbs.length - 1]?.url || `/${keywordFallback}`;
  const routeContext = parseRouteContext(currentPath);
  const provinceName = pageData.location?.province || getContextProvinceName(routeContext);
  const relatedServices =
    pageData.relatedServices && pageData.relatedServices.length > 0
      ? pageData.relatedServices.map((link) => ({
          ...link,
          type: 'service' as const,
        }))
      : buildFallbackRelatedServices(routeContext);
  const nearbyLocations =
    pageData.nearbyLocations && pageData.nearbyLocations.length > 0
      ? pageData.nearbyLocations.map((link) => ({
          ...link,
          type: 'location' as const,
        }))
      : buildFallbackNearbyLocations(routeContext);
  const faqItems = buildFaqItems(
    keyword,
    locationName,
    provinceName,
    pageData.serviceCount,
    pageData.salonCount,
    pageData.avgPrice,
  );
  const schemaMarkup = combineSchema(pageData.schemaMarkup, faqItems);

  return (
    <SEOLandingPage
      h1={pageData.h1}
      h2Headings={pageData.h2Headings}
      h3Headings={pageData.h3Headings}
      introText={pageData.introText}
      metaTitle={pageData.metaTitle}
      metaDescription={pageData.metaDescription}
      breadcrumbs={breadcrumbs}
      schemaMarkup={schemaMarkup}
      serviceCount={pageData.serviceCount}
      salonCount={pageData.salonCount}
      avgPrice={pageData.avgPrice ?? undefined}
      relatedServices={relatedServices}
      nearbyLocations={nearbyLocations}
      faqItems={faqItems}
      keyword={keyword}
      locationName={locationName}
      ctaButtonLink={ctaButtonLink}
      ctaButtonText={`Browse ${keyword} salons`}
    >
      {pageData.h2Headings.map((heading) => {
        const paragraphs = buildSectionParagraphs(
          heading,
          keyword,
          locationName,
          provinceName,
          pageData.serviceCount,
          pageData.salonCount,
          pageData.avgPrice,
        );

        return (
          <section key={heading} className={styles.contentSection}>
            <h2 className={styles.h2}>{heading}</h2>
            <div className={styles.sectionContent}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        );
      })}
    </SEOLandingPage>
  );
}
