// Helper functions for generating "near you" content and SEO metadata

import { PROVINCES, getProvinceInfo, getCityInfo } from './locationData';

// Service category information for content generation
export const CATEGORY_INFO: Record<string, {
  name: string;
  serviceName: string;
  descriptionBase: string;
  keywords: string[];
}> = {
  'haircuts-styling': {
    name: 'Haircuts & Styling',
    serviceName: 'haircuts and styling',
    descriptionBase: 'Find expert hairstylists for cuts, styling, and transformations',
    keywords: ['haircut', 'hair styling', 'hairstylist', 'hair salon', 'barber', 'hair transformation', 'professional haircut'],
  },
  'hair-color-treatments': {
    name: 'Hair Color & Treatments',
    serviceName: 'hair coloring and treatments',
    descriptionBase: 'Professional hair coloring, highlights, balayage, and treatment services',
    keywords: ['hair color', 'hair dye', 'balayage', 'highlights', 'ombre', 'hair treatment', 'keratin treatment', 'colorist'],
  },
  'nail-care': {
    name: 'Nail Care',
    serviceName: 'nail care',
    descriptionBase: 'Professional nail services including manicures, pedicures, gel nails, acrylics, and custom nail art',
    keywords: ['nail salon', 'manicure', 'pedicure', 'gel nails', 'acrylic nails', 'nail art', 'nail technician', 'nail care'],
  },
  'skin-care-facials': {
    name: 'Skin Care & Facials',
    serviceName: 'skin care and facials',
    descriptionBase: 'Professional facial treatments, skin care consultations, and rejuvenating spa services',
    keywords: ['facial', 'skin care', 'esthetician', 'skin treatment', 'spa facial', 'anti-aging', 'acne treatment', 'skincare specialist'],
  },
  'massage-body-treatments': {
    name: 'Massage & Body Treatments',
    serviceName: 'massage and body treatments',
    descriptionBase: 'Relaxing massage therapy and body treatments',
    keywords: ['massage', 'body treatment', 'spa', 'massage therapy', 'wellness', 'relaxation', 'deep tissue', 'Swedish massage', 'hot stone'],
  },
  'makeup-beauty': {
    name: 'Makeup & Beauty',
    serviceName: 'makeup and beauty',
    descriptionBase: 'Professional makeup artists for special events, bridal makeup, editorial looks, and beauty services',
    keywords: ['makeup artist', 'beauty services', 'bridal makeup', 'special event makeup', 'professional makeup', 'makeup application', 'beauty specialist'],
  },
  'waxing-hair-removal': {
    name: 'Waxing & Hair Removal',
    serviceName: 'waxing and hair removal',
    descriptionBase: 'Professional waxing and hair removal services',
    keywords: ['waxing', 'hair removal', 'Brazilian wax', 'laser hair removal', 'body waxing', 'threading', 'wax specialist'],
  },
  'braiding-weaving': {
    name: 'Braiding & Weaving',
    serviceName: 'braiding and weaving',
    descriptionBase: 'Professional braiding and weaving specialists for box braids, cornrows, Ghana braids, crochet braids, and hair extensions',
    keywords: ['braiding', 'hair braiding', 'box braids', 'cornrows', 'Ghana braids', 'weaving', 'hair extensions', 'braider', 'crochet braids'],
  },
  'mens-grooming': {
    name: "Men's Grooming",
    serviceName: "men's grooming",
    descriptionBase: "Professional men's grooming services including haircuts, beard trims, hot towel shaves, and styling",
    keywords: ["men's grooming", 'barber', "men's haircut", 'beard trim', 'hot shave', 'male grooming', 'barber shop'],
  },
  'bridal-services': {
    name: 'Bridal Services',
    serviceName: 'bridal services',
    descriptionBase: 'Professional bridal hair, makeup, and beauty services for your special day',
    keywords: ['bridal services', 'wedding hair', 'wedding makeup', 'bridal makeup artist', 'bridal hairstylist', 'wedding beauty', 'bridal package'],
  },
  'wig-installations': {
    name: 'Wig Installations',
    serviceName: 'wig installations',
    descriptionBase: 'Professional wig installation and styling services',
    keywords: ['wig installation', 'wig', 'wigs', 'wig specialist', 'wig stylist', 'lace front wig', 'full lace wig', 'wig fitting', 'wig customization', 'wig services'],
  },
  'natural-hair-specialists': {
    name: 'Natural Hair Specialists',
    serviceName: 'natural hair specialists',
    descriptionBase: 'Professional natural hair specialists offering treatments, styling, cuts, and consultations',
    keywords: ['natural hair salon', 'natural hair specialist', '4c hair specialist', 'natural hair treatments', 'silk press', 'wash and go', 'twist out', 'braid out', 'protective styles', 'curly cut', 'deva cut', 'natural hair consultation'],
  },
  'lashes-brows': {
    name: 'Lashes & Brows',
    serviceName: 'lashes and brows',
    descriptionBase: 'Professional lash extensions and brow services',
    keywords: ['lash extensions', 'microblading', 'brow specialist', 'volume lashes', 'hybrid lashes', 'lash lift and tint', 'brow lamination', 'henna brows', 'lash bar', 'brow bar', 'eyebrow artist'],
  },
  'aesthetics-advanced-skin': {
    name: 'Aesthetics & Advanced Skin',
    serviceName: 'aesthetics and advanced skin treatments',
    descriptionBase: 'Advanced skin treatments and aesthetic procedures',
    keywords: ['aesthetics clinic', 'med-spa', 'microneedling', 'chemical peel', 'Botox', 'dermal fillers', 'laser hair removal', 'dermaplaning', 'IV drip therapy', 'skin clinic', 'anti-aging treatments'],
  },
  'tattoos-piercings': {
    name: 'Tattoos & Piercings',
    serviceName: 'tattoos and piercings',
    descriptionBase: 'Professional tattoo artists and piercing studios',
    keywords: ['tattoo artist', 'tattoo studio', 'custom tattoo', 'fine-line tattoo', 'portrait tattoo', 'body piercing', 'ear piercing', 'nose piercing', 'piercing studio', 'tattoo removal'],
  },
  'wellness-holistic-spa': {
    name: 'Wellness & Holistic Spa',
    serviceName: 'wellness and holistic spa',
    descriptionBase: 'Holistic wellness and spa experiences',
    keywords: ['wellness centre', 'holistic spa', 'massage therapy', 'reflexology', 'reiki healing', 'energy healing', 'sauna', 'steam room', 'flotation therapy', 'spa day package', 'self-care'],
  },
};

