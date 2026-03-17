import { getCityInfo, getProvinceInfo } from './locationData';
import { slugToName } from './seo-generation';

type KeywordLocationInput = {
  keyword: string;
  province?: string;
  city?: string;
  suburb?: string;
};

type SalonLocationInput = {
  province: string;
  city?: string;
};

export function buildKeywordLandingMetadata({
  keyword,
  province,
  city,
  suburb,
}: KeywordLocationInput) {
  const keywordName = slugToName(keyword);
  const keywordLabel = keywordName.toLowerCase();
  const provinceInfo = province ? getProvinceInfo(province) : null;
  const cityInfo = province && city ? getCityInfo(province, city) : null;

  const provinceName = provinceInfo?.name ?? (province ? slugToName(province) : null);
  const cityName = cityInfo?.name ?? (city ? slugToName(city) : null);
  const suburbName = suburb ? slugToName(suburb) : null;

  if (suburbName) {
    const suburbContext = [suburbName, cityName, provinceName].filter(Boolean).join(', ');
    return {
      title: `${keywordName} in ${suburbContext} | Stylr SA`,
      description: `Browse ${keywordLabel} services in ${suburbContext}. Discover salons and beauty professionals nearby and book with Stylr SA.`,
    };
  }

  if (cityName && provinceName) {
    return {
      title: `${keywordName} in ${cityName}, ${provinceName} | Stylr SA`,
      description: `Browse ${keywordLabel} services in ${cityName}, ${provinceName}. Discover salons and beauty professionals near ${cityName} and book with Stylr SA.`,
    };
  }

  if (provinceName) {
    return {
      title: `${keywordName} in ${provinceName} | Stylr SA`,
      description: `Browse ${keywordLabel} services in ${provinceName}. Discover salons and beauty professionals across the province and book with Stylr SA.`,
    };
  }

  return {
    title: `${keywordName} in South Africa | Stylr SA`,
    description: `Browse ${keywordLabel} services across South Africa. Discover salons and beauty professionals and book with Stylr SA.`,
  };
}

export function buildSalonLocationMetadata({ province, city }: SalonLocationInput) {
  const provinceInfo = getProvinceInfo(province);
  const cityInfo = city ? getCityInfo(province, city) : null;

  const provinceName = provinceInfo?.name ?? slugToName(province);
  const cityName = cityInfo?.name ?? (city ? slugToName(city) : null);

  if (cityName) {
    return {
      title: `Salons in ${cityName}, ${provinceName} | Stylr SA`,
      description: `Browse hair salons, nail salons, spas, and beauty services in ${cityName}, ${provinceName}. Discover local salons and book with Stylr SA.`,
    };
  }

  const nearbyCities = provinceInfo?.cities.slice(0, 3).map((entry) => entry.name).join(', ');
  const citySuffix = nearbyCities ? ` including ${nearbyCities}` : '';

  return {
    title: `Salons in ${provinceName} | Stylr SA`,
    description: `Browse hair salons, nail salons, spas, and beauty services in ${provinceName}${citySuffix}. Discover salons across the province and book with Stylr SA.`,
  };
}