/**
 * Generate title for a "near you" page
 */
export function generateNearYouTitle(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): string {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  if (category && city) {
    return `${category.name} in ${city.name}, ${city.province} | Stylr SA`;
  } else if (category && province) {
    return `${category.name} in ${province.name} | Stylr SA`;
  } else if (category) {
    return `${category.name} in South Africa | Stylr SA`;
  } else if (city) {
    return `Salons in ${city.name}, ${city.province} | Stylr SA`;
  } else if (province) {
    return `Salons in ${province.name} | Stylr SA`;
  }
  return 'Salons in South Africa | Stylr SA';
}

/**
 * Generate H1 heading for a "near you" page
 */
export function generateNearYouH1(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): string {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  if (category && city) {
    return `${category.name} in ${city.name}`;
  } else if (category && province) {
    return `${category.name} in ${province.name}`;
  } else if (category) {
    return `${category.name} in South Africa`;
  } else if (city) {
    return `Salons in ${city.name}`;
  } else if (province) {
    return `Salons in ${province.name}`;
  }
  return 'Salons in South Africa';
}

/**
 * Generate meta description for a "near you" page
 */
export function generateNearYouDescription(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): string {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  if (category && city) {
    const serviceName = category.serviceName;
    let description = `Browse ${serviceName} services in ${city.name}, ${city.province}. ${category.descriptionBase}.`;
    
    // Add popular areas if available
    if (city.popularAreas && city.popularAreas.length > 0) {
      const areas = city.popularAreas.slice(0, 2).join(' and ');
      description += ` Discover providers in ${areas} and throughout ${city.name}.`;
    } else {
      description += ` Discover salons and beauty professionals across ${city.name}.`;
    }
    
    return description;
  } else if (category && province) {
    const serviceName = category.serviceName;
    const cityNames = province.cities.slice(0, 3).map(c => c.name).join(', ');
    return `Browse ${serviceName} services in ${province.name}. ${category.descriptionBase}. Discover salons in ${cityNames} and surrounding areas.`;
  } else if (category) {
    const serviceName = category.serviceName;
    return `Browse ${serviceName} services across South Africa. ${category.descriptionBase}. Discover salons and beauty professionals around the country.`;
  } else if (city) {
    let description = `Browse salons, nail salons, spas, and beauty services in ${city.name}, ${city.province}.`;
    
    // Add popular areas if available
    if (city.popularAreas && city.popularAreas.length > 0) {
      const areas = city.popularAreas.slice(0, 2).join(' and ');
      description += ` Discover salons in ${areas} and throughout ${city.name}.`;
    } else {
      description += ` Discover hair salons, nail studios, barbershops, and wellness centers nearby.`;
    }
    
    return description;
  } else if (province) {
    const cityNames = province.cities.slice(0, 3).map(c => c.name).join(', ');
    return `Browse salons, nail salons, spas, and beauty services in ${province.name}. Discover establishments in ${cityNames} and surrounding areas.`;
  }
  return 'Browse salons, nail salons, spas, and beauty services across South Africa. Discover salons and beauty professionals around the country.';
}

/**
 * Generate content paragraph for a "near you" page
 */
export function generateNearYouContent(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): string {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  if (category && city) {
    const serviceName = category.serviceName;
    let content = `Discover the best ${serviceName} services near you in ${city.name}, ${city.province}. Our network of top-rated salons and beauty professionals offers exceptional ${serviceName} services.`;
    
    // Add popular areas if available
    if (city.popularAreas && city.popularAreas.length > 0) {
      const areas = city.popularAreas.slice(0, 3).join(', ');
      content += ` Find top-rated professionals in ${areas} and throughout ${city.name}.`;
    }
    
    content += ` Whether you're looking for quality service, expert professionals, or convenient locations, we make it easy to find and book the best ${serviceName} near you in ${city.name}.`;
    return content;
  } else if (category && province) {
    const serviceName = category.serviceName;
    const majorCities = province.cities.slice(0, 3).map(c => c.name).join(', ');
    return `Discover the best ${serviceName} services near you in ${province.name}. Our network of top-rated salons and beauty professionals offers exceptional ${serviceName} services across ${province.name}, including ${majorCities} and surrounding areas. Whether you're looking for quality service, expert professionals, or convenient locations, we make it easy to find and book the best ${serviceName} near you.`;
  } else if (category) {
    const serviceName = category.serviceName;
    return `Discover the best ${serviceName} services near you in South Africa. Our network of top-rated salons and beauty professionals offers exceptional ${serviceName} services. Whether you're looking for quality service, expert professionals, or convenient locations, we make it easy to find and book the best ${serviceName} near you.`;
  } else if (city) {
    let content = `Discover the best salons, nail salons, spas, and beauty services near you in ${city.name}, ${city.province}. Our network of top-rated establishments offers exceptional beauty and wellness services.`;
    
    // Add popular areas if available
    if (city.popularAreas && city.popularAreas.length > 0) {
      const areas = city.popularAreas.slice(0, 3).join(', ');
      content += ` Find top-rated salons in ${areas} and throughout ${city.name}.`;
    }
    
    content += ` Whether you're looking for hair salons, nail studios, barbershops, or wellness centers, we make it easy to find and book the best services near you in ${city.name}.`;
    return content;
  } else if (province) {
    const majorCities = province.cities.slice(0, 3).map(c => c.name).join(', ');
    return `Discover the best salons, nail salons, spas, and beauty services near you in ${province.name}. Our network of top-rated establishments offers exceptional beauty and wellness services across ${province.name}, including ${majorCities} and surrounding areas. Whether you're looking for hair salons, nail studios, barbershops, or wellness centers, we make it easy to find and book the best services near you.`;
  }
  return 'Discover the best salons, nail salons, spas, and beauty services near you in South Africa. Our network of top-rated establishments offers exceptional beauty and wellness services. Whether you\'re looking for hair salons, nail studios, barbershops, or wellness centers, we make it easy to find and book the best services near you.';
}

/**
 * Generate keywords for a "near you" page
 */
export function generateNearYouKeywords(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): string {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  const keywords: string[] = [];

  // Add category keywords
  if (category) {
    keywords.push(...category.keywords);
  } else {
    keywords.push('salons', 'beauty salon', 'hair salon', 'nail salon', 'spa', 'barbershop');
  }

  // Add location keywords
  if (city) {
    keywords.push(
      `${category ? category.serviceName : 'salons'} near you ${city.name}`,
      `${category ? category.serviceName : 'salons'} near me ${city.name}`,
      `best ${category ? category.serviceName : 'salons'} ${city.name}`,
      ...city.keywords
    );
  } else if (province) {
    keywords.push(
      `${category ? category.serviceName : 'salons'} near you ${province.name}`,
      `${category ? category.serviceName : 'salons'} near me ${province.name}`,
      ...province.keywords
    );
  } else {
    keywords.push(
      `${category ? category.serviceName : 'salons'} near you`,
      `${category ? category.serviceName : 'salons'} near me`,
      `${category ? category.serviceName : 'salons'} South Africa`
    );
  }

  // Add "near you" variations
  keywords.push('near you', 'near me', 'local', 'South Africa');

  return keywords.join(', ');
}

/**
 * Get all service category slugs
 */
export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORY_INFO);
}

/**
 * Get all province slugs
 */
export function getAllProvinceSlugs(): string[] {
  return Object.keys(PROVINCES);
}

