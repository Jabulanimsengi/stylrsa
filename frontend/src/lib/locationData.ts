/**
 * Consolidated Location Data for SEO
 * Source of Truth: syncs with backend/src/locations/locations.data.ts
 */

export interface City {
  slug: string;
  name: string;
  province: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  popularAreas?: string[];
}

export interface Province {
  slug: string;
  name: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  cities: City[];
}

export type CityInfo = City;
export type ProvinceInfo = Province;

export interface LocationData {
  [key: string]: Province;
}

export function findCityBySlug(slug: string): { city: City; provinceSlug: string } | null {
  for (const [provinceSlug, province] of Object.entries(PROVINCES)) {
    const city = province.cities.find((c) => c.slug === slug);
    if (city) {
      return { city, provinceSlug };
    }
  }
  return null;
}

export function getProvinceInfo(slug: string): Province | null {
  return PROVINCES[slug] || null;
}

export function getCityInfo(provinceSlug: string, citySlug: string): City | null {
  const province = PROVINCES[provinceSlug];
  if (!province) return null;
  return province.cities.find((c) => c.slug === citySlug) || null;
}

export const PROVINCES: LocationData = {
  "kwazulu-natal": {
    "slug": "kwazulu-natal",
    "name": "KwaZulu-Natal",
    "description": "Find top-rated salons and spas in KwaZulu-Natal. Book appointments at the best hair salons, nail studios, and wellness centers in Durban, Pietermaritzburg, and Ballito.",
    "metaTitle": "KwaZulu-Natal Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in KwaZulu-Natal. Book hair, nail, and beauty appointments at the best salons in KwaZulu-Natal.",
    "keywords": [
      "KwaZulu-Natal salons",
      "KwaZulu-Natal hair salons"
    ],
    "cities": [
      {
        "slug": "adams-mission",
        "name": "Adams Mission",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Adams Mission. Book hair salons, nail studios, and beauty services in Adams Mission, KwaZulu-Natal.",
        "metaTitle": "Adams Mission Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Adams Mission, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Adams Mission salons",
          "Adams Mission hair salon",
          "beauty salon Adams Mission",
          "nails Adams Mission"
        ]
      },
      {
        "slug": "amahlongwa",
        "name": "Amahlongwa",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Amahlongwa. Book hair salons, nail studios, and beauty services in Amahlongwa, KwaZulu-Natal.",
        "metaTitle": "Amahlongwa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Amahlongwa, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Amahlongwa salons",
          "Amahlongwa hair salon",
          "beauty salon Amahlongwa",
          "nails Amahlongwa"
        ]
      },
      {
        "slug": "amandawe",
        "name": "Amandawe",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Amandawe. Book hair salons, nail studios, and beauty services in Amandawe, KwaZulu-Natal.",
        "metaTitle": "Amandawe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Amandawe, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Amandawe salons",
          "Amandawe hair salon",
          "beauty salon Amandawe",
          "nails Amandawe"
        ]
      },
      {
        "slug": "amanzimtoti",
        "name": "Amanzimtoti",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Amanzimtoti. Book hair salons, nail studios, and beauty services in Amanzimtoti, KwaZulu-Natal.",
        "metaTitle": "Amanzimtoti Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Amanzimtoti, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Amanzimtoti salons",
          "Amanzimtoti hair salon",
          "beauty salon Amanzimtoti",
          "nails Amanzimtoti"
        ]
      },
      {
        "slug": "anerley",
        "name": "Anerley",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Anerley. Book hair salons, nail studios, and beauty services in Anerley, KwaZulu-Natal.",
        "metaTitle": "Anerley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Anerley, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Anerley salons",
          "Anerley hair salon",
          "beauty salon Anerley",
          "nails Anerley"
        ]
      },
      {
        "slug": "assagay",
        "name": "Assagay",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Assagay. Book hair salons, nail studios, and beauty services in Assagay, KwaZulu-Natal.",
        "metaTitle": "Assagay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Assagay, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Assagay salons",
          "Assagay hair salon",
          "beauty salon Assagay",
          "nails Assagay"
        ]
      },
      {
        "slug": "babanango",
        "name": "Babanango",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Babanango. Book hair salons, nail studios, and beauty services in Babanango, KwaZulu-Natal.",
        "metaTitle": "Babanango Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Babanango, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Babanango salons",
          "Babanango hair salon",
          "beauty salon Babanango",
          "nails Babanango"
        ]
      },
      {
        "slug": "balgowan",
        "name": "Balgowan",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Balgowan. Book hair salons, nail studios, and beauty services in Balgowan, KwaZulu-Natal.",
        "metaTitle": "Balgowan Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Balgowan, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Balgowan salons",
          "Balgowan hair salon",
          "beauty salon Balgowan",
          "nails Balgowan"
        ]
      },
      {
        "slug": "ballito",
        "name": "Ballito",
        "province": "KwaZulu-Natal",
        "description": "Discover beauty services in Ballito. Book hair and spa treatments on the Dolphin Coast.",
        "metaTitle": "Ballito Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ballito, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ballito salons",
          "Ballito hair salon",
          "beauty salon Ballito",
          "nails Ballito"
        ]
      },
      {
        "slug": "bazley-beach",
        "name": "Bazley Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Bazley Beach. Book hair salons, nail studios, and beauty services in Bazley Beach, KwaZulu-Natal.",
        "metaTitle": "Bazley Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bazley Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bazley Beach salons",
          "Bazley Beach hair salon",
          "beauty salon Bazley Beach",
          "nails Bazley Beach"
        ]
      },
      {
        "slug": "bergville",
        "name": "Bergville",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Bergville. Book hair salons, nail studios, and beauty services in Bergville, KwaZulu-Natal.",
        "metaTitle": "Bergville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bergville, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bergville salons",
          "Bergville hair salon",
          "beauty salon Bergville",
          "nails Bergville"
        ]
      },
      {
        "slug": "boston",
        "name": "Boston",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Boston. Book hair salons, nail studios, and beauty services in Boston, KwaZulu-Natal.",
        "metaTitle": "Boston Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Boston, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Boston salons",
          "Boston hair salon",
          "beauty salon Boston",
          "nails Boston"
        ]
      },
      {
        "slug": "bothas-hill",
        "name": "Botha's Hill",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Botha's Hill. Book hair salons, nail studios, and beauty services in Botha's Hill, KwaZulu-Natal.",
        "metaTitle": "Botha's Hill Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Botha's Hill, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Botha's Hill salons",
          "Botha's Hill hair salon",
          "beauty salon Botha's Hill",
          "nails Botha's Hill"
        ]
      },
      {
        "slug": "bulwer",
        "name": "Bulwer",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Bulwer. Book hair salons, nail studios, and beauty services in Bulwer, KwaZulu-Natal.",
        "metaTitle": "Bulwer Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bulwer, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bulwer salons",
          "Bulwer hair salon",
          "beauty salon Bulwer",
          "nails Bulwer"
        ]
      },
      {
        "slug": "cato-ridge",
        "name": "Cato Ridge",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Cato Ridge. Book hair salons, nail studios, and beauty services in Cato Ridge, KwaZulu-Natal.",
        "metaTitle": "Cato Ridge Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cato Ridge, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cato Ridge salons",
          "Cato Ridge hair salon",
          "beauty salon Cato Ridge",
          "nails Cato Ridge"
        ]
      },
      {
        "slug": "charlestown",
        "name": "Charlestown",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Charlestown. Book hair salons, nail studios, and beauty services in Charlestown, KwaZulu-Natal.",
        "metaTitle": "Charlestown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Charlestown, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Charlestown salons",
          "Charlestown hair salon",
          "beauty salon Charlestown",
          "nails Charlestown"
        ]
      },
      {
        "slug": "chatsworth",
        "name": "Chatsworth",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Chatsworth. Book hair salons, nail studios, and beauty services in Chatsworth, KwaZulu-Natal.",
        "metaTitle": "Chatsworth Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Chatsworth, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Chatsworth salons",
          "Chatsworth hair salon",
          "beauty salon Chatsworth",
          "nails Chatsworth"
        ]
      },
      {
        "slug": "clermont",
        "name": "Clermont",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Clermont. Book hair salons, nail studios, and beauty services in Clermont, KwaZulu-Natal.",
        "metaTitle": "Clermont Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Clermont, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Clermont salons",
          "Clermont hair salon",
          "beauty salon Clermont",
          "nails Clermont"
        ]
      },
      {
        "slug": "colenso",
        "name": "Colenso",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Colenso. Book hair salons, nail studios, and beauty services in Colenso, KwaZulu-Natal.",
        "metaTitle": "Colenso Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Colenso, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Colenso salons",
          "Colenso hair salon",
          "beauty salon Colenso",
          "nails Colenso"
        ]
      },
      {
        "slug": "dalton",
        "name": "Dalton",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Dalton. Book hair salons, nail studios, and beauty services in Dalton, KwaZulu-Natal.",
        "metaTitle": "Dalton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dalton, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dalton salons",
          "Dalton hair salon",
          "beauty salon Dalton",
          "nails Dalton"
        ]
      },
      {
        "slug": "dannhauserekuphakameni",
        "name": "DannhauserekuPhakameni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in DannhauserekuPhakameni. Book hair salons, nail studios, and beauty services in DannhauserekuPhakameni, KwaZulu-Natal.",
        "metaTitle": "DannhauserekuPhakameni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in DannhauserekuPhakameni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "DannhauserekuPhakameni salons",
          "DannhauserekuPhakameni hair salon",
          "beauty salon DannhauserekuPhakameni",
          "nails DannhauserekuPhakameni"
        ]
      },
      {
        "slug": "dududu",
        "name": "Dududu",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Dududu. Book hair salons, nail studios, and beauty services in Dududu, KwaZulu-Natal.",
        "metaTitle": "Dududu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dududu, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dududu salons",
          "Dududu hair salon",
          "beauty salon Dududu",
          "nails Dududu"
        ]
      },
      {
        "slug": "dundee",
        "name": "Dundee",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Dundee. Book hair salons, nail studios, and beauty services in Dundee, KwaZulu-Natal.",
        "metaTitle": "Dundee Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dundee, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dundee salons",
          "Dundee hair salon",
          "beauty salon Dundee",
          "nails Dundee"
        ]
      },
      {
        "slug": "durban",
        "name": "Durban",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Durban. Book hair salons, nail studios, and beauty services in eThekwini.",
        "metaTitle": "Durban Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Durban, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Durban salons",
          "Durban hair salon",
          "beauty salon Durban",
          "nails Durban"
        ]
      },
      {
        "slug": "elandslaagte",
        "name": "Elandslaagte",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Elandslaagte. Book hair salons, nail studios, and beauty services in Elandslaagte, KwaZulu-Natal.",
        "metaTitle": "Elandslaagte Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elandslaagte, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elandslaagte salons",
          "Elandslaagte hair salon",
          "beauty salon Elandslaagte",
          "nails Elandslaagte"
        ]
      },
      {
        "slug": "emadlangeni",
        "name": "Emadlangeni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Emadlangeni. Book hair salons, nail studios, and beauty services in Emadlangeni, KwaZulu-Natal.",
        "metaTitle": "Emadlangeni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Emadlangeni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Emadlangeni salons",
          "Emadlangeni hair salon",
          "beauty salon Emadlangeni",
          "nails Emadlangeni"
        ]
      },
      {
        "slug": "estcourt",
        "name": "Estcourt",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Estcourt. Book hair salons, nail studios, and beauty services in Estcourt, KwaZulu-Natal.",
        "metaTitle": "Estcourt Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Estcourt, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Estcourt salons",
          "Estcourt hair salon",
          "beauty salon Estcourt",
          "nails Estcourt"
        ]
      },
      {
        "slug": "franklin",
        "name": "Franklin",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Franklin. Book hair salons, nail studios, and beauty services in Franklin, KwaZulu-Natal.",
        "metaTitle": "Franklin Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Franklin, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Franklin salons",
          "Franklin hair salon",
          "beauty salon Franklin",
          "nails Franklin"
        ]
      },
      {
        "slug": "gamalakhe",
        "name": "Gamalakhe",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Gamalakhe. Book hair salons, nail studios, and beauty services in Gamalakhe, KwaZulu-Natal.",
        "metaTitle": "Gamalakhe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gamalakhe, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gamalakhe salons",
          "Gamalakhe hair salon",
          "beauty salon Gamalakhe",
          "nails Gamalakhe"
        ]
      },
      {
        "slug": "gillitts",
        "name": "Gillitts",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Gillitts. Book hair salons, nail studios, and beauty services in Gillitts, KwaZulu-Natal.",
        "metaTitle": "Gillitts Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gillitts, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gillitts salons",
          "Gillitts hair salon",
          "beauty salon Gillitts",
          "nails Gillitts"
        ]
      },
      {
        "slug": "glencoe",
        "name": "Glencoe",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Glencoe. Book hair salons, nail studios, and beauty services in Glencoe, KwaZulu-Natal.",
        "metaTitle": "Glencoe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Glencoe, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Glencoe salons",
          "Glencoe hair salon",
          "beauty salon Glencoe",
          "nails Glencoe"
        ]
      },
      {
        "slug": "greytown",
        "name": "Greytown",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Greytown. Book hair salons, nail studios, and beauty services in Greytown, KwaZulu-Natal.",
        "metaTitle": "Greytown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Greytown, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Greytown salons",
          "Greytown hair salon",
          "beauty salon Greytown",
          "nails Greytown"
        ]
      },
      {
        "slug": "groutville",
        "name": "Groutville",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Groutville. Book hair salons, nail studios, and beauty services in Groutville, KwaZulu-Natal.",
        "metaTitle": "Groutville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Groutville, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Groutville salons",
          "Groutville hair salon",
          "beauty salon Groutville",
          "nails Groutville"
        ]
      },
      {
        "slug": "harding",
        "name": "Harding",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Harding. Book hair salons, nail studios, and beauty services in Harding, KwaZulu-Natal.",
        "metaTitle": "Harding Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Harding, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Harding salons",
          "Harding hair salon",
          "beauty salon Harding",
          "nails Harding"
        ]
      },
      {
        "slug": "hattingspruit",
        "name": "Hattingspruit",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Hattingspruit. Book hair salons, nail studios, and beauty services in Hattingspruit, KwaZulu-Natal.",
        "metaTitle": "Hattingspruit Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hattingspruit, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hattingspruit salons",
          "Hattingspruit hair salon",
          "beauty salon Hattingspruit",
          "nails Hattingspruit"
        ]
      },
      {
        "slug": "hibberdene",
        "name": "Hibberdene",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Hibberdene. Book hair salons, nail studios, and beauty services in Hibberdene, KwaZulu-Natal.",
        "metaTitle": "Hibberdene Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hibberdene, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hibberdene salons",
          "Hibberdene hair salon",
          "beauty salon Hibberdene",
          "nails Hibberdene"
        ]
      },
      {
        "slug": "hillcrest",
        "name": "Hillcrest",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Hillcrest. Book hair salons, nail studios, and beauty services in Hillcrest, KwaZulu-Natal.",
        "metaTitle": "Hillcrest Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hillcrest, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hillcrest salons",
          "Hillcrest hair salon",
          "beauty salon Hillcrest",
          "nails Hillcrest"
        ]
      },
      {
        "slug": "hilton",
        "name": "Hilton",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Hilton. Book hair salons, nail studios, and beauty services in Hilton, KwaZulu-Natal.",
        "metaTitle": "Hilton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hilton, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hilton salons",
          "Hilton hair salon",
          "beauty salon Hilton",
          "nails Hilton"
        ]
      },
      {
        "slug": "himeville",
        "name": "Himeville",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Himeville. Book hair salons, nail studios, and beauty services in Himeville, KwaZulu-Natal.",
        "metaTitle": "Himeville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Himeville, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Himeville salons",
          "Himeville hair salon",
          "beauty salon Himeville",
          "nails Himeville"
        ]
      },
      {
        "slug": "hluhluwe",
        "name": "Hluhluwe",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Hluhluwe. Book hair salons, nail studios, and beauty services in Hluhluwe, KwaZulu-Natal.",
        "metaTitle": "Hluhluwe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hluhluwe, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hluhluwe salons",
          "Hluhluwe hair salon",
          "beauty salon Hluhluwe",
          "nails Hluhluwe"
        ]
      },
      {
        "slug": "howick",
        "name": "Howick",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Howick. Book hair salons, nail studios, and beauty services in Howick, KwaZulu-Natal.",
        "metaTitle": "Howick Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Howick, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Howick salons",
          "Howick hair salon",
          "beauty salon Howick",
          "nails Howick"
        ]
      },
      {
        "slug": "ifafa-beach",
        "name": "Ifafa Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ifafa Beach. Book hair salons, nail studios, and beauty services in Ifafa Beach, KwaZulu-Natal.",
        "metaTitle": "Ifafa Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ifafa Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ifafa Beach salons",
          "Ifafa Beach hair salon",
          "beauty salon Ifafa Beach",
          "nails Ifafa Beach"
        ]
      },
      {
        "slug": "inanda",
        "name": "Inanda",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Inanda. Book hair salons, nail studios, and beauty services in Inanda, KwaZulu-Natal.",
        "metaTitle": "Inanda Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Inanda, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Inanda salons",
          "Inanda hair salon",
          "beauty salon Inanda",
          "nails Inanda"
        ]
      },
      {
        "slug": "inchanga",
        "name": "Inchanga",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Inchanga. Book hair salons, nail studios, and beauty services in Inchanga, KwaZulu-Natal.",
        "metaTitle": "Inchanga Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Inchanga, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Inchanga salons",
          "Inchanga hair salon",
          "beauty salon Inchanga",
          "nails Inchanga"
        ]
      },
      {
        "slug": "ingwavuma",
        "name": "Ingwavuma",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ingwavuma. Book hair salons, nail studios, and beauty services in Ingwavuma, KwaZulu-Natal.",
        "metaTitle": "Ingwavuma Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ingwavuma, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ingwavuma salons",
          "Ingwavuma hair salon",
          "beauty salon Ingwavuma",
          "nails Ingwavuma"
        ]
      },
      {
        "slug": "isipingo",
        "name": "Isipingo",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Isipingo. Book hair salons, nail studios, and beauty services in Isipingo, KwaZulu-Natal.",
        "metaTitle": "Isipingo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Isipingo, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Isipingo salons",
          "Isipingo hair salon",
          "beauty salon Isipingo",
          "nails Isipingo"
        ]
      },
      {
        "slug": "izingolweni",
        "name": "Izingolweni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Izingolweni. Book hair salons, nail studios, and beauty services in Izingolweni, KwaZulu-Natal.",
        "metaTitle": "Izingolweni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Izingolweni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Izingolweni salons",
          "Izingolweni hair salon",
          "beauty salon Izingolweni",
          "nails Izingolweni"
        ]
      },
      {
        "slug": "izotsha",
        "name": "Izotsha",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Izotsha. Book hair salons, nail studios, and beauty services in Izotsha, KwaZulu-Natal.",
        "metaTitle": "Izotsha Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Izotsha, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Izotsha salons",
          "Izotsha hair salon",
          "beauty salon Izotsha",
          "nails Izotsha"
        ]
      },
      {
        "slug": "jozini",
        "name": "Jozini",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Jozini. Book hair salons, nail studios, and beauty services in Jozini, KwaZulu-Natal.",
        "metaTitle": "Jozini Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jozini, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jozini salons",
          "Jozini hair salon",
          "beauty salon Jozini",
          "nails Jozini"
        ]
      },
      {
        "slug": "kelso",
        "name": "Kelso",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kelso. Book hair salons, nail studios, and beauty services in Kelso, KwaZulu-Natal.",
        "metaTitle": "Kelso Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kelso, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kelso salons",
          "Kelso hair salon",
          "beauty salon Kelso",
          "nails Kelso"
        ]
      },
      {
        "slug": "kingsburgh",
        "name": "Kingsburgh",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kingsburgh. Book hair salons, nail studios, and beauty services in Kingsburgh, KwaZulu-Natal.",
        "metaTitle": "Kingsburgh Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kingsburgh, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kingsburgh salons",
          "Kingsburgh hair salon",
          "beauty salon Kingsburgh",
          "nails Kingsburgh"
        ]
      },
      {
        "slug": "kingsley",
        "name": "Kingsley",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kingsley. Book hair salons, nail studios, and beauty services in Kingsley, KwaZulu-Natal.",
        "metaTitle": "Kingsley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kingsley, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kingsley salons",
          "Kingsley hair salon",
          "beauty salon Kingsley",
          "nails Kingsley"
        ]
      },
      {
        "slug": "kloof",
        "name": "Kloof",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kloof. Book hair salons, nail studios, and beauty services in Kloof, KwaZulu-Natal.",
        "metaTitle": "Kloof Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kloof, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kloof salons",
          "Kloof hair salon",
          "beauty salon Kloof",
          "nails Kloof"
        ]
      },
      {
        "slug": "kokstad",
        "name": "Kokstad",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kokstad. Book hair salons, nail studios, and beauty services in Kokstad, KwaZulu-Natal.",
        "metaTitle": "Kokstad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kokstad, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kokstad salons",
          "Kokstad hair salon",
          "beauty salon Kokstad",
          "nails Kokstad"
        ]
      },
      {
        "slug": "kosi-bay-town",
        "name": "Kosi Bay town",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kosi Bay town. Book hair salons, nail studios, and beauty services in Kosi Bay town, KwaZulu-Natal.",
        "metaTitle": "Kosi Bay town Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kosi Bay town, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kosi Bay town salons",
          "Kosi Bay town hair salon",
          "beauty salon Kosi Bay town",
          "nails Kosi Bay town"
        ]
      },
      {
        "slug": "kranskop",
        "name": "Kranskop",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Kranskop. Book hair salons, nail studios, and beauty services in Kranskop, KwaZulu-Natal.",
        "metaTitle": "Kranskop Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kranskop, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kranskop salons",
          "Kranskop hair salon",
          "beauty salon Kranskop",
          "nails Kranskop"
        ]
      },
      {
        "slug": "kwacele",
        "name": "KwaCele",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in KwaCele. Book hair salons, nail studios, and beauty services in KwaCele, KwaZulu-Natal.",
        "metaTitle": "KwaCele Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in KwaCele, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "KwaCele salons",
          "KwaCele hair salon",
          "beauty salon KwaCele",
          "nails KwaCele"
        ]
      },
      {
        "slug": "kwamakhutha",
        "name": "KwaMakhutha",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in KwaMakhutha. Book hair salons, nail studios, and beauty services in KwaMakhutha, KwaZulu-Natal.",
        "metaTitle": "KwaMakhutha Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in KwaMakhutha, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "KwaMakhutha salons",
          "KwaMakhutha hair salon",
          "beauty salon KwaMakhutha",
          "nails KwaMakhutha"
        ]
      },
      {
        "slug": "kwamashu",
        "name": "KwaMashu",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in KwaMashu. Book hair salons, nail studios, and beauty services in KwaMashu, KwaZulu-Natal.",
        "metaTitle": "KwaMashu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in KwaMashu, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "KwaMashu salons",
          "KwaMashu hair salon",
          "beauty salon KwaMashu",
          "nails KwaMashu"
        ]
      },
      {
        "slug": "la-mercy",
        "name": "La Mercy",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in La Mercy. Book hair salons, nail studios, and beauty services in La Mercy, KwaZulu-Natal.",
        "metaTitle": "La Mercy Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in La Mercy, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "La Mercy salons",
          "La Mercy hair salon",
          "beauty salon La Mercy",
          "nails La Mercy"
        ]
      },
      {
        "slug": "ladysmith",
        "name": "Ladysmith",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ladysmith. Book hair salons, nail studios, and beauty services in Ladysmith, KwaZulu-Natal.",
        "metaTitle": "Ladysmith Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ladysmith, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ladysmith salons",
          "Ladysmith hair salon",
          "beauty salon Ladysmith",
          "nails Ladysmith"
        ]
      },
      {
        "slug": "leisure-bay",
        "name": "Leisure Bay",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Leisure Bay. Book hair salons, nail studios, and beauty services in Leisure Bay, KwaZulu-Natal.",
        "metaTitle": "Leisure Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Leisure Bay, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Leisure Bay salons",
          "Leisure Bay hair salon",
          "beauty salon Leisure Bay",
          "nails Leisure Bay"
        ]
      },
      {
        "slug": "louwsburg",
        "name": "Louwsburg",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Louwsburg. Book hair salons, nail studios, and beauty services in Louwsburg, KwaZulu-Natal.",
        "metaTitle": "Louwsburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Louwsburg, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Louwsburg salons",
          "Louwsburg hair salon",
          "beauty salon Louwsburg",
          "nails Louwsburg"
        ]
      },
      {
        "slug": "madadeni",
        "name": "Madadeni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Madadeni. Book hair salons, nail studios, and beauty services in Madadeni, KwaZulu-Natal.",
        "metaTitle": "Madadeni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Madadeni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Madadeni salons",
          "Madadeni hair salon",
          "beauty salon Madadeni",
          "nails Madadeni"
        ]
      },
      {
        "slug": "mahlabatini",
        "name": "Mahlabatini",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mahlabatini. Book hair salons, nail studios, and beauty services in Mahlabatini, KwaZulu-Natal.",
        "metaTitle": "Mahlabatini Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mahlabatini, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mahlabatini salons",
          "Mahlabatini hair salon",
          "beauty salon Mahlabatini",
          "nails Mahlabatini"
        ]
      },
      {
        "slug": "manaba-beach",
        "name": "Manaba Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Manaba Beach. Book hair salons, nail studios, and beauty services in Manaba Beach, KwaZulu-Natal.",
        "metaTitle": "Manaba Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Manaba Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Manaba Beach salons",
          "Manaba Beach hair salon",
          "beauty salon Manaba Beach",
          "nails Manaba Beach"
        ]
      },
      {
        "slug": "mandeni",
        "name": "Mandeni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mandeni. Book hair salons, nail studios, and beauty services in Mandeni, KwaZulu-Natal.",
        "metaTitle": "Mandeni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mandeni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mandeni salons",
          "Mandeni hair salon",
          "beauty salon Mandeni",
          "nails Mandeni"
        ]
      },
      {
        "slug": "maphumulo",
        "name": "Maphumulo",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Maphumulo. Book hair salons, nail studios, and beauty services in Maphumulo, KwaZulu-Natal.",
        "metaTitle": "Maphumulo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Maphumulo, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Maphumulo salons",
          "Maphumulo hair salon",
          "beauty salon Maphumulo",
          "nails Maphumulo"
        ]
      },
      {
        "slug": "margate",
        "name": "Margate",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Margate. Book hair salons, nail studios, and beauty services in Margate, KwaZulu-Natal.",
        "metaTitle": "Margate Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Margate, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Margate salons",
          "Margate hair salon",
          "beauty salon Margate",
          "nails Margate"
        ]
      },
      {
        "slug": "marina-beach",
        "name": "Marina Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Marina Beach. Book hair salons, nail studios, and beauty services in Marina Beach, KwaZulu-Natal.",
        "metaTitle": "Marina Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Marina Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Marina Beach salons",
          "Marina Beach hair salon",
          "beauty salon Marina Beach",
          "nails Marina Beach"
        ]
      },
      {
        "slug": "mbazwana",
        "name": "Mbazwana",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mbazwana. Book hair salons, nail studios, and beauty services in Mbazwana, KwaZulu-Natal.",
        "metaTitle": "Mbazwana Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mbazwana, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mbazwana salons",
          "Mbazwana hair salon",
          "beauty salon Mbazwana",
          "nails Mbazwana"
        ]
      },
      {
        "slug": "melville",
        "name": "Melville",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Melville. Book hair salons, nail studios, and beauty services in Melville, KwaZulu-Natal.",
        "metaTitle": "Melville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Melville, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Melville salons",
          "Melville hair salon",
          "beauty salon Melville",
          "nails Melville"
        ]
      },
      {
        "slug": "merrivale",
        "name": "Merrivale",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Merrivale. Book hair salons, nail studios, and beauty services in Merrivale, KwaZulu-Natal.",
        "metaTitle": "Merrivale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Merrivale, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Merrivale salons",
          "Merrivale hair salon",
          "beauty salon Merrivale",
          "nails Merrivale"
        ]
      },
      {
        "slug": "mkuze",
        "name": "Mkuze",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mkuze. Book hair salons, nail studios, and beauty services in Mkuze, KwaZulu-Natal.",
        "metaTitle": "Mkuze Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mkuze, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mkuze salons",
          "Mkuze hair salon",
          "beauty salon Mkuze",
          "nails Mkuze"
        ]
      },
      {
        "slug": "mooi-river",
        "name": "Mooi River",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mooi River. Book hair salons, nail studios, and beauty services in Mooi River, KwaZulu-Natal.",
        "metaTitle": "Mooi River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mooi River, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mooi River salons",
          "Mooi River hair salon",
          "beauty salon Mooi River",
          "nails Mooi River"
        ]
      },
      {
        "slug": "mountain-view",
        "name": "Mountain View",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mountain View. Book hair salons, nail studios, and beauty services in Mountain View, KwaZulu-Natal.",
        "metaTitle": "Mountain View Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mountain View, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mountain View salons",
          "Mountain View hair salon",
          "beauty salon Mountain View",
          "nails Mountain View"
        ]
      },
      {
        "slug": "mpumalanga",
        "name": "Mpumalanga",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mpumalanga. Book hair salons, nail studios, and beauty services in Mpumalanga, KwaZulu-Natal.",
        "metaTitle": "Mpumalanga Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mpumalanga, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mpumalanga salons",
          "Mpumalanga hair salon",
          "beauty salon Mpumalanga",
          "nails Mpumalanga"
        ]
      },
      {
        "slug": "mtubatuba",
        "name": "Mtubatuba",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Mtubatuba. Book hair salons, nail studios, and beauty services in Mtubatuba, KwaZulu-Natal.",
        "metaTitle": "Mtubatuba Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mtubatuba, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mtubatuba salons",
          "Mtubatuba hair salon",
          "beauty salon Mtubatuba",
          "nails Mtubatuba"
        ]
      },
      {
        "slug": "munster",
        "name": "Munster",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Munster. Book hair salons, nail studios, and beauty services in Munster, KwaZulu-Natal.",
        "metaTitle": "Munster Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Munster, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Munster salons",
          "Munster hair salon",
          "beauty salon Munster",
          "nails Munster"
        ]
      },
      {
        "slug": "new-germany",
        "name": "New Germany",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in New Germany. Book hair salons, nail studios, and beauty services in New Germany, KwaZulu-Natal.",
        "metaTitle": "New Germany Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in New Germany, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "New Germany salons",
          "New Germany hair salon",
          "beauty salon New Germany",
          "nails New Germany"
        ]
      },
      {
        "slug": "new-hanover",
        "name": "New Hanover",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in New Hanover. Book hair salons, nail studios, and beauty services in New Hanover, KwaZulu-Natal.",
        "metaTitle": "New Hanover Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in New Hanover, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "New Hanover salons",
          "New Hanover hair salon",
          "beauty salon New Hanover",
          "nails New Hanover"
        ]
      },
      {
        "slug": "newcastle",
        "name": "Newcastle",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Newcastle. Book hair salons, nail studios, and beauty services in Newcastle, KwaZulu-Natal.",
        "metaTitle": "Newcastle Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Newcastle, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Newcastle salons",
          "Newcastle hair salon",
          "beauty salon Newcastle",
          "nails Newcastle"
        ]
      },
      {
        "slug": "ngagane",
        "name": "Ngagane",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ngagane. Book hair salons, nail studios, and beauty services in Ngagane, KwaZulu-Natal.",
        "metaTitle": "Ngagane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ngagane, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ngagane salons",
          "Ngagane hair salon",
          "beauty salon Ngagane",
          "nails Ngagane"
        ]
      },
      {
        "slug": "nongoma",
        "name": "Nongoma",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Nongoma. Book hair salons, nail studios, and beauty services in Nongoma, KwaZulu-Natal.",
        "metaTitle": "Nongoma Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nongoma, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nongoma salons",
          "Nongoma hair salon",
          "beauty salon Nongoma",
          "nails Nongoma"
        ]
      },
      {
        "slug": "nquthu",
        "name": "Nquthu",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Nquthu. Book hair salons, nail studios, and beauty services in Nquthu, KwaZulu-Natal.",
        "metaTitle": "Nquthu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nquthu, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nquthu salons",
          "Nquthu hair salon",
          "beauty salon Nquthu",
          "nails Nquthu"
        ]
      },
      {
        "slug": "ntuzuma",
        "name": "Ntuzuma",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ntuzuma. Book hair salons, nail studios, and beauty services in Ntuzuma, KwaZulu-Natal.",
        "metaTitle": "Ntuzuma Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ntuzuma, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ntuzuma salons",
          "Ntuzuma hair salon",
          "beauty salon Ntuzuma",
          "nails Ntuzuma"
        ]
      },
      {
        "slug": "oshabeni",
        "name": "Oshabeni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Oshabeni. Book hair salons, nail studios, and beauty services in Oshabeni, KwaZulu-Natal.",
        "metaTitle": "Oshabeni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Oshabeni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Oshabeni salons",
          "Oshabeni hair salon",
          "beauty salon Oshabeni",
          "nails Oshabeni"
        ]
      },
      {
        "slug": "palm-beach",
        "name": "Palm Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Palm Beach. Book hair salons, nail studios, and beauty services in Palm Beach, KwaZulu-Natal.",
        "metaTitle": "Palm Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Palm Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Palm Beach salons",
          "Palm Beach hair salon",
          "beauty salon Palm Beach",
          "nails Palm Beach"
        ]
      },
      {
        "slug": "park-rynie",
        "name": "Park Rynie",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Park Rynie. Book hair salons, nail studios, and beauty services in Park Rynie, KwaZulu-Natal.",
        "metaTitle": "Park Rynie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Park Rynie, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Park Rynie salons",
          "Park Rynie hair salon",
          "beauty salon Park Rynie",
          "nails Park Rynie"
        ]
      },
      {
        "slug": "paulpietersburg",
        "name": "Paulpietersburg",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Paulpietersburg. Book hair salons, nail studios, and beauty services in Paulpietersburg, KwaZulu-Natal.",
        "metaTitle": "Paulpietersburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Paulpietersburg, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Paulpietersburg salons",
          "Paulpietersburg hair salon",
          "beauty salon Paulpietersburg",
          "nails Paulpietersburg"
        ]
      },
      {
        "slug": "pennington",
        "name": "Pennington",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Pennington. Book hair salons, nail studios, and beauty services in Pennington, KwaZulu-Natal.",
        "metaTitle": "Pennington Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pennington, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pennington salons",
          "Pennington hair salon",
          "beauty salon Pennington",
          "nails Pennington"
        ]
      },
      {
        "slug": "phoenix",
        "name": "Phoenix",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Phoenix. Book hair salons, nail studios, and beauty services in Phoenix, KwaZulu-Natal.",
        "metaTitle": "Phoenix Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Phoenix, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Phoenix salons",
          "Phoenix hair salon",
          "beauty salon Phoenix",
          "nails Phoenix"
        ]
      },
      {
        "slug": "pietermaritzburg",
        "name": "Pietermaritzburg",
        "province": "KwaZulu-Natal",
        "description": "Find top-rated salons in Pietermaritzburg. Book hair and beauty services in the Midlands currently.",
        "metaTitle": "Pietermaritzburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pietermaritzburg, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pietermaritzburg salons",
          "Pietermaritzburg hair salon",
          "beauty salon Pietermaritzburg",
          "nails Pietermaritzburg"
        ]
      },
      {
        "slug": "pinetown",
        "name": "Pinetown",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Pinetown. Book hair salons, nail studios, and beauty services in Pinetown, KwaZulu-Natal.",
        "metaTitle": "Pinetown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pinetown, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pinetown salons",
          "Pinetown hair salon",
          "beauty salon Pinetown",
          "nails Pinetown"
        ]
      },
      {
        "slug": "pomeroy",
        "name": "Pomeroy",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Pomeroy. Book hair salons, nail studios, and beauty services in Pomeroy, KwaZulu-Natal.",
        "metaTitle": "Pomeroy Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pomeroy, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pomeroy salons",
          "Pomeroy hair salon",
          "beauty salon Pomeroy",
          "nails Pomeroy"
        ]
      },
      {
        "slug": "pongola",
        "name": "Pongola",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Pongola. Book hair salons, nail studios, and beauty services in Pongola, KwaZulu-Natal.",
        "metaTitle": "Pongola Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pongola, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pongola salons",
          "Pongola hair salon",
          "beauty salon Pongola",
          "nails Pongola"
        ]
      },
      {
        "slug": "port-edward",
        "name": "Port Edward",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Port Edward. Book hair salons, nail studios, and beauty services in Port Edward, KwaZulu-Natal.",
        "metaTitle": "Port Edward Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Edward, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Edward salons",
          "Port Edward hair salon",
          "beauty salon Port Edward",
          "nails Port Edward"
        ]
      },
      {
        "slug": "port-shepstone",
        "name": "Port Shepstone",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Port Shepstone. Book hair salons, nail studios, and beauty services in Port Shepstone, KwaZulu-Natal.",
        "metaTitle": "Port Shepstone Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Shepstone, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Shepstone salons",
          "Port Shepstone hair salon",
          "beauty salon Port Shepstone",
          "nails Port Shepstone"
        ]
      },
      {
        "slug": "prospecton",
        "name": "Prospecton",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Prospecton. Book hair salons, nail studios, and beauty services in Prospecton, KwaZulu-Natal.",
        "metaTitle": "Prospecton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Prospecton, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Prospecton salons",
          "Prospecton hair salon",
          "beauty salon Prospecton",
          "nails Prospecton"
        ]
      },
      {
        "slug": "queensburgh",
        "name": "Queensburgh",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Queensburgh. Book hair salons, nail studios, and beauty services in Queensburgh, KwaZulu-Natal.",
        "metaTitle": "Queensburgh Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Queensburgh, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Queensburgh salons",
          "Queensburgh hair salon",
          "beauty salon Queensburgh",
          "nails Queensburgh"
        ]
      },
      {
        "slug": "ramsgate",
        "name": "Ramsgate",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ramsgate. Book hair salons, nail studios, and beauty services in Ramsgate, KwaZulu-Natal.",
        "metaTitle": "Ramsgate Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ramsgate, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ramsgate salons",
          "Ramsgate hair salon",
          "beauty salon Ramsgate",
          "nails Ramsgate"
        ]
      },
      {
        "slug": "richmond",
        "name": "Richmond",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Richmond. Book hair salons, nail studios, and beauty services in Richmond, KwaZulu-Natal.",
        "metaTitle": "Richmond Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Richmond, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Richmond salons",
          "Richmond hair salon",
          "beauty salon Richmond",
          "nails Richmond"
        ]
      },
      {
        "slug": "salt-rock",
        "name": "Salt Rock",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Salt Rock. Book hair salons, nail studios, and beauty services in Salt Rock, KwaZulu-Natal.",
        "metaTitle": "Salt Rock Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Salt Rock, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Salt Rock salons",
          "Salt Rock hair salon",
          "beauty salon Salt Rock",
          "nails Salt Rock"
        ]
      },
      {
        "slug": "scottburgh",
        "name": "Scottburgh",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Scottburgh. Book hair salons, nail studios, and beauty services in Scottburgh, KwaZulu-Natal.",
        "metaTitle": "Scottburgh Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Scottburgh, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Scottburgh salons",
          "Scottburgh hair salon",
          "beauty salon Scottburgh",
          "nails Scottburgh"
        ]
      },
      {
        "slug": "sea-park",
        "name": "Sea Park",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Sea Park. Book hair salons, nail studios, and beauty services in Sea Park, KwaZulu-Natal.",
        "metaTitle": "Sea Park Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sea Park, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sea Park salons",
          "Sea Park hair salon",
          "beauty salon Sea Park",
          "nails Sea Park"
        ]
      },
      {
        "slug": "sezela",
        "name": "Sezela",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Sezela. Book hair salons, nail studios, and beauty services in Sezela, KwaZulu-Natal.",
        "metaTitle": "Sezela Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sezela, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sezela salons",
          "Sezela hair salon",
          "beauty salon Sezela",
          "nails Sezela"
        ]
      },
      {
        "slug": "shakaskraal",
        "name": "Shakaskraal",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Shakaskraal. Book hair salons, nail studios, and beauty services in Shakaskraal, KwaZulu-Natal.",
        "metaTitle": "Shakaskraal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Shakaskraal, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Shakaskraal salons",
          "Shakaskraal hair salon",
          "beauty salon Shakaskraal",
          "nails Shakaskraal"
        ]
      },
      {
        "slug": "shallcross",
        "name": "Shallcross",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Shallcross. Book hair salons, nail studios, and beauty services in Shallcross, KwaZulu-Natal.",
        "metaTitle": "Shallcross Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Shallcross, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Shallcross salons",
          "Shallcross hair salon",
          "beauty salon Shallcross",
          "nails Shallcross"
        ]
      },
      {
        "slug": "shelly-beach",
        "name": "Shelly Beach",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Shelly Beach. Book hair salons, nail studios, and beauty services in Shelly Beach, KwaZulu-Natal.",
        "metaTitle": "Shelly Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Shelly Beach, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Shelly Beach salons",
          "Shelly Beach hair salon",
          "beauty salon Shelly Beach",
          "nails Shelly Beach"
        ]
      },
      {
        "slug": "southbroom",
        "name": "Southbroom",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Southbroom. Book hair salons, nail studios, and beauty services in Southbroom, KwaZulu-Natal.",
        "metaTitle": "Southbroom Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Southbroom, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Southbroom salons",
          "Southbroom hair salon",
          "beauty salon Southbroom",
          "nails Southbroom"
        ]
      },
      {
        "slug": "southport",
        "name": "Southport",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Southport. Book hair salons, nail studios, and beauty services in Southport, KwaZulu-Natal.",
        "metaTitle": "Southport Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Southport, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Southport salons",
          "Southport hair salon",
          "beauty salon Southport",
          "nails Southport"
        ]
      },
      {
        "slug": "stanger",
        "name": "Stanger",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Stanger. Book hair salons, nail studios, and beauty services in Stanger, KwaZulu-Natal.",
        "metaTitle": "Stanger Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stanger, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stanger salons",
          "Stanger hair salon",
          "beauty salon Stanger",
          "nails Stanger"
        ]
      },
      {
        "slug": "stuartstown",
        "name": "Stuartstown",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Stuartstown. Book hair salons, nail studios, and beauty services in Stuartstown, KwaZulu-Natal.",
        "metaTitle": "Stuartstown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stuartstown, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stuartstown salons",
          "Stuartstown hair salon",
          "beauty salon Stuartstown",
          "nails Stuartstown"
        ]
      },
      {
        "slug": "sunwich-port",
        "name": "Sunwich Port",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Sunwich Port. Book hair salons, nail studios, and beauty services in Sunwich Port, KwaZulu-Natal.",
        "metaTitle": "Sunwich Port Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sunwich Port, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sunwich Port salons",
          "Sunwich Port hair salon",
          "beauty salon Sunwich Port",
          "nails Sunwich Port"
        ]
      },
      {
        "slug": "tongaat",
        "name": "Tongaat",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Tongaat. Book hair salons, nail studios, and beauty services in Tongaat, KwaZulu-Natal.",
        "metaTitle": "Tongaat Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tongaat, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tongaat salons",
          "Tongaat hair salon",
          "beauty salon Tongaat",
          "nails Tongaat"
        ]
      },
      {
        "slug": "trafalgar",
        "name": "Trafalgar",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Trafalgar. Book hair salons, nail studios, and beauty services in Trafalgar, KwaZulu-Natal.",
        "metaTitle": "Trafalgar Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Trafalgar, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Trafalgar salons",
          "Trafalgar hair salon",
          "beauty salon Trafalgar",
          "nails Trafalgar"
        ]
      },
      {
        "slug": "ubombo",
        "name": "Ubombo",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ubombo. Book hair salons, nail studios, and beauty services in Ubombo, KwaZulu-Natal.",
        "metaTitle": "Ubombo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ubombo, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ubombo salons",
          "Ubombo hair salon",
          "beauty salon Ubombo",
          "nails Ubombo"
        ]
      },
      {
        "slug": "ulundi",
        "name": "Ulundi",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Ulundi. Book hair salons, nail studios, and beauty services in Ulundi, KwaZulu-Natal.",
        "metaTitle": "Ulundi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ulundi, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ulundi salons",
          "Ulundi hair salon",
          "beauty salon Ulundi",
          "nails Ulundi"
        ]
      },
      {
        "slug": "umbumbulu",
        "name": "Umbumbulu",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umbumbulu. Book hair salons, nail studios, and beauty services in Umbumbulu, KwaZulu-Natal.",
        "metaTitle": "Umbumbulu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umbumbulu, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umbumbulu salons",
          "Umbumbulu hair salon",
          "beauty salon Umbumbulu",
          "nails Umbumbulu"
        ]
      },
      {
        "slug": "umdloti",
        "name": "Umdloti",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umdloti. Book hair salons, nail studios, and beauty services in Umdloti, KwaZulu-Natal.",
        "metaTitle": "Umdloti Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umdloti, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umdloti salons",
          "Umdloti hair salon",
          "beauty salon Umdloti",
          "nails Umdloti"
        ]
      },
      {
        "slug": "umgababa",
        "name": "Umgababa",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umgababa. Book hair salons, nail studios, and beauty services in Umgababa, KwaZulu-Natal.",
        "metaTitle": "Umgababa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umgababa, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umgababa salons",
          "Umgababa hair salon",
          "beauty salon Umgababa",
          "nails Umgababa"
        ]
      },
      {
        "slug": "umhlali",
        "name": "Umhlali",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umhlali. Book hair salons, nail studios, and beauty services in Umhlali, KwaZulu-Natal.",
        "metaTitle": "Umhlali Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umhlali, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umhlali salons",
          "Umhlali hair salon",
          "beauty salon Umhlali",
          "nails Umhlali"
        ]
      },
      {
        "slug": "umhlanga",
        "name": "Umhlanga",
        "province": "KwaZulu-Natal",
        "description": "Find luxury salons and spas in Umhlanga. Book premium treatments in Umhlanga Rocks.",
        "metaTitle": "Umhlanga Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umhlanga, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umhlanga salons",
          "Umhlanga hair salon",
          "beauty salon Umhlanga",
          "nails Umhlanga"
        ]
      },
      {
        "slug": "umkomaas",
        "name": "Umkomaas",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umkomaas. Book hair salons, nail studios, and beauty services in Umkomaas, KwaZulu-Natal.",
        "metaTitle": "Umkomaas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umkomaas, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umkomaas salons",
          "Umkomaas hair salon",
          "beauty salon Umkomaas",
          "nails Umkomaas"
        ]
      },
      {
        "slug": "umlazi",
        "name": "Umlazi",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umlazi. Book hair salons, nail studios, and beauty services in Umlazi, KwaZulu-Natal.",
        "metaTitle": "Umlazi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umlazi, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umlazi salons",
          "Umlazi hair salon",
          "beauty salon Umlazi",
          "nails Umlazi"
        ]
      },
      {
        "slug": "umtalumi",
        "name": "Umtalumi",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umtalumi. Book hair salons, nail studios, and beauty services in Umtalumi, KwaZulu-Natal.",
        "metaTitle": "Umtalumi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umtalumi, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umtalumi salons",
          "Umtalumi hair salon",
          "beauty salon Umtalumi",
          "nails Umtalumi"
        ]
      },
      {
        "slug": "umtentweni",
        "name": "Umtentweni",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umtentweni. Book hair salons, nail studios, and beauty services in Umtentweni, KwaZulu-Natal.",
        "metaTitle": "Umtentweni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umtentweni, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umtentweni salons",
          "Umtentweni hair salon",
          "beauty salon Umtentweni",
          "nails Umtentweni"
        ]
      },
      {
        "slug": "umzimkulu",
        "name": "Umzimkulu",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umzimkulu. Book hair salons, nail studios, and beauty services in Umzimkulu, KwaZulu-Natal.",
        "metaTitle": "Umzimkulu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umzimkulu, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umzimkulu salons",
          "Umzimkulu hair salon",
          "beauty salon Umzimkulu",
          "nails Umzimkulu"
        ]
      },
      {
        "slug": "umzinto",
        "name": "Umzinto",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umzinto. Book hair salons, nail studios, and beauty services in Umzinto, KwaZulu-Natal.",
        "metaTitle": "Umzinto Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umzinto, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umzinto salons",
          "Umzinto hair salon",
          "beauty salon Umzinto",
          "nails Umzinto"
        ]
      },
      {
        "slug": "umzumbe",
        "name": "Umzumbe",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Umzumbe. Book hair salons, nail studios, and beauty services in Umzumbe, KwaZulu-Natal.",
        "metaTitle": "Umzumbe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Umzumbe, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Umzumbe salons",
          "Umzumbe hair salon",
          "beauty salon Umzumbe",
          "nails Umzumbe"
        ]
      },
      {
        "slug": "underberg",
        "name": "Underberg",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Underberg. Book hair salons, nail studios, and beauty services in Underberg, KwaZulu-Natal.",
        "metaTitle": "Underberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Underberg, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Underberg salons",
          "Underberg hair salon",
          "beauty salon Underberg",
          "nails Underberg"
        ]
      },
      {
        "slug": "uvongo",
        "name": "Uvongo",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Uvongo. Book hair salons, nail studios, and beauty services in Uvongo, KwaZulu-Natal.",
        "metaTitle": "Uvongo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Uvongo, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Uvongo salons",
          "Uvongo hair salon",
          "beauty salon Uvongo",
          "nails Uvongo"
        ]
      },
      {
        "slug": "verulam",
        "name": "Verulam",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Verulam. Book hair salons, nail studios, and beauty services in Verulam, KwaZulu-Natal.",
        "metaTitle": "Verulam Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Verulam, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Verulam salons",
          "Verulam hair salon",
          "beauty salon Verulam",
          "nails Verulam"
        ]
      },
      {
        "slug": "vryheid",
        "name": "Vryheid",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Vryheid. Book hair salons, nail studios, and beauty services in Vryheid, KwaZulu-Natal.",
        "metaTitle": "Vryheid Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vryheid, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vryheid salons",
          "Vryheid hair salon",
          "beauty salon Vryheid",
          "nails Vryheid"
        ]
      },
      {
        "slug": "wartburg",
        "name": "Wartburg",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Wartburg. Book hair salons, nail studios, and beauty services in Wartburg, KwaZulu-Natal.",
        "metaTitle": "Wartburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wartburg, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wartburg salons",
          "Wartburg hair salon",
          "beauty salon Wartburg",
          "nails Wartburg"
        ]
      },
      {
        "slug": "wasbank",
        "name": "Wasbank",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Wasbank. Book hair salons, nail studios, and beauty services in Wasbank, KwaZulu-Natal.",
        "metaTitle": "Wasbank Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wasbank, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wasbank salons",
          "Wasbank hair salon",
          "beauty salon Wasbank",
          "nails Wasbank"
        ]
      },
      {
        "slug": "waterfall",
        "name": "Waterfall",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Waterfall. Book hair salons, nail studios, and beauty services in Waterfall, KwaZulu-Natal.",
        "metaTitle": "Waterfall Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Waterfall, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Waterfall salons",
          "Waterfall hair salon",
          "beauty salon Waterfall",
          "nails Waterfall"
        ]
      },
      {
        "slug": "westville",
        "name": "Westville",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Westville. Book hair salons, nail studios, and beauty services in Westville, KwaZulu-Natal.",
        "metaTitle": "Westville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Westville, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Westville salons",
          "Westville hair salon",
          "beauty salon Westville",
          "nails Westville"
        ]
      },
      {
        "slug": "weza",
        "name": "Weza",
        "province": "KwaZulu-Natal",
        "description": "Discover salons in Weza. Book hair salons, nail studios, and beauty services in Weza, KwaZulu-Natal.",
        "metaTitle": "Weza Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Weza, KwaZulu-Natal. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Weza salons",
          "Weza hair salon",
          "beauty salon Weza",
          "nails Weza"
        ]
      }
    ]
  },
  "western-cape": {
    "slug": "western-cape",
    "name": "Western Cape",
    "description": "Discover premium salons in the Western Cape. From Cape Town to the Garden Route, find and book the best hair, beauty, and spa services near you.",
    "metaTitle": "Western Cape Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Western Cape. Book hair, nail, and beauty appointments at the best salons in Western Cape.",
    "keywords": [
      "Western Cape salons",
      "Western Cape hair salons"
    ],
    "cities": [
      {
        "slug": "albertinia",
        "name": "Albertinia",
        "province": "Western Cape",
        "description": "Discover salons in Albertinia. Book hair salons, nail studios, and beauty services in Albertinia, Western Cape.",
        "metaTitle": "Albertinia Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Albertinia, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Albertinia salons",
          "Albertinia hair salon",
          "beauty salon Albertinia",
          "nails Albertinia"
        ]
      },
      {
        "slug": "amalinstein",
        "name": "Amaliënstein",
        "province": "Western Cape",
        "description": "Discover salons in Amaliënstein. Book hair salons, nail studios, and beauty services in Amaliënstein, Western Cape.",
        "metaTitle": "Amaliënstein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Amaliënstein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Amaliënstein salons",
          "Amaliënstein hair salon",
          "beauty salon Amaliënstein",
          "nails Amaliënstein"
        ]
      },
      {
        "slug": "arniston",
        "name": "Arniston",
        "province": "Western Cape",
        "description": "Discover salons in Arniston. Book hair salons, nail studios, and beauty services in Arniston, Western Cape.",
        "metaTitle": "Arniston Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Arniston, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Arniston salons",
          "Arniston hair salon",
          "beauty salon Arniston",
          "nails Arniston"
        ]
      },
      {
        "slug": "ashton",
        "name": "Ashton",
        "province": "Western Cape",
        "description": "Discover salons in Ashton. Book hair salons, nail studios, and beauty services in Ashton, Western Cape.",
        "metaTitle": "Ashton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ashton, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ashton salons",
          "Ashton hair salon",
          "beauty salon Ashton",
          "nails Ashton"
        ]
      },
      {
        "slug": "atlantis",
        "name": "Atlantis",
        "province": "Western Cape",
        "description": "Discover salons in Atlantis. Book hair salons, nail studios, and beauty services in Atlantis, Western Cape.",
        "metaTitle": "Atlantis Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Atlantis, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Atlantis salons",
          "Atlantis hair salon",
          "beauty salon Atlantis",
          "nails Atlantis"
        ]
      },
      {
        "slug": "aurora",
        "name": "Aurora",
        "province": "Western Cape",
        "description": "Discover salons in Aurora. Book hair salons, nail studios, and beauty services in Aurora, Western Cape.",
        "metaTitle": "Aurora Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Aurora, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Aurora salons",
          "Aurora hair salon",
          "beauty salon Aurora",
          "nails Aurora"
        ]
      },
      {
        "slug": "avontuur",
        "name": "Avontuur",
        "province": "Western Cape",
        "description": "Discover salons in Avontuur. Book hair salons, nail studios, and beauty services in Avontuur, Western Cape.",
        "metaTitle": "Avontuur Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Avontuur, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Avontuur salons",
          "Avontuur hair salon",
          "beauty salon Avontuur",
          "nails Avontuur"
        ]
      },
      {
        "slug": "baardskeerdersbos",
        "name": "Baardskeerdersbos",
        "province": "Western Cape",
        "description": "Discover salons in Baardskeerdersbos. Book hair salons, nail studios, and beauty services in Baardskeerdersbos, Western Cape.",
        "metaTitle": "Baardskeerdersbos Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Baardskeerdersbos, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Baardskeerdersbos salons",
          "Baardskeerdersbos hair salon",
          "beauty salon Baardskeerdersbos",
          "nails Baardskeerdersbos"
        ]
      },
      {
        "slug": "barrydale",
        "name": "Barrydale",
        "province": "Western Cape",
        "description": "Discover salons in Barrydale. Book hair salons, nail studios, and beauty services in Barrydale, Western Cape.",
        "metaTitle": "Barrydale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Barrydale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Barrydale salons",
          "Barrydale hair salon",
          "beauty salon Barrydale",
          "nails Barrydale"
        ]
      },
      {
        "slug": "beaufort-west",
        "name": "Beaufort West",
        "province": "Western Cape",
        "description": "Discover salons in Beaufort West. Book hair salons, nail studios, and beauty services in Beaufort West, Western Cape.",
        "metaTitle": "Beaufort West Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Beaufort West, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Beaufort West salons",
          "Beaufort West hair salon",
          "beauty salon Beaufort West",
          "nails Beaufort West"
        ]
      },
      {
        "slug": "bellville",
        "name": "Bellville",
        "province": "Western Cape",
        "description": "Discover salons in Bellville. Book hair salons, nail studios, and beauty services in Bellville, Western Cape.",
        "metaTitle": "Bellville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bellville, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bellville salons",
          "Bellville hair salon",
          "beauty salon Bellville",
          "nails Bellville"
        ]
      },
      {
        "slug": "bergplaas",
        "name": "Bergplaas",
        "province": "Western Cape",
        "description": "Discover salons in Bergplaas. Book hair salons, nail studios, and beauty services in Bergplaas, Western Cape.",
        "metaTitle": "Bergplaas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bergplaas, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bergplaas salons",
          "Bergplaas hair salon",
          "beauty salon Bergplaas",
          "nails Bergplaas"
        ]
      },
      {
        "slug": "bettys-bay",
        "name": "Betty's Bay",
        "province": "Western Cape",
        "description": "Discover salons in Betty's Bay. Book hair salons, nail studios, and beauty services in Betty's Bay, Western Cape.",
        "metaTitle": "Betty's Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Betty's Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Betty's Bay salons",
          "Betty's Bay hair salon",
          "beauty salon Betty's Bay",
          "nails Betty's Bay"
        ]
      },
      {
        "slug": "birkenhead",
        "name": "Birkenhead",
        "province": "Western Cape",
        "description": "Discover salons in Birkenhead. Book hair salons, nail studios, and beauty services in Birkenhead, Western Cape.",
        "metaTitle": "Birkenhead Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Birkenhead, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Birkenhead salons",
          "Birkenhead hair salon",
          "beauty salon Birkenhead",
          "nails Birkenhead"
        ]
      },
      {
        "slug": "bitterfontein",
        "name": "Bitterfontein",
        "province": "Western Cape",
        "description": "Discover salons in Bitterfontein. Book hair salons, nail studios, and beauty services in Bitterfontein, Western Cape.",
        "metaTitle": "Bitterfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bitterfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bitterfontein salons",
          "Bitterfontein hair salon",
          "beauty salon Bitterfontein",
          "nails Bitterfontein"
        ]
      },
      {
        "slug": "blouberg",
        "name": "Blouberg",
        "province": "Western Cape",
        "description": "Discover salons in Blouberg. Book hair salons, nail studios, and beauty services in Blouberg, Western Cape.",
        "metaTitle": "Blouberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Blouberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Blouberg salons",
          "Blouberg hair salon",
          "beauty salon Blouberg",
          "nails Blouberg"
        ]
      },
      {
        "slug": "blue-downs",
        "name": "Blue Downs",
        "province": "Western Cape",
        "description": "Discover salons in Blue Downs. Book hair salons, nail studios, and beauty services in Blue Downs, Western Cape.",
        "metaTitle": "Blue Downs Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Blue Downs, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Blue Downs salons",
          "Blue Downs hair salon",
          "beauty salon Blue Downs",
          "nails Blue Downs"
        ]
      },
      {
        "slug": "boggomsbaai",
        "name": "Boggomsbaai",
        "province": "Western Cape",
        "description": "Discover salons in Boggomsbaai. Book hair salons, nail studios, and beauty services in Boggomsbaai, Western Cape.",
        "metaTitle": "Boggomsbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Boggomsbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Boggomsbaai salons",
          "Boggomsbaai hair salon",
          "beauty salon Boggomsbaai",
          "nails Boggomsbaai"
        ]
      },
      {
        "slug": "bonnievale",
        "name": "Bonnievale",
        "province": "Western Cape",
        "description": "Discover salons in Bonnievale. Book hair salons, nail studios, and beauty services in Bonnievale, Western Cape.",
        "metaTitle": "Bonnievale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bonnievale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bonnievale salons",
          "Bonnievale hair salon",
          "beauty salon Bonnievale",
          "nails Bonnievale"
        ]
      },
      {
        "slug": "bothasig",
        "name": "Bothasig",
        "province": "Western Cape",
        "description": "Discover salons in Bothasig. Book hair salons, nail studios, and beauty services in Bothasig, Western Cape.",
        "metaTitle": "Bothasig Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bothasig, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bothasig salons",
          "Bothasig hair salon",
          "beauty salon Bothasig",
          "nails Bothasig"
        ]
      },
      {
        "slug": "botrivier",
        "name": "Botrivier",
        "province": "Western Cape",
        "description": "Discover salons in Botrivier. Book hair salons, nail studios, and beauty services in Botrivier, Western Cape.",
        "metaTitle": "Botrivier Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Botrivier, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Botrivier salons",
          "Botrivier hair salon",
          "beauty salon Botrivier",
          "nails Botrivier"
        ]
      },
      {
        "slug": "bracken-hill",
        "name": "Bracken Hill",
        "province": "Western Cape",
        "description": "Discover salons in Bracken Hill. Book hair salons, nail studios, and beauty services in Bracken Hill, Western Cape.",
        "metaTitle": "Bracken Hill Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bracken Hill, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bracken Hill salons",
          "Bracken Hill hair salon",
          "beauty salon Bracken Hill",
          "nails Bracken Hill"
        ]
      },
      {
        "slug": "brackenfell",
        "name": "Brackenfell",
        "province": "Western Cape",
        "description": "Discover salons in Brackenfell. Book hair salons, nail studios, and beauty services in Brackenfell, Western Cape.",
        "metaTitle": "Brackenfell Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brackenfell, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brackenfell salons",
          "Brackenfell hair salon",
          "beauty salon Brackenfell",
          "nails Brackenfell"
        ]
      },
      {
        "slug": "brandwag",
        "name": "Brandwag",
        "province": "Western Cape",
        "description": "Discover salons in Brandwag. Book hair salons, nail studios, and beauty services in Brandwag, Western Cape.",
        "metaTitle": "Brandwag Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brandwag, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brandwag salons",
          "Brandwag hair salon",
          "beauty salon Brandwag",
          "nails Brandwag"
        ]
      },
      {
        "slug": "bredasdorp",
        "name": "Bredasdorp",
        "province": "Western Cape",
        "description": "Discover salons in Bredasdorp. Book hair salons, nail studios, and beauty services in Bredasdorp, Western Cape.",
        "metaTitle": "Bredasdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bredasdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bredasdorp salons",
          "Bredasdorp hair salon",
          "beauty salon Bredasdorp",
          "nails Bredasdorp"
        ]
      },
      {
        "slug": "brenton-on-sea",
        "name": "Brenton-on-Sea",
        "province": "Western Cape",
        "description": "Discover salons in Brenton-on-Sea. Book hair salons, nail studios, and beauty services in Brenton-on-Sea, Western Cape.",
        "metaTitle": "Brenton-on-Sea Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brenton-on-Sea, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brenton-on-Sea salons",
          "Brenton-on-Sea hair salon",
          "beauty salon Brenton-on-Sea",
          "nails Brenton-on-Sea"
        ]
      },
      {
        "slug": "caledon",
        "name": "Caledon",
        "province": "Western Cape",
        "description": "Discover salons in Caledon. Book hair salons, nail studios, and beauty services in Caledon, Western Cape.",
        "metaTitle": "Caledon Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Caledon, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Caledon salons",
          "Caledon hair salon",
          "beauty salon Caledon",
          "nails Caledon"
        ]
      },
      {
        "slug": "calitzdorp",
        "name": "Calitzdorp",
        "province": "Western Cape",
        "description": "Discover salons in Calitzdorp. Book hair salons, nail studios, and beauty services in Calitzdorp, Western Cape.",
        "metaTitle": "Calitzdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Calitzdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Calitzdorp salons",
          "Calitzdorp hair salon",
          "beauty salon Calitzdorp",
          "nails Calitzdorp"
        ]
      },
      {
        "slug": "cape-town",
        "name": "Cape Town",
        "province": "Western Cape",
        "description": "Discover salons in Cape Town. Book hair salons, nail studios, and beauty services in the Mother City.",
        "metaTitle": "Cape Town Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cape Town, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cape Town salons",
          "Cape Town hair salon",
          "beauty salon Cape Town",
          "nails Cape Town"
        ]
      },
      {
        "slug": "ceres",
        "name": "Ceres",
        "province": "Western Cape",
        "description": "Discover salons in Ceres. Book hair salons, nail studios, and beauty services in Ceres, Western Cape.",
        "metaTitle": "Ceres Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ceres, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ceres salons",
          "Ceres hair salon",
          "beauty salon Ceres",
          "nails Ceres"
        ]
      },
      {
        "slug": "chatsworth",
        "name": "Chatsworth",
        "province": "Western Cape",
        "description": "Discover salons in Chatsworth. Book hair salons, nail studios, and beauty services in Chatsworth, Western Cape.",
        "metaTitle": "Chatsworth Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Chatsworth, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Chatsworth salons",
          "Chatsworth hair salon",
          "beauty salon Chatsworth",
          "nails Chatsworth"
        ]
      },
      {
        "slug": "citrusdal",
        "name": "Citrusdal",
        "province": "Western Cape",
        "description": "Discover salons in Citrusdal. Book hair salons, nail studios, and beauty services in Citrusdal, Western Cape.",
        "metaTitle": "Citrusdal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Citrusdal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Citrusdal salons",
          "Citrusdal hair salon",
          "beauty salon Citrusdal",
          "nails Citrusdal"
        ]
      },
      {
        "slug": "clanwilliam",
        "name": "Clanwilliam",
        "province": "Western Cape",
        "description": "Discover salons in Clanwilliam. Book hair salons, nail studios, and beauty services in Clanwilliam, Western Cape.",
        "metaTitle": "Clanwilliam Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Clanwilliam, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Clanwilliam salons",
          "Clanwilliam hair salon",
          "beauty salon Clanwilliam",
          "nails Clanwilliam"
        ]
      },
      {
        "slug": "crossroads",
        "name": "Crossroads",
        "province": "Western Cape",
        "description": "Discover salons in Crossroads. Book hair salons, nail studios, and beauty services in Crossroads, Western Cape.",
        "metaTitle": "Crossroads Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Crossroads, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Crossroads salons",
          "Crossroads hair salon",
          "beauty salon Crossroads",
          "nails Crossroads"
        ]
      },
      {
        "slug": "dana-baai",
        "name": "Dana Baai",
        "province": "Western Cape",
        "description": "Discover salons in Dana Baai. Book hair salons, nail studios, and beauty services in Dana Baai, Western Cape.",
        "metaTitle": "Dana Baai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dana Baai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dana Baai salons",
          "Dana Baai hair salon",
          "beauty salon Dana Baai",
          "nails Dana Baai"
        ]
      },
      {
        "slug": "darling",
        "name": "Darling",
        "province": "Western Cape",
        "description": "Discover salons in Darling. Book hair salons, nail studios, and beauty services in Darling, Western Cape.",
        "metaTitle": "Darling Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Darling, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Darling salons",
          "Darling hair salon",
          "beauty salon Darling",
          "nails Darling"
        ]
      },
      {
        "slug": "de-doorns",
        "name": "De Doorns",
        "province": "Western Cape",
        "description": "Discover salons in De Doorns. Book hair salons, nail studios, and beauty services in De Doorns, Western Cape.",
        "metaTitle": "De Doorns Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Doorns, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Doorns salons",
          "De Doorns hair salon",
          "beauty salon De Doorns",
          "nails De Doorns"
        ]
      },
      {
        "slug": "de-hollandsche-molen",
        "name": "De Hollandsche Molen",
        "province": "Western Cape",
        "description": "Discover salons in De Hollandsche Molen. Book hair salons, nail studios, and beauty services in De Hollandsche Molen, Western Cape.",
        "metaTitle": "De Hollandsche Molen Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Hollandsche Molen, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Hollandsche Molen salons",
          "De Hollandsche Molen hair salon",
          "beauty salon De Hollandsche Molen",
          "nails De Hollandsche Molen"
        ]
      },
      {
        "slug": "de-hoop",
        "name": "De Hoop",
        "province": "Western Cape",
        "description": "Discover salons in De Hoop. Book hair salons, nail studios, and beauty services in De Hoop, Western Cape.",
        "metaTitle": "De Hoop Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Hoop, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Hoop salons",
          "De Hoop hair salon",
          "beauty salon De Hoop",
          "nails De Hoop"
        ]
      },
      {
        "slug": "de-rust",
        "name": "De Rust",
        "province": "Western Cape",
        "description": "Discover salons in De Rust. Book hair salons, nail studios, and beauty services in De Rust, Western Cape.",
        "metaTitle": "De Rust Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Rust, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Rust salons",
          "De Rust hair salon",
          "beauty salon De Rust",
          "nails De Rust"
        ]
      },
      {
        "slug": "de-vlugt",
        "name": "De Vlugt",
        "province": "Western Cape",
        "description": "Discover salons in De Vlugt. Book hair salons, nail studios, and beauty services in De Vlugt, Western Cape.",
        "metaTitle": "De Vlugt Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Vlugt, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Vlugt salons",
          "De Vlugt hair salon",
          "beauty salon De Vlugt",
          "nails De Vlugt"
        ]
      },
      {
        "slug": "delft",
        "name": "Delft",
        "province": "Western Cape",
        "description": "Discover salons in Delft. Book hair salons, nail studios, and beauty services in Delft, Western Cape.",
        "metaTitle": "Delft Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Delft, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Delft salons",
          "Delft hair salon",
          "beauty salon Delft",
          "nails Delft"
        ]
      },
      {
        "slug": "denneburg",
        "name": "Denneburg",
        "province": "Western Cape",
        "description": "Discover salons in Denneburg. Book hair salons, nail studios, and beauty services in Denneburg, Western Cape.",
        "metaTitle": "Denneburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Denneburg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Denneburg salons",
          "Denneburg hair salon",
          "beauty salon Denneburg",
          "nails Denneburg"
        ]
      },
      {
        "slug": "dennehof",
        "name": "Dennehof",
        "province": "Western Cape",
        "description": "Discover salons in Dennehof. Book hair salons, nail studios, and beauty services in Dennehof, Western Cape.",
        "metaTitle": "Dennehof Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dennehof, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dennehof salons",
          "Dennehof hair salon",
          "beauty salon Dennehof",
          "nails Dennehof"
        ]
      },
      {
        "slug": "doringbaai",
        "name": "Doringbaai",
        "province": "Western Cape",
        "description": "Discover salons in Doringbaai. Book hair salons, nail studios, and beauty services in Doringbaai, Western Cape.",
        "metaTitle": "Doringbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Doringbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Doringbaai salons",
          "Doringbaai hair salon",
          "beauty salon Doringbaai",
          "nails Doringbaai"
        ]
      },
      {
        "slug": "dwarskersbos",
        "name": "Dwarskersbos",
        "province": "Western Cape",
        "description": "Discover salons in Dwarskersbos. Book hair salons, nail studios, and beauty services in Dwarskersbos, Western Cape.",
        "metaTitle": "Dwarskersbos Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dwarskersbos, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dwarskersbos salons",
          "Dwarskersbos hair salon",
          "beauty salon Dwarskersbos",
          "nails Dwarskersbos"
        ]
      },
      {
        "slug": "dysselsdorp",
        "name": "Dysselsdorp",
        "province": "Western Cape",
        "description": "Discover salons in Dysselsdorp. Book hair salons, nail studios, and beauty services in Dysselsdorp, Western Cape.",
        "metaTitle": "Dysselsdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dysselsdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dysselsdorp salons",
          "Dysselsdorp hair salon",
          "beauty salon Dysselsdorp",
          "nails Dysselsdorp"
        ]
      },
      {
        "slug": "ebenhaeser",
        "name": "Ebenhaeser",
        "province": "Western Cape",
        "description": "Discover salons in Ebenhaeser. Book hair salons, nail studios, and beauty services in Ebenhaeser, Western Cape.",
        "metaTitle": "Ebenhaeser Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ebenhaeser, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ebenhaeser salons",
          "Ebenhaeser hair salon",
          "beauty salon Ebenhaeser",
          "nails Ebenhaeser"
        ]
      },
      {
        "slug": "eerste-river",
        "name": "Eerste River",
        "province": "Western Cape",
        "description": "Discover salons in Eerste River. Book hair salons, nail studios, and beauty services in Eerste River, Western Cape.",
        "metaTitle": "Eerste River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Eerste River, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Eerste River salons",
          "Eerste River hair salon",
          "beauty salon Eerste River",
          "nails Eerste River"
        ]
      },
      {
        "slug": "elands-bay",
        "name": "Elands Bay",
        "province": "Western Cape",
        "description": "Discover salons in Elands Bay. Book hair salons, nail studios, and beauty services in Elands Bay, Western Cape.",
        "metaTitle": "Elands Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elands Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elands Bay salons",
          "Elands Bay hair salon",
          "beauty salon Elands Bay",
          "nails Elands Bay"
        ]
      },
      {
        "slug": "elgin",
        "name": "Elgin",
        "province": "Western Cape",
        "description": "Discover salons in Elgin. Book hair salons, nail studios, and beauty services in Elgin, Western Cape.",
        "metaTitle": "Elgin Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elgin, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elgin salons",
          "Elgin hair salon",
          "beauty salon Elgin",
          "nails Elgin"
        ]
      },
      {
        "slug": "elim",
        "name": "Elim",
        "province": "Western Cape",
        "description": "Discover salons in Elim. Book hair salons, nail studios, and beauty services in Elim, Western Cape.",
        "metaTitle": "Elim Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elim, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elim salons",
          "Elim hair salon",
          "beauty salon Elim",
          "nails Elim"
        ]
      },
      {
        "slug": "elsies-river",
        "name": "Elsie's River",
        "province": "Western Cape",
        "description": "Discover salons in Elsie's River. Book hair salons, nail studios, and beauty services in Elsie's River, Western Cape.",
        "metaTitle": "Elsie's River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elsie's River, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elsie's River salons",
          "Elsie's River hair salon",
          "beauty salon Elsie's River",
          "nails Elsie's River"
        ]
      },
      {
        "slug": "farleigh",
        "name": "Farleigh",
        "province": "Western Cape",
        "description": "Discover salons in Farleigh. Book hair salons, nail studios, and beauty services in Farleigh, Western Cape.",
        "metaTitle": "Farleigh Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Farleigh, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Farleigh salons",
          "Farleigh hair salon",
          "beauty salon Farleigh",
          "nails Farleigh"
        ]
      },
      {
        "slug": "fish-hoek",
        "name": "Fish Hoek",
        "province": "Western Cape",
        "description": "Discover salons in Fish Hoek. Book hair salons, nail studios, and beauty services in Fish Hoek, Western Cape.",
        "metaTitle": "Fish Hoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Fish Hoek, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Fish Hoek salons",
          "Fish Hoek hair salon",
          "beauty salon Fish Hoek",
          "nails Fish Hoek"
        ]
      },
      {
        "slug": "fisherhaven",
        "name": "Fisherhaven",
        "province": "Western Cape",
        "description": "Discover salons in Fisherhaven. Book hair salons, nail studios, and beauty services in Fisherhaven, Western Cape.",
        "metaTitle": "Fisherhaven Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Fisherhaven, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Fisherhaven salons",
          "Fisherhaven hair salon",
          "beauty salon Fisherhaven",
          "nails Fisherhaven"
        ]
      },
      {
        "slug": "franschhoek",
        "name": "Franschhoek",
        "province": "Western Cape",
        "description": "Discover salons in Franschhoek. Book hair salons, nail studios, and beauty services in Franschhoek, Western Cape.",
        "metaTitle": "Franschhoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Franschhoek, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Franschhoek salons",
          "Franschhoek hair salon",
          "beauty salon Franschhoek",
          "nails Franschhoek"
        ]
      },
      {
        "slug": "franskraalstrand",
        "name": "Franskraalstrand",
        "province": "Western Cape",
        "description": "Discover salons in Franskraalstrand. Book hair salons, nail studios, and beauty services in Franskraalstrand, Western Cape.",
        "metaTitle": "Franskraalstrand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Franskraalstrand, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Franskraalstrand salons",
          "Franskraalstrand hair salon",
          "beauty salon Franskraalstrand",
          "nails Franskraalstrand"
        ]
      },
      {
        "slug": "friemersheim",
        "name": "Friemersheim",
        "province": "Western Cape",
        "description": "Discover salons in Friemersheim. Book hair salons, nail studios, and beauty services in Friemersheim, Western Cape.",
        "metaTitle": "Friemersheim Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Friemersheim, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Friemersheim salons",
          "Friemersheim hair salon",
          "beauty salon Friemersheim",
          "nails Friemersheim"
        ]
      },
      {
        "slug": "gansbaai",
        "name": "Gansbaai",
        "province": "Western Cape",
        "description": "Discover salons in Gansbaai. Book hair salons, nail studios, and beauty services in Gansbaai, Western Cape.",
        "metaTitle": "Gansbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gansbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gansbaai salons",
          "Gansbaai hair salon",
          "beauty salon Gansbaai",
          "nails Gansbaai"
        ]
      },
      {
        "slug": "genadendal",
        "name": "Genadendal",
        "province": "Western Cape",
        "description": "Discover salons in Genadendal. Book hair salons, nail studios, and beauty services in Genadendal, Western Cape.",
        "metaTitle": "Genadendal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Genadendal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Genadendal salons",
          "Genadendal hair salon",
          "beauty salon Genadendal",
          "nails Genadendal"
        ]
      },
      {
        "slug": "george",
        "name": "George",
        "province": "Western Cape",
        "description": "Discover salons in George. Book hair salons, nail studios, and beauty services in George, Western Cape.",
        "metaTitle": "George Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in George, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "George salons",
          "George hair salon",
          "beauty salon George",
          "nails George"
        ]
      },
      {
        "slug": "glentana",
        "name": "Glentana",
        "province": "Western Cape",
        "description": "Discover salons in Glentana. Book hair salons, nail studios, and beauty services in Glentana, Western Cape.",
        "metaTitle": "Glentana Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Glentana, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Glentana salons",
          "Glentana hair salon",
          "beauty salon Glentana",
          "nails Glentana"
        ]
      },
      {
        "slug": "goedverwacht",
        "name": "Goedverwacht",
        "province": "Western Cape",
        "description": "Discover salons in Goedverwacht. Book hair salons, nail studios, and beauty services in Goedverwacht, Western Cape.",
        "metaTitle": "Goedverwacht Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Goedverwacht, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Goedverwacht salons",
          "Goedverwacht hair salon",
          "beauty salon Goedverwacht",
          "nails Goedverwacht"
        ]
      },
      {
        "slug": "goodwood",
        "name": "Goodwood",
        "province": "Western Cape",
        "description": "Discover salons in Goodwood. Book hair salons, nail studios, and beauty services in Goodwood, Western Cape.",
        "metaTitle": "Goodwood Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Goodwood, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Goodwood salons",
          "Goodwood hair salon",
          "beauty salon Goodwood",
          "nails Goodwood"
        ]
      },
      {
        "slug": "gordons-bay",
        "name": "Gordon's Bay",
        "province": "Western Cape",
        "description": "Discover salons in Gordon's Bay. Book hair salons, nail studios, and beauty services in Gordon's Bay, Western Cape.",
        "metaTitle": "Gordon's Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gordon's Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gordon's Bay salons",
          "Gordon's Bay hair salon",
          "beauty salon Gordon's Bay",
          "nails Gordon's Bay"
        ]
      },
      {
        "slug": "gouda",
        "name": "Gouda",
        "province": "Western Cape",
        "description": "Discover salons in Gouda. Book hair salons, nail studios, and beauty services in Gouda, Western Cape.",
        "metaTitle": "Gouda Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gouda, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gouda salons",
          "Gouda hair salon",
          "beauty salon Gouda",
          "nails Gouda"
        ]
      },
      {
        "slug": "gouna",
        "name": "Gouna",
        "province": "Western Cape",
        "description": "Discover salons in Gouna. Book hair salons, nail studios, and beauty services in Gouna, Western Cape.",
        "metaTitle": "Gouna Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gouna, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gouna salons",
          "Gouna hair salon",
          "beauty salon Gouna",
          "nails Gouna"
        ]
      },
      {
        "slug": "gouritsmond",
        "name": "Gouritsmond",
        "province": "Western Cape",
        "description": "Discover salons in Gouritsmond. Book hair salons, nail studios, and beauty services in Gouritsmond, Western Cape.",
        "metaTitle": "Gouritsmond Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gouritsmond, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gouritsmond salons",
          "Gouritsmond hair salon",
          "beauty salon Gouritsmond",
          "nails Gouritsmond"
        ]
      },
      {
        "slug": "graafwater",
        "name": "Graafwater",
        "province": "Western Cape",
        "description": "Discover salons in Graafwater. Book hair salons, nail studios, and beauty services in Graafwater, Western Cape.",
        "metaTitle": "Graafwater Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Graafwater, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Graafwater salons",
          "Graafwater hair salon",
          "beauty salon Graafwater",
          "nails Graafwater"
        ]
      },
      {
        "slug": "grabouw",
        "name": "Grabouw",
        "province": "Western Cape",
        "description": "Discover salons in Grabouw. Book hair salons, nail studios, and beauty services in Grabouw, Western Cape.",
        "metaTitle": "Grabouw Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Grabouw, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Grabouw salons",
          "Grabouw hair salon",
          "beauty salon Grabouw",
          "nails Grabouw"
        ]
      },
      {
        "slug": "great-brak-river",
        "name": "Great Brak River",
        "province": "Western Cape",
        "description": "Discover salons in Great Brak River. Book hair salons, nail studios, and beauty services in Great Brak River, Western Cape.",
        "metaTitle": "Great Brak River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Great Brak River, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Great Brak River salons",
          "Great Brak River hair salon",
          "beauty salon Great Brak River",
          "nails Great Brak River"
        ]
      },
      {
        "slug": "greyton",
        "name": "Greyton",
        "province": "Western Cape",
        "description": "Discover salons in Greyton. Book hair salons, nail studios, and beauty services in Greyton, Western Cape.",
        "metaTitle": "Greyton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Greyton, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Greyton salons",
          "Greyton hair salon",
          "beauty salon Greyton",
          "nails Greyton"
        ]
      },
      {
        "slug": "groot-jongensfontein",
        "name": "Groot-Jongensfontein",
        "province": "Western Cape",
        "description": "Discover salons in Groot-Jongensfontein. Book hair salons, nail studios, and beauty services in Groot-Jongensfontein, Western Cape.",
        "metaTitle": "Groot-Jongensfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Groot-Jongensfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Groot-Jongensfontein salons",
          "Groot-Jongensfontein hair salon",
          "beauty salon Groot-Jongensfontein",
          "nails Groot-Jongensfontein"
        ]
      },
      {
        "slug": "grotto-bay",
        "name": "Grotto Bay",
        "province": "Western Cape",
        "description": "Discover salons in Grotto Bay. Book hair salons, nail studios, and beauty services in Grotto Bay, Western Cape.",
        "metaTitle": "Grotto Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Grotto Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Grotto Bay salons",
          "Grotto Bay hair salon",
          "beauty salon Grotto Bay",
          "nails Grotto Bay"
        ]
      },
      {
        "slug": "guguletu",
        "name": "Guguletu",
        "province": "Western Cape",
        "description": "Discover salons in Guguletu. Book hair salons, nail studios, and beauty services in Guguletu, Western Cape.",
        "metaTitle": "Guguletu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Guguletu, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Guguletu salons",
          "Guguletu hair salon",
          "beauty salon Guguletu",
          "nails Guguletu"
        ]
      },
      {
        "slug": "haarlem",
        "name": "Haarlem",
        "province": "Western Cape",
        "description": "Discover salons in Haarlem. Book hair salons, nail studios, and beauty services in Haarlem, Western Cape.",
        "metaTitle": "Haarlem Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Haarlem, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Haarlem salons",
          "Haarlem hair salon",
          "beauty salon Haarlem",
          "nails Haarlem"
        ]
      },
      {
        "slug": "hartenbos",
        "name": "Hartenbos",
        "province": "Western Cape",
        "description": "Discover salons in Hartenbos. Book hair salons, nail studios, and beauty services in Hartenbos, Western Cape.",
        "metaTitle": "Hartenbos Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hartenbos, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hartenbos salons",
          "Hartenbos hair salon",
          "beauty salon Hartenbos",
          "nails Hartenbos"
        ]
      },
      {
        "slug": "hawston",
        "name": "Hawston",
        "province": "Western Cape",
        "description": "Discover salons in Hawston. Book hair salons, nail studios, and beauty services in Hawston, Western Cape.",
        "metaTitle": "Hawston Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hawston, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hawston salons",
          "Hawston hair salon",
          "beauty salon Hawston",
          "nails Hawston"
        ]
      },
      {
        "slug": "heidelberg",
        "name": "Heidelberg",
        "province": "Western Cape",
        "description": "Discover salons in Heidelberg. Book hair salons, nail studios, and beauty services in Heidelberg, Western Cape.",
        "metaTitle": "Heidelberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Heidelberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Heidelberg salons",
          "Heidelberg hair salon",
          "beauty salon Heidelberg",
          "nails Heidelberg"
        ]
      },
      {
        "slug": "herbertsdale",
        "name": "Herbertsdale",
        "province": "Western Cape",
        "description": "Discover salons in Herbertsdale. Book hair salons, nail studios, and beauty services in Herbertsdale, Western Cape.",
        "metaTitle": "Herbertsdale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Herbertsdale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Herbertsdale salons",
          "Herbertsdale hair salon",
          "beauty salon Herbertsdale",
          "nails Herbertsdale"
        ]
      },
      {
        "slug": "hermanus",
        "name": "Hermanus",
        "province": "Western Cape",
        "description": "Discover salons in Hermanus. Book hair salons, nail studios, and beauty services in Hermanus, Western Cape.",
        "metaTitle": "Hermanus Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hermanus, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hermanus salons",
          "Hermanus hair salon",
          "beauty salon Hermanus",
          "nails Hermanus"
        ]
      },
      {
        "slug": "herold",
        "name": "Herold",
        "province": "Western Cape",
        "description": "Discover salons in Herold. Book hair salons, nail studios, and beauty services in Herold, Western Cape.",
        "metaTitle": "Herold Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Herold, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Herold salons",
          "Herold hair salon",
          "beauty salon Herold",
          "nails Herold"
        ]
      },
      {
        "slug": "hoekwil",
        "name": "Hoekwil",
        "province": "Western Cape",
        "description": "Discover salons in Hoekwil. Book hair salons, nail studios, and beauty services in Hoekwil, Western Cape.",
        "metaTitle": "Hoekwil Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hoekwil, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hoekwil salons",
          "Hoekwil hair salon",
          "beauty salon Hoekwil",
          "nails Hoekwil"
        ]
      },
      {
        "slug": "hopefield",
        "name": "Hopefield",
        "province": "Western Cape",
        "description": "Discover salons in Hopefield. Book hair salons, nail studios, and beauty services in Hopefield, Western Cape.",
        "metaTitle": "Hopefield Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hopefield, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hopefield salons",
          "Hopefield hair salon",
          "beauty salon Hopefield",
          "nails Hopefield"
        ]
      },
      {
        "slug": "hotagterklip",
        "name": "Hotagterklip",
        "province": "Western Cape",
        "description": "Discover salons in Hotagterklip. Book hair salons, nail studios, and beauty services in Hotagterklip, Western Cape.",
        "metaTitle": "Hotagterklip Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hotagterklip, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hotagterklip salons",
          "Hotagterklip hair salon",
          "beauty salon Hotagterklip",
          "nails Hotagterklip"
        ]
      },
      {
        "slug": "hout-bay",
        "name": "Hout Bay",
        "province": "Western Cape",
        "description": "Discover salons in Hout Bay. Book hair salons, nail studios, and beauty services in Hout Bay, Western Cape.",
        "metaTitle": "Hout Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hout Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hout Bay salons",
          "Hout Bay hair salon",
          "beauty salon Hout Bay",
          "nails Hout Bay"
        ]
      },
      {
        "slug": "infanta",
        "name": "Infanta",
        "province": "Western Cape",
        "description": "Discover salons in Infanta. Book hair salons, nail studios, and beauty services in Infanta, Western Cape.",
        "metaTitle": "Infanta Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Infanta, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Infanta salons",
          "Infanta hair salon",
          "beauty salon Infanta",
          "nails Infanta"
        ]
      },
      {
        "slug": "jacobsbaai",
        "name": "Jacobsbaai",
        "province": "Western Cape",
        "description": "Discover salons in Jacobsbaai. Book hair salons, nail studios, and beauty services in Jacobsbaai, Western Cape.",
        "metaTitle": "Jacobsbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jacobsbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jacobsbaai salons",
          "Jacobsbaai hair salon",
          "beauty salon Jacobsbaai",
          "nails Jacobsbaai"
        ]
      },
      {
        "slug": "jakkalsfontein",
        "name": "Jakkalsfontein",
        "province": "Western Cape",
        "description": "Discover salons in Jakkalsfontein. Book hair salons, nail studios, and beauty services in Jakkalsfontein, Western Cape.",
        "metaTitle": "Jakkalsfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jakkalsfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jakkalsfontein salons",
          "Jakkalsfontein hair salon",
          "beauty salon Jakkalsfontein",
          "nails Jakkalsfontein"
        ]
      },
      {
        "slug": "jonkersberg",
        "name": "Jonkersberg",
        "province": "Western Cape",
        "description": "Discover salons in Jonkersberg. Book hair salons, nail studios, and beauty services in Jonkersberg, Western Cape.",
        "metaTitle": "Jonkersberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jonkersberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jonkersberg salons",
          "Jonkersberg hair salon",
          "beauty salon Jonkersberg",
          "nails Jonkersberg"
        ]
      },
      {
        "slug": "kalbaskraal",
        "name": "Kalbaskraal",
        "province": "Western Cape",
        "description": "Discover salons in Kalbaskraal. Book hair salons, nail studios, and beauty services in Kalbaskraal, Western Cape.",
        "metaTitle": "Kalbaskraal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kalbaskraal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kalbaskraal salons",
          "Kalbaskraal hair salon",
          "beauty salon Kalbaskraal",
          "nails Kalbaskraal"
        ]
      },
      {
        "slug": "karatara",
        "name": "Karatara",
        "province": "Western Cape",
        "description": "Discover salons in Karatara. Book hair salons, nail studios, and beauty services in Karatara, Western Cape.",
        "metaTitle": "Karatara Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Karatara, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Karatara salons",
          "Karatara hair salon",
          "beauty salon Karatara",
          "nails Karatara"
        ]
      },
      {
        "slug": "kayamandi",
        "name": "Kayamandi",
        "province": "Western Cape",
        "description": "Discover salons in Kayamandi. Book hair salons, nail studios, and beauty services in Kayamandi, Western Cape.",
        "metaTitle": "Kayamandi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kayamandi, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kayamandi salons",
          "Kayamandi hair salon",
          "beauty salon Kayamandi",
          "nails Kayamandi"
        ]
      },
      {
        "slug": "keurboomsrivier",
        "name": "Keurboomsrivier",
        "province": "Western Cape",
        "description": "Discover salons in Keurboomsrivier. Book hair salons, nail studios, and beauty services in Keurboomsrivier, Western Cape.",
        "metaTitle": "Keurboomsrivier Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Keurboomsrivier, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Keurboomsrivier salons",
          "Keurboomsrivier hair salon",
          "beauty salon Keurboomsrivier",
          "nails Keurboomsrivier"
        ]
      },
      {
        "slug": "keurboomstrand",
        "name": "Keurboomstrand",
        "province": "Western Cape",
        "description": "Discover salons in Keurboomstrand. Book hair salons, nail studios, and beauty services in Keurboomstrand, Western Cape.",
        "metaTitle": "Keurboomstrand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Keurboomstrand, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Keurboomstrand salons",
          "Keurboomstrand hair salon",
          "beauty salon Keurboomstrand",
          "nails Keurboomstrand"
        ]
      },
      {
        "slug": "khayelitsha",
        "name": "Khayelitsha",
        "province": "Western Cape",
        "description": "Find the best salons in Khayelitsha, Cape Town's largest township. Book natural hair, braiding, weaves, nails, and beauty services from local professionals across Khayelitsha sections and surrounds.",
        "metaTitle": "Best Salons in Khayelitsha, Cape Town | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Khayelitsha, Western Cape. Browse local braiding salons, nail studios, and beauty professionals. Compare prices and book online today.",
        "keywords": [
          "Khayelitsha salons",
          "Khayelitsha hair salon",
          "beauty salon Khayelitsha",
          "nails Khayelitsha",
          "braiding salon Khayelitsha",
          "natural hair salon Khayelitsha Cape Town"
        ]
      },
      {
        "slug": "klapmuts",
        "name": "Klapmuts",
        "province": "Western Cape",
        "description": "Discover salons in Klapmuts. Book hair salons, nail studios, and beauty services in Klapmuts, Western Cape.",
        "metaTitle": "Klapmuts Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Klapmuts, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Klapmuts salons",
          "Klapmuts hair salon",
          "beauty salon Klapmuts",
          "nails Klapmuts"
        ]
      },
      {
        "slug": "klawer",
        "name": "Klawer",
        "province": "Western Cape",
        "description": "Discover salons in Klawer. Book hair salons, nail studios, and beauty services in Klawer, Western Cape.",
        "metaTitle": "Klawer Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Klawer, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Klawer salons",
          "Klawer hair salon",
          "beauty salon Klawer",
          "nails Klawer"
        ]
      },
      {
        "slug": "kleinbaai",
        "name": "Kleinbaai",
        "province": "Western Cape",
        "description": "Discover salons in Kleinbaai. Book hair salons, nail studios, and beauty services in Kleinbaai, Western Cape.",
        "metaTitle": "Kleinbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kleinbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kleinbaai salons",
          "Kleinbaai hair salon",
          "beauty salon Kleinbaai",
          "nails Kleinbaai"
        ]
      },
      {
        "slug": "kleinmond",
        "name": "Kleinmond",
        "province": "Western Cape",
        "description": "Discover salons in Kleinmond. Book hair salons, nail studios, and beauty services in Kleinmond, Western Cape.",
        "metaTitle": "Kleinmond Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kleinmond, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kleinmond salons",
          "Kleinmond hair salon",
          "beauty salon Kleinmond",
          "nails Kleinmond"
        ]
      },
      {
        "slug": "klipdale",
        "name": "Klipdale",
        "province": "Western Cape",
        "description": "Discover salons in Klipdale. Book hair salons, nail studios, and beauty services in Klipdale, Western Cape.",
        "metaTitle": "Klipdale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Klipdale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Klipdale salons",
          "Klipdale hair salon",
          "beauty salon Klipdale",
          "nails Klipdale"
        ]
      },
      {
        "slug": "knysna",
        "name": "Knysna",
        "province": "Western Cape",
        "description": "Discover salons in Knysna. Book hair salons, nail studios, and beauty services in Knysna, Western Cape.",
        "metaTitle": "Knysna Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Knysna, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Knysna salons",
          "Knysna hair salon",
          "beauty salon Knysna",
          "nails Knysna"
        ]
      },
      {
        "slug": "koekenaap",
        "name": "Koekenaap",
        "province": "Western Cape",
        "description": "Discover salons in Koekenaap. Book hair salons, nail studios, and beauty services in Koekenaap, Western Cape.",
        "metaTitle": "Koekenaap Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Koekenaap, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Koekenaap salons",
          "Koekenaap hair salon",
          "beauty salon Koekenaap",
          "nails Koekenaap"
        ]
      },
      {
        "slug": "koringberg",
        "name": "Koringberg",
        "province": "Western Cape",
        "description": "Discover salons in Koringberg. Book hair salons, nail studios, and beauty services in Koringberg, Western Cape.",
        "metaTitle": "Koringberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Koringberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Koringberg salons",
          "Koringberg hair salon",
          "beauty salon Koringberg",
          "nails Koringberg"
        ]
      },
      {
        "slug": "kraaifontein",
        "name": "Kraaifontein",
        "province": "Western Cape",
        "description": "Discover salons in Kraaifontein. Book hair salons, nail studios, and beauty services in Kraaifontein, Western Cape.",
        "metaTitle": "Kraaifontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kraaifontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kraaifontein salons",
          "Kraaifontein hair salon",
          "beauty salon Kraaifontein",
          "nails Kraaifontein"
        ]
      },
      {
        "slug": "kranshoek",
        "name": "Kranshoek",
        "province": "Western Cape",
        "description": "Discover salons in Kranshoek. Book hair salons, nail studios, and beauty services in Kranshoek, Western Cape.",
        "metaTitle": "Kranshoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kranshoek, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kranshoek salons",
          "Kranshoek hair salon",
          "beauty salon Kranshoek",
          "nails Kranshoek"
        ]
      },
      {
        "slug": "kuils-river",
        "name": "Kuils River",
        "province": "Western Cape",
        "description": "Discover salons in Kuils River. Book hair salons, nail studios, and beauty services in Kuils River, Western Cape.",
        "metaTitle": "Kuils River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kuils River, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kuils River salons",
          "Kuils River hair salon",
          "beauty salon Kuils River",
          "nails Kuils River"
        ]
      },
      {
        "slug": "kurland-estate",
        "name": "Kurland Estate",
        "province": "Western Cape",
        "description": "Discover salons in Kurland Estate. Book hair salons, nail studios, and beauty services in Kurland Estate, Western Cape.",
        "metaTitle": "Kurland Estate Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kurland Estate, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kurland Estate salons",
          "Kurland Estate hair salon",
          "beauty salon Kurland Estate",
          "nails Kurland Estate"
        ]
      },
      {
        "slug": "lagulhas",
        "name": "L'Agulhas",
        "province": "Western Cape",
        "description": "Discover salons in L'Agulhas. Book hair salons, nail studios, and beauty services in L'Agulhas, Western Cape.",
        "metaTitle": "L'Agulhas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in L'Agulhas, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "L'Agulhas salons",
          "L'Agulhas hair salon",
          "beauty salon L'Agulhas",
          "nails L'Agulhas"
        ]
      },
      {
        "slug": "ladismith",
        "name": "Ladismith",
        "province": "Western Cape",
        "description": "Discover salons in Ladismith. Book hair salons, nail studios, and beauty services in Ladismith, Western Cape.",
        "metaTitle": "Ladismith Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ladismith, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ladismith salons",
          "Ladismith hair salon",
          "beauty salon Ladismith",
          "nails Ladismith"
        ]
      },
      {
        "slug": "laingsburg",
        "name": "Laingsburg",
        "province": "Western Cape",
        "description": "Discover salons in Laingsburg. Book hair salons, nail studios, and beauty services in Laingsburg, Western Cape.",
        "metaTitle": "Laingsburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Laingsburg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Laingsburg salons",
          "Laingsburg hair salon",
          "beauty salon Laingsburg",
          "nails Laingsburg"
        ]
      },
      {
        "slug": "lambers-bay",
        "name": "Lamber's Bay",
        "province": "Western Cape",
        "description": "Discover salons in Lamber's Bay. Book hair salons, nail studios, and beauty services in Lamber's Bay, Western Cape.",
        "metaTitle": "Lamber's Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lamber's Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lamber's Bay salons",
          "Lamber's Bay hair salon",
          "beauty salon Lamber's Bay",
          "nails Lamber's Bay"
        ]
      },
      {
        "slug": "langa",
        "name": "Langa",
        "province": "Western Cape",
        "description": "Discover salons in Langa. Book hair salons, nail studios, and beauty services in Langa, Western Cape.",
        "metaTitle": "Langa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Langa, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Langa salons",
          "Langa hair salon",
          "beauty salon Langa",
          "nails Langa"
        ]
      },
      {
        "slug": "langebaan",
        "name": "Langebaan",
        "province": "Western Cape",
        "description": "Discover salons in Langebaan. Book hair salons, nail studios, and beauty services in Langebaan, Western Cape.",
        "metaTitle": "Langebaan Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Langebaan, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Langebaan salons",
          "Langebaan hair salon",
          "beauty salon Langebaan",
          "nails Langebaan"
        ]
      },
      {
        "slug": "langebaanweg",
        "name": "Langebaanweg",
        "province": "Western Cape",
        "description": "Discover salons in Langebaanweg. Book hair salons, nail studios, and beauty services in Langebaanweg, Western Cape.",
        "metaTitle": "Langebaanweg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Langebaanweg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Langebaanweg salons",
          "Langebaanweg hair salon",
          "beauty salon Langebaanweg",
          "nails Langebaanweg"
        ]
      },
      {
        "slug": "languedoc",
        "name": "Languedoc",
        "province": "Western Cape",
        "description": "Discover salons in Languedoc. Book hair salons, nail studios, and beauty services in Languedoc, Western Cape.",
        "metaTitle": "Languedoc Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Languedoc, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Languedoc salons",
          "Languedoc hair salon",
          "beauty salon Languedoc",
          "nails Languedoc"
        ]
      },
      {
        "slug": "leeu-gamka",
        "name": "Leeu-Gamka",
        "province": "Western Cape",
        "description": "Discover salons in Leeu-Gamka. Book hair salons, nail studios, and beauty services in Leeu-Gamka, Western Cape.",
        "metaTitle": "Leeu-Gamka Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Leeu-Gamka, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Leeu-Gamka salons",
          "Leeu-Gamka hair salon",
          "beauty salon Leeu-Gamka",
          "nails Leeu-Gamka"
        ]
      },
      {
        "slug": "little-brak-river",
        "name": "Little Brak River",
        "province": "Western Cape",
        "description": "Discover salons in Little Brak River. Book hair salons, nail studios, and beauty services in Little Brak River, Western Cape.",
        "metaTitle": "Little Brak River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Little Brak River, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Little Brak River salons",
          "Little Brak River hair salon",
          "beauty salon Little Brak River",
          "nails Little Brak River"
        ]
      },
      {
        "slug": "macassar",
        "name": "Macassar",
        "province": "Western Cape",
        "description": "Discover salons in Macassar. Book hair salons, nail studios, and beauty services in Macassar, Western Cape.",
        "metaTitle": "Macassar Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Macassar, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Macassar salons",
          "Macassar hair salon",
          "beauty salon Macassar",
          "nails Macassar"
        ]
      },
      {
        "slug": "matjiesfontein",
        "name": "Matjiesfontein",
        "province": "Western Cape",
        "description": "Discover salons in Matjiesfontein. Book hair salons, nail studios, and beauty services in Matjiesfontein, Western Cape.",
        "metaTitle": "Matjiesfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Matjiesfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Matjiesfontein salons",
          "Matjiesfontein hair salon",
          "beauty salon Matjiesfontein",
          "nails Matjiesfontein"
        ]
      },
      {
        "slug": "matjiesrivier",
        "name": "Matjiesrivier",
        "province": "Western Cape",
        "description": "Discover salons in Matjiesrivier. Book hair salons, nail studios, and beauty services in Matjiesrivier, Western Cape.",
        "metaTitle": "Matjiesrivier Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Matjiesrivier, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Matjiesrivier salons",
          "Matjiesrivier hair salon",
          "beauty salon Matjiesrivier",
          "nails Matjiesrivier"
        ]
      },
      {
        "slug": "mcgregor",
        "name": "McGregor",
        "province": "Western Cape",
        "description": "Discover salons in McGregor. Book hair salons, nail studios, and beauty services in McGregor, Western Cape.",
        "metaTitle": "McGregor Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in McGregor, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "McGregor salons",
          "McGregor hair salon",
          "beauty salon McGregor",
          "nails McGregor"
        ]
      },
      {
        "slug": "melkbosstrand",
        "name": "Melkbosstrand",
        "province": "Western Cape",
        "description": "Discover salons in Melkbosstrand. Book hair salons, nail studios, and beauty services in Melkbosstrand, Western Cape.",
        "metaTitle": "Melkbosstrand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Melkbosstrand, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Melkbosstrand salons",
          "Melkbosstrand hair salon",
          "beauty salon Melkbosstrand",
          "nails Melkbosstrand"
        ]
      },
      {
        "slug": "merweville",
        "name": "Merweville",
        "province": "Western Cape",
        "description": "Discover salons in Merweville. Book hair salons, nail studios, and beauty services in Merweville, Western Cape.",
        "metaTitle": "Merweville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Merweville, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Merweville salons",
          "Merweville hair salon",
          "beauty salon Merweville",
          "nails Merweville"
        ]
      },
      {
        "slug": "mfuleni",
        "name": "Mfuleni",
        "province": "Western Cape",
        "description": "Discover salons in Mfuleni. Book hair salons, nail studios, and beauty services in Mfuleni, Western Cape.",
        "metaTitle": "Mfuleni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mfuleni, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mfuleni salons",
          "Mfuleni hair salon",
          "beauty salon Mfuleni",
          "nails Mfuleni"
        ]
      },
      {
        "slug": "milnerton",
        "name": "Milnerton",
        "province": "Western Cape",
        "description": "Discover salons in Milnerton. Book hair salons, nail studios, and beauty services in Milnerton, Western Cape.",
        "metaTitle": "Milnerton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Milnerton, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Milnerton salons",
          "Milnerton hair salon",
          "beauty salon Milnerton",
          "nails Milnerton"
        ]
      },
      {
        "slug": "mitchells-plain",
        "name": "Mitchell's Plain",
        "province": "Western Cape",
        "description": "Find top-rated salons in Mitchell's Plain, Cape Town's second largest township. Book natural hair, braiding, weaves, nails, and beauty treatments from local professionals across Tafelsig, Lentegeur, and Rocklands.",
        "metaTitle": "Best Salons in Mitchell's Plain, Cape Town | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mitchell's Plain, Western Cape. Browse local braiding salons, nail studios, and beauty professionals serving Mitchells Plain and surrounds. Book online today.",
        "keywords": [
          "Mitchell's Plain salons",
          "Mitchells Plain hair salon",
          "beauty salon Mitchell's Plain",
          "nails Mitchells Plain",
          "braiding salon Mitchells Plain Cape Town"
        ]
      },
      {
        "slug": "montagu",
        "name": "Montagu",
        "province": "Western Cape",
        "description": "Discover salons in Montagu. Book hair salons, nail studios, and beauty services in Montagu, Western Cape.",
        "metaTitle": "Montagu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Montagu, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Montagu salons",
          "Montagu hair salon",
          "beauty salon Montagu",
          "nails Montagu"
        ]
      },
      {
        "slug": "moorreesburg",
        "name": "Moorreesburg",
        "province": "Western Cape",
        "description": "Discover salons in Moorreesburg. Book hair salons, nail studios, and beauty services in Moorreesburg, Western Cape.",
        "metaTitle": "Moorreesburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Moorreesburg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Moorreesburg salons",
          "Moorreesburg hair salon",
          "beauty salon Moorreesburg",
          "nails Moorreesburg"
        ]
      },
      {
        "slug": "mossel-bay",
        "name": "Mossel Bay",
        "province": "Western Cape",
        "description": "Discover salons in Mossel Bay. Book hair salons, nail studios, and beauty services in Mossel Bay, Western Cape.",
        "metaTitle": "Mossel Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mossel Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mossel Bay salons",
          "Mossel Bay hair salon",
          "beauty salon Mossel Bay",
          "nails Mossel Bay"
        ]
      },
      {
        "slug": "muizenberg",
        "name": "Muizenberg",
        "province": "Western Cape",
        "description": "Discover salons in Muizenberg. Book hair salons, nail studios, and beauty services in Muizenberg, Western Cape.",
        "metaTitle": "Muizenberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Muizenberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Muizenberg salons",
          "Muizenberg hair salon",
          "beauty salon Muizenberg",
          "nails Muizenberg"
        ]
      },
      {
        "slug": "murraysburg",
        "name": "Murraysburg",
        "province": "Western Cape",
        "description": "Discover salons in Murraysburg. Book hair salons, nail studios, and beauty services in Murraysburg, Western Cape.",
        "metaTitle": "Murraysburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Murraysburg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Murraysburg salons",
          "Murraysburg hair salon",
          "beauty salon Murraysburg",
          "nails Murraysburg"
        ]
      },
      {
        "slug": "natures-valley",
        "name": "Nature's Valley",
        "province": "Western Cape",
        "description": "Discover salons in Nature's Valley. Book hair salons, nail studios, and beauty services in Nature's Valley, Western Cape.",
        "metaTitle": "Nature's Valley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nature's Valley, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nature's Valley salons",
          "Nature's Valley hair salon",
          "beauty salon Nature's Valley",
          "nails Nature's Valley"
        ]
      },
      {
        "slug": "nelspoort",
        "name": "Nelspoort",
        "province": "Western Cape",
        "description": "Discover salons in Nelspoort. Book hair salons, nail studios, and beauty services in Nelspoort, Western Cape.",
        "metaTitle": "Nelspoort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nelspoort, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nelspoort salons",
          "Nelspoort hair salon",
          "beauty salon Nelspoort",
          "nails Nelspoort"
        ]
      },
      {
        "slug": "noetzie",
        "name": "Noetzie",
        "province": "Western Cape",
        "description": "Discover salons in Noetzie. Book hair salons, nail studios, and beauty services in Noetzie, Western Cape.",
        "metaTitle": "Noetzie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Noetzie, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Noetzie salons",
          "Noetzie hair salon",
          "beauty salon Noetzie",
          "nails Noetzie"
        ]
      },
      {
        "slug": "noordhoek",
        "name": "Noordhoek",
        "province": "Western Cape",
        "description": "Discover salons in Noordhoek. Book hair salons, nail studios, and beauty services in Noordhoek, Western Cape.",
        "metaTitle": "Noordhoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Noordhoek, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Noordhoek salons",
          "Noordhoek hair salon",
          "beauty salon Noordhoek",
          "nails Noordhoek"
        ]
      },
      {
        "slug": "nyanga",
        "name": "Nyanga",
        "province": "Western Cape",
        "description": "Discover salons in Nyanga. Book hair salons, nail studios, and beauty services in Nyanga, Western Cape.",
        "metaTitle": "Nyanga Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nyanga, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nyanga salons",
          "Nyanga hair salon",
          "beauty salon Nyanga",
          "nails Nyanga"
        ]
      },
      {
        "slug": "onrusrivier",
        "name": "Onrusrivier",
        "province": "Western Cape",
        "description": "Discover salons in Onrusrivier. Book hair salons, nail studios, and beauty services in Onrusrivier, Western Cape.",
        "metaTitle": "Onrusrivier Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Onrusrivier, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Onrusrivier salons",
          "Onrusrivier hair salon",
          "beauty salon Onrusrivier",
          "nails Onrusrivier"
        ]
      },
      {
        "slug": "op-die-berg",
        "name": "Op-die-Berg",
        "province": "Western Cape",
        "description": "Discover salons in Op-die-Berg. Book hair salons, nail studios, and beauty services in Op-die-Berg, Western Cape.",
        "metaTitle": "Op-die-Berg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Op-die-Berg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Op-die-Berg salons",
          "Op-die-Berg hair salon",
          "beauty salon Op-die-Berg",
          "nails Op-die-Berg"
        ]
      },
      {
        "slug": "oudtshoorn",
        "name": "Oudtshoorn",
        "province": "Western Cape",
        "description": "Discover salons in Oudtshoorn. Book hair salons, nail studios, and beauty services in Oudtshoorn, Western Cape.",
        "metaTitle": "Oudtshoorn Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Oudtshoorn, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Oudtshoorn salons",
          "Oudtshoorn hair salon",
          "beauty salon Oudtshoorn",
          "nails Oudtshoorn"
        ]
      },
      {
        "slug": "paarl",
        "name": "Paarl",
        "province": "Western Cape",
        "description": "Discover salons in Paarl. Book hair salons, nail studios, and beauty services in Paarl, Western Cape.",
        "metaTitle": "Paarl Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Paarl, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Paarl salons",
          "Paarl hair salon",
          "beauty salon Paarl",
          "nails Paarl"
        ]
      },
      {
        "slug": "pacaltsdorp",
        "name": "Pacaltsdorp",
        "province": "Western Cape",
        "description": "Discover salons in Pacaltsdorp. Book hair salons, nail studios, and beauty services in Pacaltsdorp, Western Cape.",
        "metaTitle": "Pacaltsdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pacaltsdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pacaltsdorp salons",
          "Pacaltsdorp hair salon",
          "beauty salon Pacaltsdorp",
          "nails Pacaltsdorp"
        ]
      },
      {
        "slug": "papiesvlei",
        "name": "Papiesvlei",
        "province": "Western Cape",
        "description": "Discover salons in Papiesvlei. Book hair salons, nail studios, and beauty services in Papiesvlei, Western Cape.",
        "metaTitle": "Papiesvlei Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Papiesvlei, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Papiesvlei salons",
          "Papiesvlei hair salon",
          "beauty salon Papiesvlei",
          "nails Papiesvlei"
        ]
      },
      {
        "slug": "parow",
        "name": "Parow",
        "province": "Western Cape",
        "description": "Discover salons in Parow. Book hair salons, nail studios, and beauty services in Parow, Western Cape.",
        "metaTitle": "Parow Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Parow, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Parow salons",
          "Parow hair salon",
          "beauty salon Parow",
          "nails Parow"
        ]
      },
      {
        "slug": "paternoster",
        "name": "Paternoster",
        "province": "Western Cape",
        "description": "Discover salons in Paternoster. Book hair salons, nail studios, and beauty services in Paternoster, Western Cape.",
        "metaTitle": "Paternoster Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Paternoster, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Paternoster salons",
          "Paternoster hair salon",
          "beauty salon Paternoster",
          "nails Paternoster"
        ]
      },
      {
        "slug": "pearly-beach",
        "name": "Pearly Beach",
        "province": "Western Cape",
        "description": "Discover salons in Pearly Beach. Book hair salons, nail studios, and beauty services in Pearly Beach, Western Cape.",
        "metaTitle": "Pearly Beach Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pearly Beach, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pearly Beach salons",
          "Pearly Beach hair salon",
          "beauty salon Pearly Beach",
          "nails Pearly Beach"
        ]
      },
      {
        "slug": "philadelphia",
        "name": "Philadelphia",
        "province": "Western Cape",
        "description": "Discover salons in Philadelphia. Book hair salons, nail studios, and beauty services in Philadelphia, Western Cape.",
        "metaTitle": "Philadelphia Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Philadelphia, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Philadelphia salons",
          "Philadelphia hair salon",
          "beauty salon Philadelphia",
          "nails Philadelphia"
        ]
      },
      {
        "slug": "piketberg",
        "name": "Piketberg",
        "province": "Western Cape",
        "description": "Discover salons in Piketberg. Book hair salons, nail studios, and beauty services in Piketberg, Western Cape.",
        "metaTitle": "Piketberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Piketberg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Piketberg salons",
          "Piketberg hair salon",
          "beauty salon Piketberg",
          "nails Piketberg"
        ]
      },
      {
        "slug": "plettenberg-bay",
        "name": "Plettenberg Bay",
        "province": "Western Cape",
        "description": "Discover salons in Plettenberg Bay. Book hair salons, nail studios, and beauty services in Plettenberg Bay, Western Cape.",
        "metaTitle": "Plettenberg Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Plettenberg Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Plettenberg Bay salons",
          "Plettenberg Bay hair salon",
          "beauty salon Plettenberg Bay",
          "nails Plettenberg Bay"
        ]
      },
      {
        "slug": "pniel",
        "name": "Pniel",
        "province": "Western Cape",
        "description": "Discover salons in Pniel. Book hair salons, nail studios, and beauty services in Pniel, Western Cape.",
        "metaTitle": "Pniel Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pniel, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pniel salons",
          "Pniel hair salon",
          "beauty salon Pniel",
          "nails Pniel"
        ]
      },
      {
        "slug": "port-beaufort",
        "name": "Port Beaufort",
        "province": "Western Cape",
        "description": "Discover salons in Port Beaufort. Book hair salons, nail studios, and beauty services in Port Beaufort, Western Cape.",
        "metaTitle": "Port Beaufort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Beaufort, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Beaufort salons",
          "Port Beaufort hair salon",
          "beauty salon Port Beaufort",
          "nails Port Beaufort"
        ]
      },
      {
        "slug": "porterville",
        "name": "Porterville",
        "province": "Western Cape",
        "description": "Discover salons in Porterville. Book hair salons, nail studios, and beauty services in Porterville, Western Cape.",
        "metaTitle": "Porterville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Porterville, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Porterville salons",
          "Porterville hair salon",
          "beauty salon Porterville",
          "nails Porterville"
        ]
      },
      {
        "slug": "prince-albert",
        "name": "Prince Albert",
        "province": "Western Cape",
        "description": "Discover salons in Prince Albert. Book hair salons, nail studios, and beauty services in Prince Albert, Western Cape.",
        "metaTitle": "Prince Albert Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Prince Albert, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Prince Albert salons",
          "Prince Albert hair salon",
          "beauty salon Prince Albert",
          "nails Prince Albert"
        ]
      },
      {
        "slug": "prince-alfred-hamlet",
        "name": "Prince Alfred Hamlet",
        "province": "Western Cape",
        "description": "Discover salons in Prince Alfred Hamlet. Book hair salons, nail studios, and beauty services in Prince Alfred Hamlet, Western Cape.",
        "metaTitle": "Prince Alfred Hamlet Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Prince Alfred Hamlet, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Prince Alfred Hamlet salons",
          "Prince Alfred Hamlet hair salon",
          "beauty salon Prince Alfred Hamlet",
          "nails Prince Alfred Hamlet"
        ]
      },
      {
        "slug": "puntjie",
        "name": "Puntjie",
        "province": "Western Cape",
        "description": "Discover salons in Puntjie. Book hair salons, nail studios, and beauty services in Puntjie, Western Cape.",
        "metaTitle": "Puntjie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Puntjie, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Puntjie salons",
          "Puntjie hair salon",
          "beauty salon Puntjie",
          "nails Puntjie"
        ]
      },
      {
        "slug": "rawsonville",
        "name": "Rawsonville",
        "province": "Western Cape",
        "description": "Discover salons in Rawsonville. Book hair salons, nail studios, and beauty services in Rawsonville, Western Cape.",
        "metaTitle": "Rawsonville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rawsonville, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rawsonville salons",
          "Rawsonville hair salon",
          "beauty salon Rawsonville",
          "nails Rawsonville"
        ]
      },
      {
        "slug": "redelinghuys",
        "name": "Redelinghuys",
        "province": "Western Cape",
        "description": "Discover salons in Redelinghuys. Book hair salons, nail studios, and beauty services in Redelinghuys, Western Cape.",
        "metaTitle": "Redelinghuys Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Redelinghuys, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Redelinghuys salons",
          "Redelinghuys hair salon",
          "beauty salon Redelinghuys",
          "nails Redelinghuys"
        ]
      },
      {
        "slug": "rheenendal",
        "name": "Rheenendal",
        "province": "Western Cape",
        "description": "Discover salons in Rheenendal. Book hair salons, nail studios, and beauty services in Rheenendal, Western Cape.",
        "metaTitle": "Rheenendal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rheenendal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rheenendal salons",
          "Rheenendal hair salon",
          "beauty salon Rheenendal",
          "nails Rheenendal"
        ]
      },
      {
        "slug": "riebeek-west",
        "name": "Riebeek West",
        "province": "Western Cape",
        "description": "Discover salons in Riebeek West. Book hair salons, nail studios, and beauty services in Riebeek West, Western Cape.",
        "metaTitle": "Riebeek West Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Riebeek West, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Riebeek West salons",
          "Riebeek West hair salon",
          "beauty salon Riebeek West",
          "nails Riebeek West"
        ]
      },
      {
        "slug": "riebeek-kasteel",
        "name": "Riebeek-Kasteel",
        "province": "Western Cape",
        "description": "Discover salons in Riebeek-Kasteel. Book hair salons, nail studios, and beauty services in Riebeek-Kasteel, Western Cape.",
        "metaTitle": "Riebeek-Kasteel Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Riebeek-Kasteel, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Riebeek-Kasteel salons",
          "Riebeek-Kasteel hair salon",
          "beauty salon Riebeek-Kasteel",
          "nails Riebeek-Kasteel"
        ]
      },
      {
        "slug": "riversdale",
        "name": "Riversdale",
        "province": "Western Cape",
        "description": "Discover salons in Riversdale. Book hair salons, nail studios, and beauty services in Riversdale, Western Cape.",
        "metaTitle": "Riversdale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Riversdale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Riversdale salons",
          "Riversdale hair salon",
          "beauty salon Riversdale",
          "nails Riversdale"
        ]
      },
      {
        "slug": "riviersonderend",
        "name": "Riviersonderend",
        "province": "Western Cape",
        "description": "Discover salons in Riviersonderend. Book hair salons, nail studios, and beauty services in Riviersonderend, Western Cape.",
        "metaTitle": "Riviersonderend Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Riviersonderend, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Riviersonderend salons",
          "Riviersonderend hair salon",
          "beauty salon Riviersonderend",
          "nails Riviersonderend"
        ]
      },
      {
        "slug": "robertson",
        "name": "Robertson",
        "province": "Western Cape",
        "description": "Discover salons in Robertson. Book hair salons, nail studios, and beauty services in Robertson, Western Cape.",
        "metaTitle": "Robertson Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Robertson, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Robertson salons",
          "Robertson hair salon",
          "beauty salon Robertson",
          "nails Robertson"
        ]
      },
      {
        "slug": "robertsvlei",
        "name": "Robertsvlei",
        "province": "Western Cape",
        "description": "Discover salons in Robertsvlei. Book hair salons, nail studios, and beauty services in Robertsvlei, Western Cape.",
        "metaTitle": "Robertsvlei Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Robertsvlei, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Robertsvlei salons",
          "Robertsvlei hair salon",
          "beauty salon Robertsvlei",
          "nails Robertsvlei"
        ]
      },
      {
        "slug": "rooi-els",
        "name": "Rooi Els",
        "province": "Western Cape",
        "description": "Discover salons in Rooi Els. Book hair salons, nail studios, and beauty services in Rooi Els, Western Cape.",
        "metaTitle": "Rooi Els Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rooi Els, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rooi Els salons",
          "Rooi Els hair salon",
          "beauty salon Rooi Els",
          "nails Rooi Els"
        ]
      },
      {
        "slug": "rozendal",
        "name": "Rozendal",
        "province": "Western Cape",
        "description": "Discover salons in Rozendal. Book hair salons, nail studios, and beauty services in Rozendal, Western Cape.",
        "metaTitle": "Rozendal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rozendal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rozendal salons",
          "Rozendal hair salon",
          "beauty salon Rozendal",
          "nails Rozendal"
        ]
      },
      {
        "slug": "ruiterbos",
        "name": "Ruiterbos",
        "province": "Western Cape",
        "description": "Discover salons in Ruiterbos. Book hair salons, nail studios, and beauty services in Ruiterbos, Western Cape.",
        "metaTitle": "Ruiterbos Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ruiterbos, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ruiterbos salons",
          "Ruiterbos hair salon",
          "beauty salon Ruiterbos",
          "nails Ruiterbos"
        ]
      },
      {
        "slug": "saldanha",
        "name": "Saldanha",
        "province": "Western Cape",
        "description": "Discover salons in Saldanha. Book hair salons, nail studios, and beauty services in Saldanha, Western Cape.",
        "metaTitle": "Saldanha Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Saldanha, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Saldanha salons",
          "Saldanha hair salon",
          "beauty salon Saldanha",
          "nails Saldanha"
        ]
      },
      {
        "slug": "sandbaai",
        "name": "Sandbaai",
        "province": "Western Cape",
        "description": "Discover salons in Sandbaai. Book hair salons, nail studios, and beauty services in Sandbaai, Western Cape.",
        "metaTitle": "Sandbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sandbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sandbaai salons",
          "Sandbaai hair salon",
          "beauty salon Sandbaai",
          "nails Sandbaai"
        ]
      },
      {
        "slug": "saron",
        "name": "Saron",
        "province": "Western Cape",
        "description": "Discover salons in Saron. Book hair salons, nail studios, and beauty services in Saron, Western Cape.",
        "metaTitle": "Saron Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Saron, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Saron salons",
          "Saron hair salon",
          "beauty salon Saron",
          "nails Saron"
        ]
      },
      {
        "slug": "schoemanshoek",
        "name": "Schoemanshoek",
        "province": "Western Cape",
        "description": "Discover salons in Schoemanshoek. Book hair salons, nail studios, and beauty services in Schoemanshoek, Western Cape.",
        "metaTitle": "Schoemanshoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Schoemanshoek, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Schoemanshoek salons",
          "Schoemanshoek hair salon",
          "beauty salon Schoemanshoek",
          "nails Schoemanshoek"
        ]
      },
      {
        "slug": "sedgefield",
        "name": "Sedgefield",
        "province": "Western Cape",
        "description": "Discover salons in Sedgefield. Book hair salons, nail studios, and beauty services in Sedgefield, Western Cape.",
        "metaTitle": "Sedgefield Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sedgefield, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sedgefield salons",
          "Sedgefield hair salon",
          "beauty salon Sedgefield",
          "nails Sedgefield"
        ]
      },
      {
        "slug": "simons-town",
        "name": "Simon's Town",
        "province": "Western Cape",
        "description": "Discover salons in Simon's Town. Book hair salons, nail studios, and beauty services in Simon's Town, Western Cape.",
        "metaTitle": "Simon's Town Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Simon's Town, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Simon's Town salons",
          "Simon's Town hair salon",
          "beauty salon Simon's Town",
          "nails Simon's Town"
        ]
      },
      {
        "slug": "skipskop",
        "name": "Skipskop",
        "province": "Western Cape",
        "description": "Discover salons in Skipskop. Book hair salons, nail studios, and beauty services in Skipskop, Western Cape.",
        "metaTitle": "Skipskop Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Skipskop, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Skipskop salons",
          "Skipskop hair salon",
          "beauty salon Skipskop",
          "nails Skipskop"
        ]
      },
      {
        "slug": "slangrivier",
        "name": "Slangrivier",
        "province": "Western Cape",
        "description": "Discover salons in Slangrivier. Book hair salons, nail studios, and beauty services in Slangrivier, Western Cape.",
        "metaTitle": "Slangrivier Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Slangrivier, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Slangrivier salons",
          "Slangrivier hair salon",
          "beauty salon Slangrivier",
          "nails Slangrivier"
        ]
      },
      {
        "slug": "somerset-west",
        "name": "Somerset West",
        "province": "Western Cape",
        "description": "Discover salons in Somerset West. Book hair salons, nail studios, and beauty services in Somerset West, Western Cape.",
        "metaTitle": "Somerset West Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Somerset West, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Somerset West salons",
          "Somerset West hair salon",
          "beauty salon Somerset West",
          "nails Somerset West"
        ]
      },
      {
        "slug": "st-helena-bay",
        "name": "St Helena Bay",
        "province": "Western Cape",
        "description": "Discover salons in St Helena Bay. Book hair salons, nail studios, and beauty services in St Helena Bay, Western Cape.",
        "metaTitle": "St Helena Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in St Helena Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "St Helena Bay salons",
          "St Helena Bay hair salon",
          "beauty salon St Helena Bay",
          "nails St Helena Bay"
        ]
      },
      {
        "slug": "stanford",
        "name": "Stanford",
        "province": "Western Cape",
        "description": "Discover salons in Stanford. Book hair salons, nail studios, and beauty services in Stanford, Western Cape.",
        "metaTitle": "Stanford Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stanford, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stanford salons",
          "Stanford hair salon",
          "beauty salon Stanford",
          "nails Stanford"
        ]
      },
      {
        "slug": "stellenbosch",
        "name": "Stellenbosch",
        "province": "Western Cape",
        "description": "Find top salons in Stellenbosch. Book hair and beauty services in the Winelands.",
        "metaTitle": "Stellenbosch Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stellenbosch, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stellenbosch salons",
          "Stellenbosch hair salon",
          "beauty salon Stellenbosch",
          "nails Stellenbosch"
        ]
      },
      {
        "slug": "stilbaai",
        "name": "Stilbaai",
        "province": "Western Cape",
        "description": "Discover salons in Stilbaai. Book hair salons, nail studios, and beauty services in Stilbaai, Western Cape.",
        "metaTitle": "Stilbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stilbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stilbaai salons",
          "Stilbaai hair salon",
          "beauty salon Stilbaai",
          "nails Stilbaai"
        ]
      },
      {
        "slug": "strandfontein",
        "name": "Strandfontein",
        "province": "Western Cape",
        "description": "Discover salons in Strandfontein. Book hair salons, nail studios, and beauty services in Strandfontein, Western Cape.",
        "metaTitle": "Strandfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Strandfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Strandfontein salons",
          "Strandfontein hair salon",
          "beauty salon Strandfontein",
          "nails Strandfontein"
        ]
      },
      {
        "slug": "struisbaai",
        "name": "Struisbaai",
        "province": "Western Cape",
        "description": "Discover salons in Struisbaai. Book hair salons, nail studios, and beauty services in Struisbaai, Western Cape.",
        "metaTitle": "Struisbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Struisbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Struisbaai salons",
          "Struisbaai hair salon",
          "beauty salon Struisbaai",
          "nails Struisbaai"
        ]
      },
      {
        "slug": "suiderstrand",
        "name": "Suiderstrand",
        "province": "Western Cape",
        "description": "Discover salons in Suiderstrand. Book hair salons, nail studios, and beauty services in Suiderstrand, Western Cape.",
        "metaTitle": "Suiderstrand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Suiderstrand, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Suiderstrand salons",
          "Suiderstrand hair salon",
          "beauty salon Suiderstrand",
          "nails Suiderstrand"
        ]
      },
      {
        "slug": "suurbraak",
        "name": "Suurbraak",
        "province": "Western Cape",
        "description": "Discover salons in Suurbraak. Book hair salons, nail studios, and beauty services in Suurbraak, Western Cape.",
        "metaTitle": "Suurbraak Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Suurbraak, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Suurbraak salons",
          "Suurbraak hair salon",
          "beauty salon Suurbraak",
          "nails Suurbraak"
        ]
      },
      {
        "slug": "swellendam",
        "name": "Swellendam",
        "province": "Western Cape",
        "description": "Discover salons in Swellendam. Book hair salons, nail studios, and beauty services in Swellendam, Western Cape.",
        "metaTitle": "Swellendam Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Swellendam, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Swellendam salons",
          "Swellendam hair salon",
          "beauty salon Swellendam",
          "nails Swellendam"
        ]
      },
      {
        "slug": "touwsranten",
        "name": "Touwsranten",
        "province": "Western Cape",
        "description": "Discover salons in Touwsranten. Book hair salons, nail studios, and beauty services in Touwsranten, Western Cape.",
        "metaTitle": "Touwsranten Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Touwsranten, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Touwsranten salons",
          "Touwsranten hair salon",
          "beauty salon Touwsranten",
          "nails Touwsranten"
        ]
      },
      {
        "slug": "tulbagh",
        "name": "Tulbagh",
        "province": "Western Cape",
        "description": "Discover salons in Tulbagh. Book hair salons, nail studios, and beauty services in Tulbagh, Western Cape.",
        "metaTitle": "Tulbagh Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tulbagh, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tulbagh salons",
          "Tulbagh hair salon",
          "beauty salon Tulbagh",
          "nails Tulbagh"
        ]
      },
      {
        "slug": "twee-rivieren",
        "name": "Twee Rivieren",
        "province": "Western Cape",
        "description": "Discover salons in Twee Rivieren. Book hair salons, nail studios, and beauty services in Twee Rivieren, Western Cape.",
        "metaTitle": "Twee Rivieren Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Twee Rivieren, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Twee Rivieren salons",
          "Twee Rivieren hair salon",
          "beauty salon Twee Rivieren",
          "nails Twee Rivieren"
        ]
      },
      {
        "slug": "uilenkraalsmond",
        "name": "Uilenkraalsmond",
        "province": "Western Cape",
        "description": "Discover salons in Uilenkraalsmond. Book hair salons, nail studios, and beauty services in Uilenkraalsmond, Western Cape.",
        "metaTitle": "Uilenkraalsmond Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Uilenkraalsmond, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Uilenkraalsmond salons",
          "Uilenkraalsmond hair salon",
          "beauty salon Uilenkraalsmond",
          "nails Uilenkraalsmond"
        ]
      },
      {
        "slug": "uniondale",
        "name": "Uniondale",
        "province": "Western Cape",
        "description": "Discover salons in Uniondale. Book hair salons, nail studios, and beauty services in Uniondale, Western Cape.",
        "metaTitle": "Uniondale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Uniondale, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Uniondale salons",
          "Uniondale hair salon",
          "beauty salon Uniondale",
          "nails Uniondale"
        ]
      },
      {
        "slug": "van-dyksbaai",
        "name": "Van Dyksbaai",
        "province": "Western Cape",
        "description": "Discover salons in Van Dyksbaai. Book hair salons, nail studios, and beauty services in Van Dyksbaai, Western Cape.",
        "metaTitle": "Van Dyksbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Van Dyksbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Van Dyksbaai salons",
          "Van Dyksbaai hair salon",
          "beauty salon Van Dyksbaai",
          "nails Van Dyksbaai"
        ]
      },
      {
        "slug": "vanrhynsdorp",
        "name": "Vanrhynsdorp",
        "province": "Western Cape",
        "description": "Discover salons in Vanrhynsdorp. Book hair salons, nail studios, and beauty services in Vanrhynsdorp, Western Cape.",
        "metaTitle": "Vanrhynsdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vanrhynsdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vanrhynsdorp salons",
          "Vanrhynsdorp hair salon",
          "beauty salon Vanrhynsdorp",
          "nails Vanrhynsdorp"
        ]
      },
      {
        "slug": "vanwyksdorp",
        "name": "Vanwyksdorp",
        "province": "Western Cape",
        "description": "Discover salons in Vanwyksdorp. Book hair salons, nail studios, and beauty services in Vanwyksdorp, Western Cape.",
        "metaTitle": "Vanwyksdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vanwyksdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vanwyksdorp salons",
          "Vanwyksdorp hair salon",
          "beauty salon Vanwyksdorp",
          "nails Vanwyksdorp"
        ]
      },
      {
        "slug": "velddrif",
        "name": "Velddrif",
        "province": "Western Cape",
        "description": "Discover salons in Velddrif. Book hair salons, nail studios, and beauty services in Velddrif, Western Cape.",
        "metaTitle": "Velddrif Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Velddrif, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Velddrif salons",
          "Velddrif hair salon",
          "beauty salon Velddrif",
          "nails Velddrif"
        ]
      },
      {
        "slug": "vermaaklikheid",
        "name": "Vermaaklikheid",
        "province": "Western Cape",
        "description": "Discover salons in Vermaaklikheid. Book hair salons, nail studios, and beauty services in Vermaaklikheid, Western Cape.",
        "metaTitle": "Vermaaklikheid Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vermaaklikheid, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vermaaklikheid salons",
          "Vermaaklikheid hair salon",
          "beauty salon Vermaaklikheid",
          "nails Vermaaklikheid"
        ]
      },
      {
        "slug": "vermont",
        "name": "Vermont",
        "province": "Western Cape",
        "description": "Discover salons in Vermont. Book hair salons, nail studios, and beauty services in Vermont, Western Cape.",
        "metaTitle": "Vermont Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vermont, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vermont salons",
          "Vermont hair salon",
          "beauty salon Vermont",
          "nails Vermont"
        ]
      },
      {
        "slug": "victoria-bay",
        "name": "Victoria Bay",
        "province": "Western Cape",
        "description": "Discover salons in Victoria Bay. Book hair salons, nail studios, and beauty services in Victoria Bay, Western Cape.",
        "metaTitle": "Victoria Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Victoria Bay, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Victoria Bay salons",
          "Victoria Bay hair salon",
          "beauty salon Victoria Bay",
          "nails Victoria Bay"
        ]
      },
      {
        "slug": "villiersdorp",
        "name": "Villiersdorp",
        "province": "Western Cape",
        "description": "Discover salons in Villiersdorp. Book hair salons, nail studios, and beauty services in Villiersdorp, Western Cape.",
        "metaTitle": "Villiersdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Villiersdorp, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Villiersdorp salons",
          "Villiersdorp hair salon",
          "beauty salon Villiersdorp",
          "nails Villiersdorp"
        ]
      },
      {
        "slug": "vleesbaai",
        "name": "Vleesbaai",
        "province": "Western Cape",
        "description": "Discover salons in Vleesbaai. Book hair salons, nail studios, and beauty services in Vleesbaai, Western Cape.",
        "metaTitle": "Vleesbaai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vleesbaai, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vleesbaai salons",
          "Vleesbaai hair salon",
          "beauty salon Vleesbaai",
          "nails Vleesbaai"
        ]
      },
      {
        "slug": "volmoed",
        "name": "Volmoed",
        "province": "Western Cape",
        "description": "Discover salons in Volmoed. Book hair salons, nail studios, and beauty services in Volmoed, Western Cape.",
        "metaTitle": "Volmoed Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Volmoed, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Volmoed salons",
          "Volmoed hair salon",
          "beauty salon Volmoed",
          "nails Volmoed"
        ]
      },
      {
        "slug": "vredenburg",
        "name": "Vredenburg",
        "province": "Western Cape",
        "description": "Discover salons in Vredenburg. Book hair salons, nail studios, and beauty services in Vredenburg, Western Cape.",
        "metaTitle": "Vredenburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vredenburg, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vredenburg salons",
          "Vredenburg hair salon",
          "beauty salon Vredenburg",
          "nails Vredenburg"
        ]
      },
      {
        "slug": "vredendal",
        "name": "Vredendal",
        "province": "Western Cape",
        "description": "Discover salons in Vredendal. Book hair salons, nail studios, and beauty services in Vredendal, Western Cape.",
        "metaTitle": "Vredendal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vredendal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vredendal salons",
          "Vredendal hair salon",
          "beauty salon Vredendal",
          "nails Vredendal"
        ]
      },
      {
        "slug": "wellington",
        "name": "Wellington",
        "province": "Western Cape",
        "description": "Discover salons in Wellington. Book hair salons, nail studios, and beauty services in Wellington, Western Cape.",
        "metaTitle": "Wellington Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wellington, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wellington salons",
          "Wellington hair salon",
          "beauty salon Wellington",
          "nails Wellington"
        ]
      },
      {
        "slug": "wilderness",
        "name": "Wilderness",
        "province": "Western Cape",
        "description": "Discover salons in Wilderness. Book hair salons, nail studios, and beauty services in Wilderness, Western Cape.",
        "metaTitle": "Wilderness Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wilderness, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wilderness salons",
          "Wilderness hair salon",
          "beauty salon Wilderness",
          "nails Wilderness"
        ]
      },
      {
        "slug": "witsand",
        "name": "Witsand",
        "province": "Western Cape",
        "description": "Discover salons in Witsand. Book hair salons, nail studios, and beauty services in Witsand, Western Cape.",
        "metaTitle": "Witsand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Witsand, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Witsand salons",
          "Witsand hair salon",
          "beauty salon Witsand",
          "nails Witsand"
        ]
      },
      {
        "slug": "wittedrift",
        "name": "Wittedrift",
        "province": "Western Cape",
        "description": "Discover salons in Wittedrift. Book hair salons, nail studios, and beauty services in Wittedrift, Western Cape.",
        "metaTitle": "Wittedrift Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wittedrift, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wittedrift salons",
          "Wittedrift hair salon",
          "beauty salon Wittedrift",
          "nails Wittedrift"
        ]
      },
      {
        "slug": "wolseley",
        "name": "Wolseley",
        "province": "Western Cape",
        "description": "Discover salons in Wolseley. Book hair salons, nail studios, and beauty services in Wolseley, Western Cape.",
        "metaTitle": "Wolseley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wolseley, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wolseley salons",
          "Wolseley hair salon",
          "beauty salon Wolseley",
          "nails Wolseley"
        ]
      },
      {
        "slug": "wolvengat",
        "name": "Wolvengat",
        "province": "Western Cape",
        "description": "Discover salons in Wolvengat. Book hair salons, nail studios, and beauty services in Wolvengat, Western Cape.",
        "metaTitle": "Wolvengat Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wolvengat, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wolvengat salons",
          "Wolvengat hair salon",
          "beauty salon Wolvengat",
          "nails Wolvengat"
        ]
      },
      {
        "slug": "woodville",
        "name": "Woodville",
        "province": "Western Cape",
        "description": "Discover salons in Woodville. Book hair salons, nail studios, and beauty services in Woodville, Western Cape.",
        "metaTitle": "Woodville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Woodville, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Woodville salons",
          "Woodville hair salon",
          "beauty salon Woodville",
          "nails Woodville"
        ]
      },
      {
        "slug": "worcester",
        "name": "Worcester",
        "province": "Western Cape",
        "description": "Discover salons in Worcester. Book hair salons, nail studios, and beauty services in Worcester, Western Cape.",
        "metaTitle": "Worcester Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Worcester, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Worcester salons",
          "Worcester hair salon",
          "beauty salon Worcester",
          "nails Worcester"
        ]
      },
      {
        "slug": "wupperthal",
        "name": "Wupperthal",
        "province": "Western Cape",
        "description": "Discover salons in Wupperthal. Book hair salons, nail studios, and beauty services in Wupperthal, Western Cape.",
        "metaTitle": "Wupperthal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wupperthal, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wupperthal salons",
          "Wupperthal hair salon",
          "beauty salon Wupperthal",
          "nails Wupperthal"
        ]
      },
      {
        "slug": "yzerfontein",
        "name": "Yzerfontein",
        "province": "Western Cape",
        "description": "Discover salons in Yzerfontein. Book hair salons, nail studios, and beauty services in Yzerfontein, Western Cape.",
        "metaTitle": "Yzerfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Yzerfontein, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Yzerfontein salons",
          "Yzerfontein hair salon",
          "beauty salon Yzerfontein",
          "nails Yzerfontein"
        ]
      },
      {
        "slug": "zoar",
        "name": "Zoar",
        "province": "Western Cape",
        "description": "Discover salons in Zoar. Book hair salons, nail studios, and beauty services in Zoar, Western Cape.",
        "metaTitle": "Zoar Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Zoar, Western Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Zoar salons",
          "Zoar hair salon",
          "beauty salon Zoar",
          "nails Zoar"
        ]
      }
    ]
  },
  "gauteng": {
    "slug": "gauteng",
    "name": "Gauteng",
    "description": "Find top-rated salons, spas, and hair professionals in Gauteng. Book appointments at the best hair salons, nail studios, and wellness centers in Johannesburg, Pretoria, and Sandton.",
    "metaTitle": "Gauteng Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Gauteng. Book hair, nail, and beauty appointments at the best salons in Gauteng.",
    "keywords": [
      "Gauteng salons",
      "Gauteng hair salons"
    ],
    "cities": [
      {
        "slug": "alberton",
        "name": "Alberton",
        "province": "Gauteng",
        "description": "Discover salons in Alberton. Book hair salons, nail studios, and beauty services in Alberton, Gauteng.",
        "metaTitle": "Alberton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Alberton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Alberton salons",
          "Alberton hair salon",
          "beauty salon Alberton",
          "nails Alberton"
        ]
      },
      {
        "slug": "alexandra",
        "name": "Alexandra",
        "province": "Gauteng",
        "description": "Find the best salons in Alexandra (Alex), Gauteng. Book weaves, braids, hair relaxers, nails, and beauty treatments from local professionals serving Alexandra township and surrounding areas.",
        "metaTitle": "Best Salons in Alexandra (Alex), Gauteng | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Alexandra, Gauteng. Browse local braiding specialists, nail studios, and hair salons in Alex. Compare prices and book online today.",
        "keywords": [
          "Alexandra salons",
          "Alex township salons",
          "Alexandra hair salon",
          "beauty salon Alexandra",
          "nails Alexandra",
          "braiding salon Alexandra Gauteng"
        ]
      },
      {
        "slug": "atteridgeville",
        "name": "Atteridgeville",
        "province": "Gauteng",
        "description": "Discover salons in Atteridgeville. Book hair salons, nail studios, and beauty services in Atteridgeville, Gauteng.",
        "metaTitle": "Atteridgeville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Atteridgeville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Atteridgeville salons",
          "Atteridgeville hair salon",
          "beauty salon Atteridgeville",
          "nails Atteridgeville"
        ]
      },
      {
        "slug": "bapsfontein",
        "name": "Bapsfontein",
        "province": "Gauteng",
        "description": "Discover salons in Bapsfontein. Book hair salons, nail studios, and beauty services in Bapsfontein, Gauteng.",
        "metaTitle": "Bapsfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bapsfontein, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bapsfontein salons",
          "Bapsfontein hair salon",
          "beauty salon Bapsfontein",
          "nails Bapsfontein"
        ]
      },
      {
        "slug": "bedfordview",
        "name": "Bedfordview",
        "province": "Gauteng",
        "description": "Discover salons in Bedfordview. Book hair salons, nail studios, and beauty services in Bedfordview, Gauteng.",
        "metaTitle": "Bedfordview Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bedfordview, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bedfordview salons",
          "Bedfordview hair salon",
          "beauty salon Bedfordview",
          "nails Bedfordview"
        ]
      },
      {
        "slug": "bekkersdal",
        "name": "Bekkersdal",
        "province": "Gauteng",
        "description": "Discover salons in Bekkersdal. Book hair salons, nail studios, and beauty services in Bekkersdal, Gauteng.",
        "metaTitle": "Bekkersdal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bekkersdal, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bekkersdal salons",
          "Bekkersdal hair salon",
          "beauty salon Bekkersdal",
          "nails Bekkersdal"
        ]
      },
      {
        "slug": "benoni",
        "name": "Benoni",
        "province": "Gauteng",
        "description": "Discover salons in Benoni. Book hair salons, nail studios, and beauty services in Benoni, Gauteng.",
        "metaTitle": "Benoni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Benoni, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Benoni salons",
          "Benoni hair salon",
          "beauty salon Benoni",
          "nails Benoni"
        ]
      },
      {
        "slug": "bhongweni",
        "name": "Bhongweni",
        "province": "Gauteng",
        "description": "Discover salons in Bhongweni. Book hair salons, nail studios, and beauty services in Bhongweni, Gauteng.",
        "metaTitle": "Bhongweni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bhongweni, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bhongweni salons",
          "Bhongweni hair salon",
          "beauty salon Bhongweni",
          "nails Bhongweni"
        ]
      },
      {
        "slug": "blybank",
        "name": "Blybank",
        "province": "Gauteng",
        "description": "Discover salons in Blybank. Book hair salons, nail studios, and beauty services in Blybank, Gauteng.",
        "metaTitle": "Blybank Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Blybank, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Blybank salons",
          "Blybank hair salon",
          "beauty salon Blybank",
          "nails Blybank"
        ]
      },
      {
        "slug": "boipatong",
        "name": "Boipatong",
        "province": "Gauteng",
        "description": "Discover salons in Boipatong. Book hair salons, nail studios, and beauty services in Boipatong, Gauteng.",
        "metaTitle": "Boipatong Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Boipatong, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Boipatong salons",
          "Boipatong hair salon",
          "beauty salon Boipatong",
          "nails Boipatong"
        ]
      },
      {
        "slug": "boksburg",
        "name": "Boksburg",
        "province": "Gauteng",
        "description": "Discover salons in Boksburg. Book hair salons, nail studios, and beauty services in Boksburg, Gauteng.",
        "metaTitle": "Boksburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Boksburg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Boksburg salons",
          "Boksburg hair salon",
          "beauty salon Boksburg",
          "nails Boksburg"
        ]
      },
      {
        "slug": "bophelong",
        "name": "Bophelong",
        "province": "Gauteng",
        "description": "Discover salons in Bophelong. Book hair salons, nail studios, and beauty services in Bophelong, Gauteng.",
        "metaTitle": "Bophelong Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bophelong, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bophelong salons",
          "Bophelong hair salon",
          "beauty salon Bophelong",
          "nails Bophelong"
        ]
      },
      {
        "slug": "borwa-westonaria",
        "name": "Borwa, Westonaria",
        "province": "Gauteng",
        "description": "Discover salons in Borwa, Westonaria. Book hair salons, nail studios, and beauty services in Borwa, Westonaria, Gauteng.",
        "metaTitle": "Borwa, Westonaria Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Borwa, Westonaria, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Borwa, Westonaria salons",
          "Borwa, Westonaria hair salon",
          "beauty salon Borwa, Westonaria",
          "nails Borwa, Westonaria"
        ]
      },
      {
        "slug": "brakpan",
        "name": "Brakpan",
        "province": "Gauteng",
        "description": "Discover salons in Brakpan. Book hair salons, nail studios, and beauty services in Brakpan, Gauteng.",
        "metaTitle": "Brakpan Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brakpan, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brakpan salons",
          "Brakpan hair salon",
          "beauty salon Brakpan",
          "nails Brakpan"
        ]
      },
      {
        "slug": "brandvlei",
        "name": "Brandvlei",
        "province": "Gauteng",
        "description": "Discover salons in Brandvlei. Book hair salons, nail studios, and beauty services in Brandvlei, Gauteng.",
        "metaTitle": "Brandvlei Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brandvlei, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brandvlei salons",
          "Brandvlei hair salon",
          "beauty salon Brandvlei",
          "nails Brandvlei"
        ]
      },
      {
        "slug": "bronberg",
        "name": "Bronberg",
        "province": "Gauteng",
        "description": "Discover salons in Bronberg. Book hair salons, nail studios, and beauty services in Bronberg, Gauteng.",
        "metaTitle": "Bronberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bronberg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bronberg salons",
          "Bronberg hair salon",
          "beauty salon Bronberg",
          "nails Bronberg"
        ]
      },
      {
        "slug": "bronkhorstspruit",
        "name": "Bronkhorstspruit",
        "province": "Gauteng",
        "description": "Discover salons in Bronkhorstspruit. Book hair salons, nail studios, and beauty services in Bronkhorstspruit, Gauteng.",
        "metaTitle": "Bronkhorstspruit Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bronkhorstspruit, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bronkhorstspruit salons",
          "Bronkhorstspruit hair salon",
          "beauty salon Bronkhorstspruit",
          "nails Bronkhorstspruit"
        ]
      },
      {
        "slug": "carletonville",
        "name": "Carletonville",
        "province": "Gauteng",
        "description": "Discover salons in Carletonville. Book hair salons, nail studios, and beauty services in Carletonville, Gauteng.",
        "metaTitle": "Carletonville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Carletonville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Carletonville salons",
          "Carletonville hair salon",
          "beauty salon Carletonville",
          "nails Carletonville"
        ]
      },
      {
        "slug": "centurion",
        "name": "Centurion",
        "province": "Gauteng",
        "description": "Discover salons in Centurion. Book hair salons, nail studios, and beauty services in Centurion, Gauteng.",
        "metaTitle": "Centurion Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Centurion, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Centurion salons",
          "Centurion hair salon",
          "beauty salon Centurion",
          "nails Centurion"
        ]
      },
      {
        "slug": "clayville",
        "name": "Clayville",
        "province": "Gauteng",
        "description": "Discover salons in Clayville. Book hair salons, nail studios, and beauty services in Clayville, Gauteng.",
        "metaTitle": "Clayville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Clayville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Clayville salons",
          "Clayville hair salon",
          "beauty salon Clayville",
          "nails Clayville"
        ]
      },
      {
        "slug": "cullinan",
        "name": "Cullinan",
        "province": "Gauteng",
        "description": "Discover salons in Cullinan. Book hair salons, nail studios, and beauty services in Cullinan, Gauteng.",
        "metaTitle": "Cullinan Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cullinan, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cullinan salons",
          "Cullinan hair salon",
          "beauty salon Cullinan",
          "nails Cullinan"
        ]
      },
      {
        "slug": "daveyton",
        "name": "Daveyton",
        "province": "Gauteng",
        "description": "Discover salons in Daveyton. Book hair salons, nail studios, and beauty services in Daveyton, Gauteng.",
        "metaTitle": "Daveyton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Daveyton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Daveyton salons",
          "Daveyton hair salon",
          "beauty salon Daveyton",
          "nails Daveyton"
        ]
      },
      {
        "slug": "devon",
        "name": "Devon",
        "province": "Gauteng",
        "description": "Discover salons in Devon. Book hair salons, nail studios, and beauty services in Devon, Gauteng.",
        "metaTitle": "Devon Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Devon, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Devon salons",
          "Devon hair salon",
          "beauty salon Devon",
          "nails Devon"
        ]
      },
      {
        "slug": "diepsloot",
        "name": "Diepsloot",
        "province": "Gauteng",
        "description": "Discover salons in Diepsloot. Book hair salons, nail studios, and beauty services in Diepsloot, Gauteng.",
        "metaTitle": "Diepsloot Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Diepsloot, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Diepsloot salons",
          "Diepsloot hair salon",
          "beauty salon Diepsloot",
          "nails Diepsloot"
        ]
      },
      {
        "slug": "duduza",
        "name": "Duduza",
        "province": "Gauteng",
        "description": "Discover salons in Duduza. Book hair salons, nail studios, and beauty services in Duduza, Gauteng.",
        "metaTitle": "Duduza Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Duduza, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Duduza salons",
          "Duduza hair salon",
          "beauty salon Duduza",
          "nails Duduza"
        ]
      },
      {
        "slug": "dunnottar",
        "name": "Dunnottar",
        "province": "Gauteng",
        "description": "Discover salons in Dunnottar. Book hair salons, nail studios, and beauty services in Dunnottar, Gauteng.",
        "metaTitle": "Dunnottar Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dunnottar, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dunnottar salons",
          "Dunnottar hair salon",
          "beauty salon Dunnottar",
          "nails Dunnottar"
        ]
      },
      {
        "slug": "edenvale",
        "name": "Edenvale",
        "province": "Gauteng",
        "description": "Discover salons in Edenvale. Book hair salons, nail studios, and beauty services in Edenvale, Gauteng.",
        "metaTitle": "Edenvale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Edenvale, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Edenvale salons",
          "Edenvale hair salon",
          "beauty salon Edenvale",
          "nails Edenvale"
        ]
      },
      {
        "slug": "ekangala",
        "name": "Ekangala",
        "province": "Gauteng",
        "description": "Discover salons in Ekangala. Book hair salons, nail studios, and beauty services in Ekangala, Gauteng.",
        "metaTitle": "Ekangala Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ekangala, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ekangala salons",
          "Ekangala hair salon",
          "beauty salon Ekangala",
          "nails Ekangala"
        ]
      },
      {
        "slug": "ennerdale",
        "name": "Ennerdale",
        "province": "Gauteng",
        "description": "Discover salons in Ennerdale. Book hair salons, nail studios, and beauty services in Ennerdale, Gauteng.",
        "metaTitle": "Ennerdale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ennerdale, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ennerdale salons",
          "Ennerdale hair salon",
          "beauty salon Ennerdale",
          "nails Ennerdale"
        ]
      },
      {
        "slug": "evaton",
        "name": "Evaton",
        "province": "Gauteng",
        "description": "Discover salons in Evaton. Book hair salons, nail studios, and beauty services in Evaton, Gauteng.",
        "metaTitle": "Evaton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Evaton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Evaton salons",
          "Evaton hair salon",
          "beauty salon Evaton",
          "nails Evaton"
        ]
      },
      {
        "slug": "fochville",
        "name": "Fochville",
        "province": "Gauteng",
        "description": "Discover salons in Fochville. Book hair salons, nail studios, and beauty services in Fochville, Gauteng.",
        "metaTitle": "Fochville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Fochville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Fochville salons",
          "Fochville hair salon",
          "beauty salon Fochville",
          "nails Fochville"
        ]
      },
      {
        "slug": "ga-rankuwa",
        "name": "Ga-Rankuwa",
        "province": "Gauteng",
        "description": "Discover salons in Ga-Rankuwa. Book hair salons, nail studios, and beauty services in Ga-Rankuwa, Gauteng.",
        "metaTitle": "Ga-Rankuwa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ga-Rankuwa, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ga-Rankuwa salons",
          "Ga-Rankuwa hair salon",
          "beauty salon Ga-Rankuwa",
          "nails Ga-Rankuwa"
        ]
      },
      {
        "slug": "germiston",
        "name": "Germiston",
        "province": "Gauteng",
        "description": "Discover salons in Germiston. Book hair salons, nail studios, and beauty services in Germiston, Gauteng.",
        "metaTitle": "Germiston Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Germiston, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Germiston salons",
          "Germiston hair salon",
          "beauty salon Germiston",
          "nails Germiston"
        ]
      },
      {
        "slug": "greenspark",
        "name": "Greenspark",
        "province": "Gauteng",
        "description": "Discover salons in Greenspark. Book hair salons, nail studios, and beauty services in Greenspark, Gauteng.",
        "metaTitle": "Greenspark Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Greenspark, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Greenspark salons",
          "Greenspark hair salon",
          "beauty salon Greenspark",
          "nails Greenspark"
        ]
      },
      {
        "slug": "hammanskraal",
        "name": "Hammanskraal",
        "province": "Gauteng",
        "description": "Discover salons in Hammanskraal. Book hair salons, nail studios, and beauty services in Hammanskraal, Gauteng.",
        "metaTitle": "Hammanskraal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hammanskraal, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hammanskraal salons",
          "Hammanskraal hair salon",
          "beauty salon Hammanskraal",
          "nails Hammanskraal"
        ]
      },
      {
        "slug": "heidelberg",
        "name": "Heidelberg",
        "province": "Gauteng",
        "description": "Discover salons in Heidelberg. Book hair salons, nail studios, and beauty services in Heidelberg, Gauteng.",
        "metaTitle": "Heidelberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Heidelberg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Heidelberg salons",
          "Heidelberg hair salon",
          "beauty salon Heidelberg",
          "nails Heidelberg"
        ]
      },
      {
        "slug": "hekpoort",
        "name": "Hekpoort",
        "province": "Gauteng",
        "description": "Discover salons in Hekpoort. Book hair salons, nail studios, and beauty services in Hekpoort, Gauteng.",
        "metaTitle": "Hekpoort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hekpoort, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hekpoort salons",
          "Hekpoort hair salon",
          "beauty salon Hekpoort",
          "nails Hekpoort"
        ]
      },
      {
        "slug": "holfontein",
        "name": "Holfontein",
        "province": "Gauteng",
        "description": "Discover salons in Holfontein. Book hair salons, nail studios, and beauty services in Holfontein, Gauteng.",
        "metaTitle": "Holfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Holfontein, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Holfontein salons",
          "Holfontein hair salon",
          "beauty salon Holfontein",
          "nails Holfontein"
        ]
      },
      {
        "slug": "impumelelo",
        "name": "Impumelelo",
        "province": "Gauteng",
        "description": "Discover salons in Impumelelo. Book hair salons, nail studios, and beauty services in Impumelelo, Gauteng.",
        "metaTitle": "Impumelelo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Impumelelo, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Impumelelo salons",
          "Impumelelo hair salon",
          "beauty salon Impumelelo",
          "nails Impumelelo"
        ]
      },
      {
        "slug": "irene",
        "name": "Irene",
        "province": "Gauteng",
        "description": "Discover salons in Irene. Book hair salons, nail studios, and beauty services in Irene, Gauteng.",
        "metaTitle": "Irene Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Irene, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Irene salons",
          "Irene hair salon",
          "beauty salon Irene",
          "nails Irene"
        ]
      },
      {
        "slug": "isando",
        "name": "Isando",
        "province": "Gauteng",
        "description": "Discover salons in Isando. Book hair salons, nail studios, and beauty services in Isando, Gauteng.",
        "metaTitle": "Isando Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Isando, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Isando salons",
          "Isando hair salon",
          "beauty salon Isando",
          "nails Isando"
        ]
      },
      {
        "slug": "johannesburg",
        "name": "Johannesburg",
        "province": "Gauteng",
        "description": "Find the best salons in Johannesburg. From Sandton to Soweto, book top-rated hair and beauty professionals.",
        "metaTitle": "Johannesburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Johannesburg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Johannesburg salons",
          "Johannesburg hair salon",
          "beauty salon Johannesburg",
          "nails Johannesburg"
        ]
      },
      {
        "slug": "kagiso",
        "name": "Kagiso",
        "province": "Gauteng",
        "description": "Discover salons in Kagiso. Book hair salons, nail studios, and beauty services in Kagiso, Gauteng.",
        "metaTitle": "Kagiso Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kagiso, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kagiso salons",
          "Kagiso hair salon",
          "beauty salon Kagiso",
          "nails Kagiso"
        ]
      },
      {
        "slug": "katlehong",
        "name": "Katlehong",
        "province": "Gauteng",
        "description": "Discover salons in Katlehong. Book hair salons, nail studios, and beauty services in Katlehong, Gauteng.",
        "metaTitle": "Katlehong Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Katlehong, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Katlehong salons",
          "Katlehong hair salon",
          "beauty salon Katlehong",
          "nails Katlehong"
        ]
      },
      {
        "slug": "kempton-park",
        "name": "Kempton Park",
        "province": "Gauteng",
        "description": "Discover salons in Kempton Park. Book hair salons, nail studios, and beauty services in Kempton Park, Gauteng.",
        "metaTitle": "Kempton Park Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kempton Park, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kempton Park salons",
          "Kempton Park hair salon",
          "beauty salon Kempton Park",
          "nails Kempton Park"
        ]
      },
      {
        "slug": "khutsong",
        "name": "Khutsong",
        "province": "Gauteng",
        "description": "Discover salons in Khutsong. Book hair salons, nail studios, and beauty services in Khutsong, Gauteng.",
        "metaTitle": "Khutsong Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Khutsong, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Khutsong salons",
          "Khutsong hair salon",
          "beauty salon Khutsong",
          "nails Khutsong"
        ]
      },
      {
        "slug": "kokosi",
        "name": "Kokosi",
        "province": "Gauteng",
        "description": "Discover salons in Kokosi. Book hair salons, nail studios, and beauty services in Kokosi, Gauteng.",
        "metaTitle": "Kokosi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kokosi, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kokosi salons",
          "Kokosi hair salon",
          "beauty salon Kokosi",
          "nails Kokosi"
        ]
      },
      {
        "slug": "kromdraai",
        "name": "Kromdraai",
        "province": "Gauteng",
        "description": "Discover salons in Kromdraai. Book hair salons, nail studios, and beauty services in Kromdraai, Gauteng.",
        "metaTitle": "Kromdraai Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kromdraai, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kromdraai salons",
          "Kromdraai hair salon",
          "beauty salon Kromdraai",
          "nails Kromdraai"
        ]
      },
      {
        "slug": "krugersdorp",
        "name": "Krugersdorp",
        "province": "Gauteng",
        "description": "Discover salons in Krugersdorp. Book hair salons, nail studios, and beauty services in Krugersdorp, Gauteng.",
        "metaTitle": "Krugersdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Krugersdorp, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Krugersdorp salons",
          "Krugersdorp hair salon",
          "beauty salon Krugersdorp",
          "nails Krugersdorp"
        ]
      },
      {
        "slug": "kwathema",
        "name": "KwaThema",
        "province": "Gauteng",
        "description": "Discover salons in KwaThema. Book hair salons, nail studios, and beauty services in KwaThema, Gauteng.",
        "metaTitle": "KwaThema Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in KwaThema, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "KwaThema salons",
          "KwaThema hair salon",
          "beauty salon KwaThema",
          "nails KwaThema"
        ]
      },
      {
        "slug": "lenz",
        "name": "Lenz",
        "province": "Gauteng",
        "description": "Discover salons in Lenz. Book hair salons, nail studios, and beauty services in Lenz, Gauteng.",
        "metaTitle": "Lenz Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lenz, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lenz salons",
          "Lenz hair salon",
          "beauty salon Lenz",
          "nails Lenz"
        ]
      },
      {
        "slug": "luweero",
        "name": "Luweero",
        "province": "Gauteng",
        "description": "Discover salons in Luweero. Book hair salons, nail studios, and beauty services in Luweero, Gauteng.",
        "metaTitle": "Luweero Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Luweero, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Luweero salons",
          "Luweero hair salon",
          "beauty salon Luweero",
          "nails Luweero"
        ]
      },
      {
        "slug": "mabopane",
        "name": "Mabopane",
        "province": "Gauteng",
        "description": "Discover salons in Mabopane. Book hair salons, nail studios, and beauty services in Mabopane, Gauteng.",
        "metaTitle": "Mabopane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mabopane, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mabopane salons",
          "Mabopane hair salon",
          "beauty salon Mabopane",
          "nails Mabopane"
        ]
      },
      {
        "slug": "magaliesburg",
        "name": "Magaliesburg",
        "province": "Gauteng",
        "description": "Discover salons in Magaliesburg. Book hair salons, nail studios, and beauty services in Magaliesburg, Gauteng.",
        "metaTitle": "Magaliesburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Magaliesburg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Magaliesburg salons",
          "Magaliesburg hair salon",
          "beauty salon Magaliesburg",
          "nails Magaliesburg"
        ]
      },
      {
        "slug": "mamelodi",
        "name": "Mamelodi",
        "province": "Gauteng",
        "description": "Find top-rated salons in Mamelodi, Pretoria East's largest township. Book braiding, weaves, natural hair, nails, and beauty services from trusted local professionals in Mamelodi East, West, and surrounding areas.",
        "metaTitle": "Best Salons in Mamelodi, Pretoria | Book Online | Stylr SA",
        "metaDescription": "Find and book the best salons in Mamelodi, Gauteng. Browse local braiding salons, hair professionals, and nail studios near you. Compare prices and book online today.",
        "keywords": [
          "Mamelodi salons",
          "Mamelodi hair salon",
          "beauty salon Mamelodi",
          "nails Mamelodi",
          "braiding salon Mamelodi Pretoria",
          "weave salon Mamelodi"
        ]
      },
      {
        "slug": "meyerton",
        "name": "Meyerton",
        "province": "Gauteng",
        "description": "Discover salons in Meyerton. Book hair salons, nail studios, and beauty services in Meyerton, Gauteng.",
        "metaTitle": "Meyerton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Meyerton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Meyerton salons",
          "Meyerton hair salon",
          "beauty salon Meyerton",
          "nails Meyerton"
        ]
      },
      {
        "slug": "modderfontein",
        "name": "Modderfontein",
        "province": "Gauteng",
        "description": "Discover salons in Modderfontein. Book hair salons, nail studios, and beauty services in Modderfontein, Gauteng.",
        "metaTitle": "Modderfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Modderfontein, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Modderfontein salons",
          "Modderfontein hair salon",
          "beauty salon Modderfontein",
          "nails Modderfontein"
        ]
      },
      {
        "slug": "mohlakeng",
        "name": "Mohlakeng",
        "province": "Gauteng",
        "description": "Discover salons in Mohlakeng. Book hair salons, nail studios, and beauty services in Mohlakeng, Gauteng.",
        "metaTitle": "Mohlakeng Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mohlakeng, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mohlakeng salons",
          "Mohlakeng hair salon",
          "beauty salon Mohlakeng",
          "nails Mohlakeng"
        ]
      },
      {
        "slug": "muldersdrift",
        "name": "Muldersdrift",
        "province": "Gauteng",
        "description": "Discover salons in Muldersdrift. Book hair salons, nail studios, and beauty services in Muldersdrift, Gauteng.",
        "metaTitle": "Muldersdrift Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Muldersdrift, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Muldersdrift salons",
          "Muldersdrift hair salon",
          "beauty salon Muldersdrift",
          "nails Muldersdrift"
        ]
      },
      {
        "slug": "munsieville",
        "name": "Munsieville",
        "province": "Gauteng",
        "description": "Discover salons in Munsieville. Book hair salons, nail studios, and beauty services in Munsieville, Gauteng.",
        "metaTitle": "Munsieville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Munsieville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Munsieville salons",
          "Munsieville hair salon",
          "beauty salon Munsieville",
          "nails Munsieville"
        ]
      },
      {
        "slug": "nigel",
        "name": "Nigel",
        "province": "Gauteng",
        "description": "Discover salons in Nigel. Book hair salons, nail studios, and beauty services in Nigel, Gauteng.",
        "metaTitle": "Nigel Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nigel, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nigel salons",
          "Nigel hair salon",
          "beauty salon Nigel",
          "nails Nigel"
        ]
      },
      {
        "slug": "orange-farm",
        "name": "Orange Farm",
        "province": "Gauteng",
        "description": "Discover salons in Orange Farm. Book hair salons, nail studios, and beauty services in Orange Farm, Gauteng.",
        "metaTitle": "Orange Farm Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Orange Farm, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Orange Farm salons",
          "Orange Farm hair salon",
          "beauty salon Orange Farm",
          "nails Orange Farm"
        ]
      },
      {
        "slug": "panvlak-gold-mine",
        "name": "Panvlak Gold Mine",
        "province": "Gauteng",
        "description": "Discover salons in Panvlak Gold Mine. Book hair salons, nail studios, and beauty services in Panvlak Gold Mine, Gauteng.",
        "metaTitle": "Panvlak Gold Mine Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Panvlak Gold Mine, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Panvlak Gold Mine salons",
          "Panvlak Gold Mine hair salon",
          "beauty salon Panvlak Gold Mine",
          "nails Panvlak Gold Mine"
        ]
      },
      {
        "slug": "pretoria",
        "name": "Pretoria",
        "province": "Gauteng",
        "description": "Find expert hair and beauty services in Pretoria. Book top-rated salons in Tshwane, Menlyn, and Centurion.",
        "metaTitle": "Pretoria Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pretoria, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pretoria salons",
          "Pretoria hair salon",
          "beauty salon Pretoria",
          "nails Pretoria"
        ]
      },
      {
        "slug": "randburg",
        "name": "Randburg",
        "province": "Gauteng",
        "description": "Discover salons in Randburg. Book hair salons, nail studios, and beauty services in Randburg, Gauteng.",
        "metaTitle": "Randburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Randburg, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Randburg salons",
          "Randburg hair salon",
          "beauty salon Randburg",
          "nails Randburg"
        ]
      },
      {
        "slug": "randfontein",
        "name": "Randfontein",
        "province": "Gauteng",
        "description": "Discover salons in Randfontein. Book hair salons, nail studios, and beauty services in Randfontein, Gauteng.",
        "metaTitle": "Randfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Randfontein, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Randfontein salons",
          "Randfontein hair salon",
          "beauty salon Randfontein",
          "nails Randfontein"
        ]
      },
      {
        "slug": "randvaal",
        "name": "Randvaal",
        "province": "Gauteng",
        "description": "Discover salons in Randvaal. Book hair salons, nail studios, and beauty services in Randvaal, Gauteng.",
        "metaTitle": "Randvaal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Randvaal, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Randvaal salons",
          "Randvaal hair salon",
          "beauty salon Randvaal",
          "nails Randvaal"
        ]
      },
      {
        "slug": "ratanda",
        "name": "Ratanda",
        "province": "Gauteng",
        "description": "Discover salons in Ratanda. Book hair salons, nail studios, and beauty services in Ratanda, Gauteng.",
        "metaTitle": "Ratanda Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ratanda, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ratanda salons",
          "Ratanda hair salon",
          "beauty salon Ratanda",
          "nails Ratanda"
        ]
      },
      {
        "slug": "rayton",
        "name": "Rayton",
        "province": "Gauteng",
        "description": "Discover salons in Rayton. Book hair salons, nail studios, and beauty services in Rayton, Gauteng.",
        "metaTitle": "Rayton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rayton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rayton salons",
          "Rayton hair salon",
          "beauty salon Rayton",
          "nails Rayton"
        ]
      },
      {
        "slug": "refilwe",
        "name": "Refilwe",
        "province": "Gauteng",
        "description": "Discover salons in Refilwe. Book hair salons, nail studios, and beauty services in Refilwe, Gauteng.",
        "metaTitle": "Refilwe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Refilwe, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Refilwe salons",
          "Refilwe hair salon",
          "beauty salon Refilwe",
          "nails Refilwe"
        ]
      },
      {
        "slug": "reiger-park",
        "name": "Reiger Park",
        "province": "Gauteng",
        "description": "Discover salons in Reiger Park. Book hair salons, nail studios, and beauty services in Reiger Park, Gauteng.",
        "metaTitle": "Reiger Park Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Reiger Park, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Reiger Park salons",
          "Reiger Park hair salon",
          "beauty salon Reiger Park",
          "nails Reiger Park"
        ]
      },
      {
        "slug": "rietvallei",
        "name": "Rietvallei",
        "province": "Gauteng",
        "description": "Discover salons in Rietvallei. Book hair salons, nail studios, and beauty services in Rietvallei, Gauteng.",
        "metaTitle": "Rietvallei Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rietvallei, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rietvallei salons",
          "Rietvallei hair salon",
          "beauty salon Rietvallei",
          "nails Rietvallei"
        ]
      },
      {
        "slug": "roodepoort",
        "name": "Roodepoort",
        "province": "Gauteng",
        "description": "Discover salons in Roodepoort. Book hair salons, nail studios, and beauty services in Roodepoort, Gauteng.",
        "metaTitle": "Roodepoort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Roodepoort, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Roodepoort salons",
          "Roodepoort hair salon",
          "beauty salon Roodepoort",
          "nails Roodepoort"
        ]
      },
      {
        "slug": "sandton",
        "name": "Sandton",
        "province": "Gauteng",
        "description": "Discover luxury salons in Sandton. Book premium hair and beauty services in Sandton City and surrounds.",
        "metaTitle": "Sandton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sandton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sandton salons",
          "Sandton hair salon",
          "beauty salon Sandton",
          "nails Sandton"
        ]
      },
      {
        "slug": "sebokeng",
        "name": "Sebokeng",
        "province": "Gauteng",
        "description": "Discover salons in Sebokeng. Book hair salons, nail studios, and beauty services in Sebokeng, Gauteng.",
        "metaTitle": "Sebokeng Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sebokeng, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sebokeng salons",
          "Sebokeng hair salon",
          "beauty salon Sebokeng",
          "nails Sebokeng"
        ]
      },
      {
        "slug": "sharpeville",
        "name": "Sharpeville",
        "province": "Gauteng",
        "description": "Discover salons in Sharpeville. Book hair salons, nail studios, and beauty services in Sharpeville, Gauteng.",
        "metaTitle": "Sharpeville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sharpeville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sharpeville salons",
          "Sharpeville hair salon",
          "beauty salon Sharpeville",
          "nails Sharpeville"
        ]
      },
      {
        "slug": "silverfields",
        "name": "Silverfields",
        "province": "Gauteng",
        "description": "Discover salons in Silverfields. Book hair salons, nail studios, and beauty services in Silverfields, Gauteng.",
        "metaTitle": "Silverfields Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Silverfields, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Silverfields salons",
          "Silverfields hair salon",
          "beauty salon Silverfields",
          "nails Silverfields"
        ]
      },
      {
        "slug": "simunye-westonaria",
        "name": "Simunye, Westonaria",
        "province": "Gauteng",
        "description": "Discover salons in Simunye, Westonaria. Book hair salons, nail studios, and beauty services in Simunye, Westonaria, Gauteng.",
        "metaTitle": "Simunye, Westonaria Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Simunye, Westonaria, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Simunye, Westonaria salons",
          "Simunye, Westonaria hair salon",
          "beauty salon Simunye, Westonaria",
          "nails Simunye, Westonaria"
        ]
      },
      {
        "slug": "soshanguve",
        "name": "Soshanguve",
        "province": "Gauteng",
        "description": "Find top-rated salons in Soshanguve, Pretoria's large township north of the city. Book braiding, natural hair, weaves, nails, and beauty services from trusted local professionals across Soshanguve blocks.",
        "metaTitle": "Best Salons in Soshanguve, Pretoria | Book Online | Stylr SA",
        "metaDescription": "Find and book the best salons in Soshanguve, Gauteng. Browse local hair salons, braiding specialists, and nail studios. Compare prices and book online today.",
        "keywords": [
          "Soshanguve salons",
          "Soshanguve hair salon",
          "beauty salon Soshanguve",
          "nails Soshanguve",
          "braiding salon Soshanguve Pretoria"
        ]
      },
      {
        "slug": "soweto",
        "name": "Soweto",
        "province": "Gauteng",
        "description": "Find top-rated salons in Soweto, Gauteng's largest township. Book braiding, hair relaxers, weaves, nails, and beauty services in Orlando, Meadowlands, Diepkloof, Pimville, and across Soweto.",
        "metaTitle": "Top Salons in Soweto, Gauteng | Book Online | Stylr SA",
        "metaDescription": "Find and book the best salons in Soweto, Gauteng. Browse verified hair salons, braiding specialists, nail studios, and beauty professionals across Soweto's neighbourhoods. Book online today.",
        "keywords": [
          "Soweto salons",
          "Soweto hair salon",
          "beauty salon Soweto",
          "nails Soweto",
          "braiding salon Soweto",
          "hair relaxer Soweto",
          "weave installation Soweto"
        ]
      },
      {
        "slug": "springs",
        "name": "Springs",
        "province": "Gauteng",
        "description": "Discover salons in Springs. Book hair salons, nail studios, and beauty services in Springs, Gauteng.",
        "metaTitle": "Springs Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Springs, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Springs salons",
          "Springs hair salon",
          "beauty salon Springs",
          "nails Springs"
        ]
      },
      {
        "slug": "tarlton",
        "name": "Tarlton",
        "province": "Gauteng",
        "description": "Discover salons in Tarlton. Book hair salons, nail studios, and beauty services in Tarlton, Gauteng.",
        "metaTitle": "Tarlton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tarlton, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tarlton salons",
          "Tarlton hair salon",
          "beauty salon Tarlton",
          "nails Tarlton"
        ]
      },
      {
        "slug": "tembisa",
        "name": "Tembisa",
        "province": "Gauteng",
        "description": "Find top-rated salons in Tembisa, one of Gauteng's largest townships. Book braiding, weaves, relaxers, nails, and beauty services from trusted local professionals in Tembisa and Kempton Park surrounds.",
        "metaTitle": "Best Salons in Tembisa, Gauteng | Book Online | Stylr SA",
        "metaDescription": "Find and book the best salons in Tembisa, Gauteng. Discover local hair salons, braiding specialists, and nail studios. Compare prices, read reviews, and book online.",
        "keywords": [
          "Tembisa salons",
          "Tembisa hair salon",
          "beauty salon Tembisa",
          "nails Tembisa",
          "braiding salon Tembisa",
          "weave salon Tembisa"
        ]
      },
      {
        "slug": "toekomsrus",
        "name": "Toekomsrus",
        "province": "Gauteng",
        "description": "Discover salons in Toekomsrus. Book hair salons, nail studios, and beauty services in Toekomsrus, Gauteng.",
        "metaTitle": "Toekomsrus Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Toekomsrus, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Toekomsrus salons",
          "Toekomsrus hair salon",
          "beauty salon Toekomsrus",
          "nails Toekomsrus"
        ]
      },
      {
        "slug": "tokoza",
        "name": "Tokoza",
        "province": "Gauteng",
        "description": "Discover salons in Tokoza. Book hair salons, nail studios, and beauty services in Tokoza, Gauteng.",
        "metaTitle": "Tokoza Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tokoza, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tokoza salons",
          "Tokoza hair salon",
          "beauty salon Tokoza",
          "nails Tokoza"
        ]
      },
      {
        "slug": "tsakane",
        "name": "Tsakane",
        "province": "Gauteng",
        "description": "Discover salons in Tsakane. Book hair salons, nail studios, and beauty services in Tsakane, Gauteng.",
        "metaTitle": "Tsakane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tsakane, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tsakane salons",
          "Tsakane hair salon",
          "beauty salon Tsakane",
          "nails Tsakane"
        ]
      },
      {
        "slug": "vanderbijlpark",
        "name": "Vanderbijlpark",
        "province": "Gauteng",
        "description": "Discover salons in Vanderbijlpark. Book hair salons, nail studios, and beauty services in Vanderbijlpark, Gauteng.",
        "metaTitle": "Vanderbijlpark Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vanderbijlpark, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vanderbijlpark salons",
          "Vanderbijlpark hair salon",
          "beauty salon Vanderbijlpark",
          "nails Vanderbijlpark"
        ]
      },
      {
        "slug": "vereeniging",
        "name": "Vereeniging",
        "province": "Gauteng",
        "description": "Discover salons in Vereeniging. Book hair salons, nail studios, and beauty services in Vereeniging, Gauteng.",
        "metaTitle": "Vereeniging Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vereeniging, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vereeniging salons",
          "Vereeniging hair salon",
          "beauty salon Vereeniging",
          "nails Vereeniging"
        ]
      },
      {
        "slug": "vosloorus",
        "name": "Vosloorus",
        "province": "Gauteng",
        "description": "Discover salons in Vosloorus. Book hair salons, nail studios, and beauty services in Vosloorus, Gauteng.",
        "metaTitle": "Vosloorus Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vosloorus, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vosloorus salons",
          "Vosloorus hair salon",
          "beauty salon Vosloorus",
          "nails Vosloorus"
        ]
      },
      {
        "slug": "walkerville",
        "name": "Walkerville",
        "province": "Gauteng",
        "description": "Discover salons in Walkerville. Book hair salons, nail studios, and beauty services in Walkerville, Gauteng.",
        "metaTitle": "Walkerville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Walkerville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Walkerville salons",
          "Walkerville hair salon",
          "beauty salon Walkerville",
          "nails Walkerville"
        ]
      },
      {
        "slug": "wattville",
        "name": "Wattville",
        "province": "Gauteng",
        "description": "Discover salons in Wattville. Book hair salons, nail studios, and beauty services in Wattville, Gauteng.",
        "metaTitle": "Wattville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wattville, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wattville salons",
          "Wattville hair salon",
          "beauty salon Wattville",
          "nails Wattville"
        ]
      },
      {
        "slug": "wedela",
        "name": "Wedela",
        "province": "Gauteng",
        "description": "Discover salons in Wedela. Book hair salons, nail studios, and beauty services in Wedela, Gauteng.",
        "metaTitle": "Wedela Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wedela, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wedela salons",
          "Wedela hair salon",
          "beauty salon Wedela",
          "nails Wedela"
        ]
      },
      {
        "slug": "welverdiend",
        "name": "Welverdiend",
        "province": "Gauteng",
        "description": "Discover salons in Welverdiend. Book hair salons, nail studios, and beauty services in Welverdiend, Gauteng.",
        "metaTitle": "Welverdiend Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Welverdiend, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Welverdiend salons",
          "Welverdiend hair salon",
          "beauty salon Welverdiend",
          "nails Welverdiend"
        ]
      },
      {
        "slug": "westonaria",
        "name": "Westonaria",
        "province": "Gauteng",
        "description": "Discover salons in Westonaria. Book hair salons, nail studios, and beauty services in Westonaria, Gauteng.",
        "metaTitle": "Westonaria Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Westonaria, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Westonaria salons",
          "Westonaria hair salon",
          "beauty salon Westonaria",
          "nails Westonaria"
        ]
      },
      {
        "slug": "winterveld",
        "name": "Winterveld",
        "province": "Gauteng",
        "description": "Discover salons in Winterveld. Book hair salons, nail studios, and beauty services in Winterveld, Gauteng.",
        "metaTitle": "Winterveld Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Winterveld, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Winterveld salons",
          "Winterveld hair salon",
          "beauty salon Winterveld",
          "nails Winterveld"
        ]
      },
      {
        "slug": "zenzele",
        "name": "Zenzele",
        "province": "Gauteng",
        "description": "Discover salons in Zenzele. Book hair salons, nail studios, and beauty services in Zenzele, Gauteng.",
        "metaTitle": "Zenzele Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Zenzele, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Zenzele salons",
          "Zenzele hair salon",
          "beauty salon Zenzele",
          "nails Zenzele"
        ]
      },
      {
        "slug": "zithobeni",
        "name": "Zithobeni",
        "province": "Gauteng",
        "description": "Discover salons in Zithobeni. Book hair salons, nail studios, and beauty services in Zithobeni, Gauteng.",
        "metaTitle": "Zithobeni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Zithobeni, Gauteng. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Zithobeni salons",
          "Zithobeni hair salon",
          "beauty salon Zithobeni",
          "nails Zithobeni"
        ]
      }
    ]
  },
  "mpumalanga": {
    "slug": "mpumalanga",
    "name": "Mpumalanga",
    "description": "Explore beauty services in Mpumalanga. Find salons in Nelspruit, Witbank, and Secunda.",
    "metaTitle": "Mpumalanga Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Mpumalanga. Book hair, nail, and beauty appointments at the best salons in Mpumalanga.",
    "keywords": [
      "Mpumalanga salons",
      "Mpumalanga hair salons"
    ],
    "cities": [
      {
        "slug": "barberton",
        "name": "Barberton",
        "province": "Mpumalanga",
        "description": "Discover salons in Barberton. Book hair salons, nail studios, and beauty services in Barberton, Mpumalanga.",
        "metaTitle": "Barberton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Barberton, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Barberton salons",
          "Barberton hair salon",
          "beauty salon Barberton",
          "nails Barberton"
        ]
      },
      {
        "slug": "belfast",
        "name": "Belfast",
        "province": "Mpumalanga",
        "description": "Discover salons in Belfast. Book hair salons, nail studios, and beauty services in Belfast, Mpumalanga.",
        "metaTitle": "Belfast Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Belfast, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Belfast salons",
          "Belfast hair salon",
          "beauty salon Belfast",
          "nails Belfast"
        ]
      },
      {
        "slug": "bethal",
        "name": "Bethal",
        "province": "Mpumalanga",
        "description": "Discover salons in Bethal. Book hair salons, nail studios, and beauty services in Bethal, Mpumalanga.",
        "metaTitle": "Bethal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bethal, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bethal salons",
          "Bethal hair salon",
          "beauty salon Bethal",
          "nails Bethal"
        ]
      },
      {
        "slug": "breyten",
        "name": "Breyten",
        "province": "Mpumalanga",
        "description": "Discover salons in Breyten. Book hair salons, nail studios, and beauty services in Breyten, Mpumalanga.",
        "metaTitle": "Breyten Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Breyten, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Breyten salons",
          "Breyten hair salon",
          "beauty salon Breyten",
          "nails Breyten"
        ]
      },
      {
        "slug": "bushbuckridge",
        "name": "Bushbuckridge",
        "province": "Mpumalanga",
        "description": "Discover salons in Bushbuckridge. Book hair salons, nail studios, and beauty services in Bushbuckridge, Mpumalanga.",
        "metaTitle": "Bushbuckridge Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bushbuckridge, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bushbuckridge salons",
          "Bushbuckridge hair salon",
          "beauty salon Bushbuckridge",
          "nails Bushbuckridge"
        ]
      },
      {
        "slug": "carolina",
        "name": "Carolina",
        "province": "Mpumalanga",
        "description": "Discover salons in Carolina. Book hair salons, nail studios, and beauty services in Carolina, Mpumalanga.",
        "metaTitle": "Carolina Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Carolina, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Carolina salons",
          "Carolina hair salon",
          "beauty salon Carolina",
          "nails Carolina"
        ]
      },
      {
        "slug": "delmas",
        "name": "Delmas",
        "province": "Mpumalanga",
        "description": "Discover salons in Delmas. Book hair salons, nail studios, and beauty services in Delmas, Mpumalanga.",
        "metaTitle": "Delmas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Delmas, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Delmas salons",
          "Delmas hair salon",
          "beauty salon Delmas",
          "nails Delmas"
        ]
      },
      {
        "slug": "dullstroom",
        "name": "Dullstroom",
        "province": "Mpumalanga",
        "description": "Discover salons in Dullstroom. Book hair salons, nail studios, and beauty services in Dullstroom, Mpumalanga.",
        "metaTitle": "Dullstroom Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dullstroom, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dullstroom salons",
          "Dullstroom hair salon",
          "beauty salon Dullstroom",
          "nails Dullstroom"
        ]
      },
      {
        "slug": "eerstehoek",
        "name": "Eerstehoek",
        "province": "Mpumalanga",
        "description": "Discover salons in Eerstehoek. Book hair salons, nail studios, and beauty services in Eerstehoek, Mpumalanga.",
        "metaTitle": "Eerstehoek Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Eerstehoek, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Eerstehoek salons",
          "Eerstehoek hair salon",
          "beauty salon Eerstehoek",
          "nails Eerstehoek"
        ]
      },
      {
        "slug": "elukwatini",
        "name": "Elukwatini",
        "province": "Mpumalanga",
        "description": "Discover salons in Elukwatini. Book hair salons, nail studios, and beauty services in Elukwatini, Mpumalanga.",
        "metaTitle": "Elukwatini Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elukwatini, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elukwatini salons",
          "Elukwatini hair salon",
          "beauty salon Elukwatini",
          "nails Elukwatini"
        ]
      },
      {
        "slug": "emalahleni",
        "name": "Emalahleni",
        "province": "Mpumalanga",
        "description": "Discover salons in Emalahleni. Book hair salons, nail studios, and beauty services in Emalahleni, Mpumalanga.",
        "metaTitle": "Emalahleni Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Emalahleni, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Emalahleni salons",
          "Emalahleni hair salon",
          "beauty salon Emalahleni",
          "nails Emalahleni"
        ]
      },
      {
        "slug": "ermelo",
        "name": "Ermelo",
        "province": "Mpumalanga",
        "description": "Discover salons in Ermelo. Book hair salons, nail studios, and beauty services in Ermelo, Mpumalanga.",
        "metaTitle": "Ermelo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ermelo, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ermelo salons",
          "Ermelo hair salon",
          "beauty salon Ermelo",
          "nails Ermelo"
        ]
      },
      {
        "slug": "graskop",
        "name": "Graskop",
        "province": "Mpumalanga",
        "description": "Discover salons in Graskop. Book hair salons, nail studios, and beauty services in Graskop, Mpumalanga.",
        "metaTitle": "Graskop Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Graskop, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Graskop salons",
          "Graskop hair salon",
          "beauty salon Graskop",
          "nails Graskop"
        ]
      },
      {
        "slug": "hazyview",
        "name": "Hazyview",
        "province": "Mpumalanga",
        "description": "Discover salons in Hazyview. Book hair salons, nail studios, and beauty services in Hazyview, Mpumalanga.",
        "metaTitle": "Hazyview Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hazyview, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hazyview salons",
          "Hazyview hair salon",
          "beauty salon Hazyview",
          "nails Hazyview"
        ]
      },
      {
        "slug": "hendrina",
        "name": "Hendrina",
        "province": "Mpumalanga",
        "description": "Discover salons in Hendrina. Book hair salons, nail studios, and beauty services in Hendrina, Mpumalanga.",
        "metaTitle": "Hendrina Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hendrina, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hendrina salons",
          "Hendrina hair salon",
          "beauty salon Hendrina",
          "nails Hendrina"
        ]
      },
      {
        "slug": "komatipoort",
        "name": "Komatipoort",
        "province": "Mpumalanga",
        "description": "Discover salons in Komatipoort. Book hair salons, nail studios, and beauty services in Komatipoort, Mpumalanga.",
        "metaTitle": "Komatipoort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Komatipoort, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Komatipoort salons",
          "Komatipoort hair salon",
          "beauty salon Komatipoort",
          "nails Komatipoort"
        ]
      },
      {
        "slug": "kriel",
        "name": "Kriel",
        "province": "Mpumalanga",
        "description": "Discover salons in Kriel. Book hair salons, nail studios, and beauty services in Kriel, Mpumalanga.",
        "metaTitle": "Kriel Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kriel, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kriel salons",
          "Kriel hair salon",
          "beauty salon Kriel",
          "nails Kriel"
        ]
      },
      {
        "slug": "lydenburg",
        "name": "Lydenburg",
        "province": "Mpumalanga",
        "description": "Discover salons in Lydenburg. Book hair salons, nail studios, and beauty services in Lydenburg, Mpumalanga.",
        "metaTitle": "Lydenburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lydenburg, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lydenburg salons",
          "Lydenburg hair salon",
          "beauty salon Lydenburg",
          "nails Lydenburg"
        ]
      },
      {
        "slug": "machadodorp",
        "name": "Machadodorp",
        "province": "Mpumalanga",
        "description": "Discover salons in Machadodorp. Book hair salons, nail studios, and beauty services in Machadodorp, Mpumalanga.",
        "metaTitle": "Machadodorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Machadodorp, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Machadodorp salons",
          "Machadodorp hair salon",
          "beauty salon Machadodorp",
          "nails Machadodorp"
        ]
      },
      {
        "slug": "malelane",
        "name": "Malelane",
        "province": "Mpumalanga",
        "description": "Discover salons in Malelane. Book hair salons, nail studios, and beauty services in Malelane, Mpumalanga.",
        "metaTitle": "Malelane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Malelane, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Malelane salons",
          "Malelane hair salon",
          "beauty salon Malelane",
          "nails Malelane"
        ]
      },
      {
        "slug": "middleburg",
        "name": "Middleburg",
        "province": "Mpumalanga",
        "description": "Discover salons in Middleburg. Book hair salons, nail studios, and beauty services in Middleburg, Mpumalanga.",
        "metaTitle": "Middleburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Middleburg, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Middleburg salons",
          "Middleburg hair salon",
          "beauty salon Middleburg",
          "nails Middleburg"
        ]
      },
      {
        "slug": "nelspruit",
        "name": "Nelspruit",
        "province": "Mpumalanga",
        "description": "Discover salons in Nelspruit. Book hair salons, nail studios, and beauty services in Nelspruit, Mpumalanga.",
        "metaTitle": "Nelspruit Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Nelspruit, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Nelspruit salons",
          "Nelspruit hair salon",
          "beauty salon Nelspruit",
          "nails Nelspruit"
        ]
      },
      {
        "slug": "ohrigstad",
        "name": "Ohrigstad",
        "province": "Mpumalanga",
        "description": "Discover salons in Ohrigstad. Book hair salons, nail studios, and beauty services in Ohrigstad, Mpumalanga.",
        "metaTitle": "Ohrigstad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ohrigstad, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ohrigstad salons",
          "Ohrigstad hair salon",
          "beauty salon Ohrigstad",
          "nails Ohrigstad"
        ]
      },
      {
        "slug": "piet-retief",
        "name": "Piet Retief",
        "province": "Mpumalanga",
        "description": "Discover salons in Piet Retief. Book hair salons, nail studios, and beauty services in Piet Retief, Mpumalanga.",
        "metaTitle": "Piet Retief Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Piet Retief, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Piet Retief salons",
          "Piet Retief hair salon",
          "beauty salon Piet Retief",
          "nails Piet Retief"
        ]
      },
      {
        "slug": "pilgrims-rest",
        "name": "Pilgrim's Rest",
        "province": "Mpumalanga",
        "description": "Discover salons in Pilgrim's Rest. Book hair salons, nail studios, and beauty services in Pilgrim's Rest, Mpumalanga.",
        "metaTitle": "Pilgrim's Rest Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pilgrim's Rest, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pilgrim's Rest salons",
          "Pilgrim's Rest hair salon",
          "beauty salon Pilgrim's Rest",
          "nails Pilgrim's Rest"
        ]
      },
      {
        "slug": "sabie",
        "name": "Sabie",
        "province": "Mpumalanga",
        "description": "Discover salons in Sabie. Book hair salons, nail studios, and beauty services in Sabie, Mpumalanga.",
        "metaTitle": "Sabie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sabie, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sabie salons",
          "Sabie hair salon",
          "beauty salon Sabie",
          "nails Sabie"
        ]
      },
      {
        "slug": "secunda",
        "name": "Secunda",
        "province": "Mpumalanga",
        "description": "Discover salons in Secunda. Book hair salons, nail studios, and beauty services in Secunda, Mpumalanga.",
        "metaTitle": "Secunda Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Secunda, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Secunda salons",
          "Secunda hair salon",
          "beauty salon Secunda",
          "nails Secunda"
        ]
      },
      {
        "slug": "standerton",
        "name": "Standerton",
        "province": "Mpumalanga",
        "description": "Discover salons in Standerton. Book hair salons, nail studios, and beauty services in Standerton, Mpumalanga.",
        "metaTitle": "Standerton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Standerton, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Standerton salons",
          "Standerton hair salon",
          "beauty salon Standerton",
          "nails Standerton"
        ]
      },
      {
        "slug": "thulamahashe",
        "name": "Thulamahashe",
        "province": "Mpumalanga",
        "description": "Discover salons in Thulamahashe. Book hair salons, nail studios, and beauty services in Thulamahashe, Mpumalanga.",
        "metaTitle": "Thulamahashe Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Thulamahashe, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Thulamahashe salons",
          "Thulamahashe hair salon",
          "beauty salon Thulamahashe",
          "nails Thulamahashe"
        ]
      },
      {
        "slug": "volksrust",
        "name": "Volksrust",
        "province": "Mpumalanga",
        "description": "Discover salons in Volksrust. Book hair salons, nail studios, and beauty services in Volksrust, Mpumalanga.",
        "metaTitle": "Volksrust Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Volksrust, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Volksrust salons",
          "Volksrust hair salon",
          "beauty salon Volksrust",
          "nails Volksrust"
        ]
      },
      {
        "slug": "wakkerstroom",
        "name": "Wakkerstroom",
        "province": "Mpumalanga",
        "description": "Discover salons in Wakkerstroom. Book hair salons, nail studios, and beauty services in Wakkerstroom, Mpumalanga.",
        "metaTitle": "Wakkerstroom Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wakkerstroom, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wakkerstroom salons",
          "Wakkerstroom hair salon",
          "beauty salon Wakkerstroom",
          "nails Wakkerstroom"
        ]
      },
      {
        "slug": "white-river",
        "name": "White River",
        "province": "Mpumalanga",
        "description": "Discover salons in White River. Book hair salons, nail studios, and beauty services in White River, Mpumalanga.",
        "metaTitle": "White River Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in White River, Mpumalanga. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "White River salons",
          "White River hair salon",
          "beauty salon White River",
          "nails White River"
        ]
      }
    ]
  },
  "limpopo": {
    "slug": "limpopo",
    "name": "Limpopo",
    "description": "Discover salons in Limpopo. Book appointments in Polokwane, Tzaneen, and Thohoyandou.",
    "metaTitle": "Limpopo Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Limpopo. Book hair, nail, and beauty appointments at the best salons in Limpopo.",
    "keywords": [
      "Limpopo salons",
      "Limpopo hair salons"
    ],
    "cities": [
      {
        "slug": "alldays",
        "name": "Alldays",
        "province": "Limpopo",
        "description": "Discover salons in Alldays. Book hair salons, nail studios, and beauty services in Alldays, Limpopo.",
        "metaTitle": "Alldays Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Alldays, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Alldays salons",
          "Alldays hair salon",
          "beauty salon Alldays",
          "nails Alldays"
        ]
      },
      {
        "slug": "bela-bela",
        "name": "Bela-Bela",
        "province": "Limpopo",
        "description": "Discover salons in Bela-Bela. Book hair salons, nail studios, and beauty services in Bela-Bela, Limpopo.",
        "metaTitle": "Bela-Bela Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bela-Bela, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bela-Bela salons",
          "Bela-Bela hair salon",
          "beauty salon Bela-Bela",
          "nails Bela-Bela"
        ]
      },
      {
        "slug": "burgersfort",
        "name": "Burgersfort",
        "province": "Limpopo",
        "description": "Discover salons in Burgersfort. Book hair salons, nail studios, and beauty services in Burgersfort, Limpopo.",
        "metaTitle": "Burgersfort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Burgersfort, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Burgersfort salons",
          "Burgersfort hair salon",
          "beauty salon Burgersfort",
          "nails Burgersfort"
        ]
      },
      {
        "slug": "dendron",
        "name": "Dendron",
        "province": "Limpopo",
        "description": "Discover salons in Dendron. Book hair salons, nail studios, and beauty services in Dendron, Limpopo.",
        "metaTitle": "Dendron Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dendron, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dendron salons",
          "Dendron hair salon",
          "beauty salon Dendron",
          "nails Dendron"
        ]
      },
      {
        "slug": "duiwelskloof",
        "name": "Duiwelskloof",
        "province": "Limpopo",
        "description": "Discover salons in Duiwelskloof. Book hair salons, nail studios, and beauty services in Duiwelskloof, Limpopo.",
        "metaTitle": "Duiwelskloof Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Duiwelskloof, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Duiwelskloof salons",
          "Duiwelskloof hair salon",
          "beauty salon Duiwelskloof",
          "nails Duiwelskloof"
        ]
      },
      {
        "slug": "ellisras",
        "name": "Ellisras",
        "province": "Limpopo",
        "description": "Discover salons in Ellisras. Book hair salons, nail studios, and beauty services in Ellisras, Limpopo.",
        "metaTitle": "Ellisras Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ellisras, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ellisras salons",
          "Ellisras hair salon",
          "beauty salon Ellisras",
          "nails Ellisras"
        ]
      },
      {
        "slug": "giyani",
        "name": "Giyani",
        "province": "Limpopo",
        "description": "Discover salons in Giyani. Book hair salons, nail studios, and beauty services in Giyani, Limpopo.",
        "metaTitle": "Giyani Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Giyani, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Giyani salons",
          "Giyani hair salon",
          "beauty salon Giyani",
          "nails Giyani"
        ]
      },
      {
        "slug": "groblersdal",
        "name": "Groblersdal",
        "province": "Limpopo",
        "description": "Discover salons in Groblersdal. Book hair salons, nail studios, and beauty services in Groblersdal, Limpopo.",
        "metaTitle": "Groblersdal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Groblersdal, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Groblersdal salons",
          "Groblersdal hair salon",
          "beauty salon Groblersdal",
          "nails Groblersdal"
        ]
      },
      {
        "slug": "hoedspruit",
        "name": "Hoedspruit",
        "province": "Limpopo",
        "description": "Discover salons in Hoedspruit. Book hair salons, nail studios, and beauty services in Hoedspruit, Limpopo.",
        "metaTitle": "Hoedspruit Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hoedspruit, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hoedspruit salons",
          "Hoedspruit hair salon",
          "beauty salon Hoedspruit",
          "nails Hoedspruit"
        ]
      },
      {
        "slug": "jane-furse",
        "name": "Jane Furse",
        "province": "Limpopo",
        "description": "Discover salons in Jane Furse. Book hair salons, nail studios, and beauty services in Jane Furse, Limpopo.",
        "metaTitle": "Jane Furse Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jane Furse, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jane Furse salons",
          "Jane Furse hair salon",
          "beauty salon Jane Furse",
          "nails Jane Furse"
        ]
      },
      {
        "slug": "lebowakgomo",
        "name": "Lebowakgomo",
        "province": "Limpopo",
        "description": "Discover salons in Lebowakgomo. Book hair salons, nail studios, and beauty services in Lebowakgomo, Limpopo.",
        "metaTitle": "Lebowakgomo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lebowakgomo, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lebowakgomo salons",
          "Lebowakgomo hair salon",
          "beauty salon Lebowakgomo",
          "nails Lebowakgomo"
        ]
      },
      {
        "slug": "lephalale",
        "name": "Lephalale",
        "province": "Limpopo",
        "description": "Discover salons in Lephalale. Book hair salons, nail studios, and beauty services in Lephalale, Limpopo.",
        "metaTitle": "Lephalale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lephalale, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lephalale salons",
          "Lephalale hair salon",
          "beauty salon Lephalale",
          "nails Lephalale"
        ]
      },
      {
        "slug": "louis-trichardt",
        "name": "Louis Trichardt",
        "province": "Limpopo",
        "description": "Discover salons in Louis Trichardt. Book hair salons, nail studios, and beauty services in Louis Trichardt, Limpopo.",
        "metaTitle": "Louis Trichardt Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Louis Trichardt, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Louis Trichardt salons",
          "Louis Trichardt hair salon",
          "beauty salon Louis Trichardt",
          "nails Louis Trichardt"
        ]
      },
      {
        "slug": "marble-hall",
        "name": "Marble Hall",
        "province": "Limpopo",
        "description": "Discover salons in Marble Hall. Book hair salons, nail studios, and beauty services in Marble Hall, Limpopo.",
        "metaTitle": "Marble Hall Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Marble Hall, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Marble Hall salons",
          "Marble Hall hair salon",
          "beauty salon Marble Hall",
          "nails Marble Hall"
        ]
      },
      {
        "slug": "messina",
        "name": "Messina",
        "province": "Limpopo",
        "description": "Discover salons in Messina. Book hair salons, nail studios, and beauty services in Messina, Limpopo.",
        "metaTitle": "Messina Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Messina, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Messina salons",
          "Messina hair salon",
          "beauty salon Messina",
          "nails Messina"
        ]
      },
      {
        "slug": "modimolle",
        "name": "Modimolle",
        "province": "Limpopo",
        "description": "Discover salons in Modimolle. Book hair salons, nail studios, and beauty services in Modimolle, Limpopo.",
        "metaTitle": "Modimolle Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Modimolle, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Modimolle salons",
          "Modimolle hair salon",
          "beauty salon Modimolle",
          "nails Modimolle"
        ]
      },
      {
        "slug": "mokopane",
        "name": "Mokopane",
        "province": "Limpopo",
        "description": "Discover salons in Mokopane. Book hair salons, nail studios, and beauty services in Mokopane, Limpopo.",
        "metaTitle": "Mokopane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mokopane, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mokopane salons",
          "Mokopane hair salon",
          "beauty salon Mokopane",
          "nails Mokopane"
        ]
      },
      {
        "slug": "mookgophong",
        "name": "Mookgophong",
        "province": "Limpopo",
        "description": "Discover salons in Mookgophong. Book hair salons, nail studios, and beauty services in Mookgophong, Limpopo.",
        "metaTitle": "Mookgophong Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mookgophong, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mookgophong salons",
          "Mookgophong hair salon",
          "beauty salon Mookgophong",
          "nails Mookgophong"
        ]
      },
      {
        "slug": "musina",
        "name": "Musina",
        "province": "Limpopo",
        "description": "Discover salons in Musina. Book hair salons, nail studios, and beauty services in Musina, Limpopo.",
        "metaTitle": "Musina Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Musina, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Musina salons",
          "Musina hair salon",
          "beauty salon Musina",
          "nails Musina"
        ]
      },
      {
        "slug": "phalaborwa",
        "name": "Phalaborwa",
        "province": "Limpopo",
        "description": "Discover salons in Phalaborwa. Book hair salons, nail studios, and beauty services in Phalaborwa, Limpopo.",
        "metaTitle": "Phalaborwa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Phalaborwa, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Phalaborwa salons",
          "Phalaborwa hair salon",
          "beauty salon Phalaborwa",
          "nails Phalaborwa"
        ]
      },
      {
        "slug": "polokwane",
        "name": "Polokwane",
        "province": "Limpopo",
        "description": "Discover salons in Polokwane. Book hair salons, nail studios, and beauty services in Polokwane, Limpopo.",
        "metaTitle": "Polokwane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Polokwane, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Polokwane salons",
          "Polokwane hair salon",
          "beauty salon Polokwane",
          "nails Polokwane"
        ]
      },
      {
        "slug": "seshego",
        "name": "Seshego",
        "province": "Limpopo",
        "description": "Discover salons in Seshego. Book hair salons, nail studios, and beauty services in Seshego, Limpopo.",
        "metaTitle": "Seshego Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Seshego, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Seshego salons",
          "Seshego hair salon",
          "beauty salon Seshego",
          "nails Seshego"
        ]
      },
      {
        "slug": "thabazimbi",
        "name": "Thabazimbi",
        "province": "Limpopo",
        "description": "Discover salons in Thabazimbi. Book hair salons, nail studios, and beauty services in Thabazimbi, Limpopo.",
        "metaTitle": "Thabazimbi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Thabazimbi, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Thabazimbi salons",
          "Thabazimbi hair salon",
          "beauty salon Thabazimbi",
          "nails Thabazimbi"
        ]
      },
      {
        "slug": "thohoyandou",
        "name": "Thohoyandou",
        "province": "Limpopo",
        "description": "Discover salons in Thohoyandou. Book hair salons, nail studios, and beauty services in Thohoyandou, Limpopo.",
        "metaTitle": "Thohoyandou Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Thohoyandou, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Thohoyandou salons",
          "Thohoyandou hair salon",
          "beauty salon Thohoyandou",
          "nails Thohoyandou"
        ]
      },
      {
        "slug": "tlakgameng",
        "name": "Tlakgameng",
        "province": "Limpopo",
        "description": "Discover salons in Tlakgameng. Book hair salons, nail studios, and beauty services in Tlakgameng, Limpopo.",
        "metaTitle": "Tlakgameng Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tlakgameng, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tlakgameng salons",
          "Tlakgameng hair salon",
          "beauty salon Tlakgameng",
          "nails Tlakgameng"
        ]
      },
      {
        "slug": "tzaneen",
        "name": "Tzaneen",
        "province": "Limpopo",
        "description": "Discover salons in Tzaneen. Book hair salons, nail studios, and beauty services in Tzaneen, Limpopo.",
        "metaTitle": "Tzaneen Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tzaneen, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tzaneen salons",
          "Tzaneen hair salon",
          "beauty salon Tzaneen",
          "nails Tzaneen"
        ]
      },
      {
        "slug": "vaalwater",
        "name": "Vaalwater",
        "province": "Limpopo",
        "description": "Discover salons in Vaalwater. Book hair salons, nail studios, and beauty services in Vaalwater, Limpopo.",
        "metaTitle": "Vaalwater Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vaalwater, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vaalwater salons",
          "Vaalwater hair salon",
          "beauty salon Vaalwater",
          "nails Vaalwater"
        ]
      },
      {
        "slug": "vivo",
        "name": "Vivo",
        "province": "Limpopo",
        "description": "Discover salons in Vivo. Book hair salons, nail studios, and beauty services in Vivo, Limpopo.",
        "metaTitle": "Vivo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vivo, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vivo salons",
          "Vivo hair salon",
          "beauty salon Vivo",
          "nails Vivo"
        ]
      },
      {
        "slug": "warmbaths",
        "name": "Warmbaths",
        "province": "Limpopo",
        "description": "Discover salons in Warmbaths. Book hair salons, nail studios, and beauty services in Warmbaths, Limpopo.",
        "metaTitle": "Warmbaths Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Warmbaths, Limpopo. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Warmbaths salons",
          "Warmbaths hair salon",
          "beauty salon Warmbaths",
          "nails Warmbaths"
        ]
      }
    ]
  },
  "north-west": {
    "slug": "north-west",
    "name": "North West",
    "description": "Find top-rated salons and spas in North West. Book appointments at the best hair salons, nail studios, and wellness centers in Rustenburg, Potchefstroom, and Mahikeng.",
    "metaTitle": "North West Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in North West. Book hair, nail, and beauty appointments at the best salons in North West.",
    "keywords": [
      "North West salons",
      "North West hair salons"
    ],
    "cities": [
      {
        "slug": "bloemhof",
        "name": "Bloemhof",
        "province": "North West",
        "description": "Discover salons in Bloemhof. Book hair salons, nail studios, and beauty services in Bloemhof, North West.",
        "metaTitle": "Bloemhof Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bloemhof, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bloemhof salons",
          "Bloemhof hair salon",
          "beauty salon Bloemhof",
          "nails Bloemhof"
        ]
      },
      {
        "slug": "brits",
        "name": "Brits",
        "province": "North West",
        "description": "Discover salons in Brits. Book hair salons, nail studios, and beauty services in Brits, North West.",
        "metaTitle": "Brits Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brits, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brits salons",
          "Brits hair salon",
          "beauty salon Brits",
          "nails Brits"
        ]
      },
      {
        "slug": "christiana",
        "name": "Christiana",
        "province": "North West",
        "description": "Discover salons in Christiana. Book hair salons, nail studios, and beauty services in Christiana, North West.",
        "metaTitle": "Christiana Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Christiana, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Christiana salons",
          "Christiana hair salon",
          "beauty salon Christiana",
          "nails Christiana"
        ]
      },
      {
        "slug": "coligny",
        "name": "Coligny",
        "province": "North West",
        "description": "Discover salons in Coligny. Book hair salons, nail studios, and beauty services in Coligny, North West.",
        "metaTitle": "Coligny Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Coligny, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Coligny salons",
          "Coligny hair salon",
          "beauty salon Coligny",
          "nails Coligny"
        ]
      },
      {
        "slug": "delareyville",
        "name": "Delareyville",
        "province": "North West",
        "description": "Discover salons in Delareyville. Book hair salons, nail studios, and beauty services in Delareyville, North West.",
        "metaTitle": "Delareyville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Delareyville, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Delareyville salons",
          "Delareyville hair salon",
          "beauty salon Delareyville",
          "nails Delareyville"
        ]
      },
      {
        "slug": "ga-rankuwa",
        "name": "Ga-Rankuwa",
        "province": "North West",
        "description": "Discover salons in Ga-Rankuwa. Book hair salons, nail studios, and beauty services in Ga-Rankuwa, North West.",
        "metaTitle": "Ga-Rankuwa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ga-Rankuwa, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ga-Rankuwa salons",
          "Ga-Rankuwa hair salon",
          "beauty salon Ga-Rankuwa",
          "nails Ga-Rankuwa"
        ]
      },
      {
        "slug": "ganyesa",
        "name": "Ganyesa",
        "province": "North West",
        "description": "Discover salons in Ganyesa. Book hair salons, nail studios, and beauty services in Ganyesa, North West.",
        "metaTitle": "Ganyesa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ganyesa, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ganyesa salons",
          "Ganyesa hair salon",
          "beauty salon Ganyesa",
          "nails Ganyesa"
        ]
      },
      {
        "slug": "groot-marico",
        "name": "Groot Marico",
        "province": "North West",
        "description": "Discover salons in Groot Marico. Book hair salons, nail studios, and beauty services in Groot Marico, North West.",
        "metaTitle": "Groot Marico Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Groot Marico, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Groot Marico salons",
          "Groot Marico hair salon",
          "beauty salon Groot Marico",
          "nails Groot Marico"
        ]
      },
      {
        "slug": "hartbeesfontein",
        "name": "Hartbeesfontein",
        "province": "North West",
        "description": "Discover salons in Hartbeesfontein. Book hair salons, nail studios, and beauty services in Hartbeesfontein, North West.",
        "metaTitle": "Hartbeesfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hartbeesfontein, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hartbeesfontein salons",
          "Hartbeesfontein hair salon",
          "beauty salon Hartbeesfontein",
          "nails Hartbeesfontein"
        ]
      },
      {
        "slug": "klerksdorp",
        "name": "Klerksdorp",
        "province": "North West",
        "description": "Discover salons in Klerksdorp. Book hair salons, nail studios, and beauty services in Klerksdorp, North West.",
        "metaTitle": "Klerksdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Klerksdorp, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Klerksdorp salons",
          "Klerksdorp hair salon",
          "beauty salon Klerksdorp",
          "nails Klerksdorp"
        ]
      },
      {
        "slug": "koster",
        "name": "Koster",
        "province": "North West",
        "description": "Discover salons in Koster. Book hair salons, nail studios, and beauty services in Koster, North West.",
        "metaTitle": "Koster Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Koster, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Koster salons",
          "Koster hair salon",
          "beauty salon Koster",
          "nails Koster"
        ]
      },
      {
        "slug": "lichtenburg",
        "name": "Lichtenburg",
        "province": "North West",
        "description": "Discover salons in Lichtenburg. Book hair salons, nail studios, and beauty services in Lichtenburg, North West.",
        "metaTitle": "Lichtenburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lichtenburg, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lichtenburg salons",
          "Lichtenburg hair salon",
          "beauty salon Lichtenburg",
          "nails Lichtenburg"
        ]
      },
      {
        "slug": "mafikeng",
        "name": "Mafikeng",
        "province": "North West",
        "description": "Discover salons in Mafikeng. Book hair salons, nail studios, and beauty services in Mafikeng, North West.",
        "metaTitle": "Mafikeng Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mafikeng, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mafikeng salons",
          "Mafikeng hair salon",
          "beauty salon Mafikeng",
          "nails Mafikeng"
        ]
      },
      {
        "slug": "mahikeng",
        "name": "Mahikeng",
        "province": "North West",
        "description": "Discover salons in Mahikeng. Book hair salons, nail studios, and beauty services in Mahikeng, North West.",
        "metaTitle": "Mahikeng Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mahikeng, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mahikeng salons",
          "Mahikeng hair salon",
          "beauty salon Mahikeng",
          "nails Mahikeng"
        ]
      },
      {
        "slug": "makwassie",
        "name": "Makwassie",
        "province": "North West",
        "description": "Discover salons in Makwassie. Book hair salons, nail studios, and beauty services in Makwassie, North West.",
        "metaTitle": "Makwassie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Makwassie, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Makwassie salons",
          "Makwassie hair salon",
          "beauty salon Makwassie",
          "nails Makwassie"
        ]
      },
      {
        "slug": "mooinooi",
        "name": "Mooinooi",
        "province": "North West",
        "description": "Discover salons in Mooinooi. Book hair salons, nail studios, and beauty services in Mooinooi, North West.",
        "metaTitle": "Mooinooi Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mooinooi, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mooinooi salons",
          "Mooinooi hair salon",
          "beauty salon Mooinooi",
          "nails Mooinooi"
        ]
      },
      {
        "slug": "orkney",
        "name": "Orkney",
        "province": "North West",
        "description": "Discover salons in Orkney. Book hair salons, nail studios, and beauty services in Orkney, North West.",
        "metaTitle": "Orkney Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Orkney, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Orkney salons",
          "Orkney hair salon",
          "beauty salon Orkney",
          "nails Orkney"
        ]
      },
      {
        "slug": "ottosdal",
        "name": "Ottosdal",
        "province": "North West",
        "description": "Discover salons in Ottosdal. Book hair salons, nail studios, and beauty services in Ottosdal, North West.",
        "metaTitle": "Ottosdal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ottosdal, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ottosdal salons",
          "Ottosdal hair salon",
          "beauty salon Ottosdal",
          "nails Ottosdal"
        ]
      },
      {
        "slug": "parys",
        "name": "Parys",
        "province": "North West",
        "description": "Discover salons in Parys. Book hair salons, nail studios, and beauty services in Parys, North West.",
        "metaTitle": "Parys Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Parys, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Parys salons",
          "Parys hair salon",
          "beauty salon Parys",
          "nails Parys"
        ]
      },
      {
        "slug": "potchefstroom",
        "name": "Potchefstroom",
        "province": "North West",
        "description": "Discover salons in Potchefstroom. Book hair salons, nail studios, and beauty services in Potchefstroom, North West.",
        "metaTitle": "Potchefstroom Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Potchefstroom, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Potchefstroom salons",
          "Potchefstroom hair salon",
          "beauty salon Potchefstroom",
          "nails Potchefstroom"
        ]
      },
      {
        "slug": "rustenburg",
        "name": "Rustenburg",
        "province": "North West",
        "description": "Discover salons in Rustenburg. Book hair salons, nail studios, and beauty services in Rustenburg, North West.",
        "metaTitle": "Rustenburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rustenburg, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rustenburg salons",
          "Rustenburg hair salon",
          "beauty salon Rustenburg",
          "nails Rustenburg"
        ]
      },
      {
        "slug": "schweizer-reneke",
        "name": "Schweizer-Reneke",
        "province": "North West",
        "description": "Discover salons in Schweizer-Reneke. Book hair salons, nail studios, and beauty services in Schweizer-Reneke, North West.",
        "metaTitle": "Schweizer-Reneke Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Schweizer-Reneke, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Schweizer-Reneke salons",
          "Schweizer-Reneke hair salon",
          "beauty salon Schweizer-Reneke",
          "nails Schweizer-Reneke"
        ]
      },
      {
        "slug": "stilfontein",
        "name": "Stilfontein",
        "province": "North West",
        "description": "Discover salons in Stilfontein. Book hair salons, nail studios, and beauty services in Stilfontein, North West.",
        "metaTitle": "Stilfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stilfontein, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stilfontein salons",
          "Stilfontein hair salon",
          "beauty salon Stilfontein",
          "nails Stilfontein"
        ]
      },
      {
        "slug": "sun-city",
        "name": "Sun City",
        "province": "North West",
        "description": "Discover salons in Sun City. Book hair salons, nail studios, and beauty services in Sun City, North West.",
        "metaTitle": "Sun City Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sun City, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sun City salons",
          "Sun City hair salon",
          "beauty salon Sun City",
          "nails Sun City"
        ]
      },
      {
        "slug": "taung",
        "name": "Taung",
        "province": "North West",
        "description": "Discover salons in Taung. Book hair salons, nail studios, and beauty services in Taung, North West.",
        "metaTitle": "Taung Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Taung, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Taung salons",
          "Taung hair salon",
          "beauty salon Taung",
          "nails Taung"
        ]
      },
      {
        "slug": "ventersdorp",
        "name": "Ventersdorp",
        "province": "North West",
        "description": "Discover salons in Ventersdorp. Book hair salons, nail studios, and beauty services in Ventersdorp, North West.",
        "metaTitle": "Ventersdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ventersdorp, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ventersdorp salons",
          "Ventersdorp hair salon",
          "beauty salon Ventersdorp",
          "nails Ventersdorp"
        ]
      },
      {
        "slug": "vryburg",
        "name": "Vryburg",
        "province": "North West",
        "description": "Discover salons in Vryburg. Book hair salons, nail studios, and beauty services in Vryburg, North West.",
        "metaTitle": "Vryburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vryburg, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vryburg salons",
          "Vryburg hair salon",
          "beauty salon Vryburg",
          "nails Vryburg"
        ]
      },
      {
        "slug": "wolmaransstad",
        "name": "Wolmaransstad",
        "province": "North West",
        "description": "Discover salons in Wolmaransstad. Book hair salons, nail studios, and beauty services in Wolmaransstad, North West.",
        "metaTitle": "Wolmaransstad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wolmaransstad, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wolmaransstad salons",
          "Wolmaransstad hair salon",
          "beauty salon Wolmaransstad",
          "nails Wolmaransstad"
        ]
      },
      {
        "slug": "zeerust",
        "name": "Zeerust",
        "province": "North West",
        "description": "Discover salons in Zeerust. Book hair salons, nail studios, and beauty services in Zeerust, North West.",
        "metaTitle": "Zeerust Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Zeerust, North West. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Zeerust salons",
          "Zeerust hair salon",
          "beauty salon Zeerust",
          "nails Zeerust"
        ]
      }
    ]
  },
  "free-state": {
    "slug": "free-state",
    "name": "Free State",
    "description": "Find top salons in the Free State. Book appointments in Bloemfontein, Welkom, and Sasolburg.",
    "metaTitle": "Free State Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Free State. Book hair, nail, and beauty appointments at the best salons in Free State.",
    "keywords": [
      "Free State salons",
      "Free State hair salons"
    ],
    "cities": [
      {
        "slug": "bethlehem",
        "name": "Bethlehem",
        "province": "Free State",
        "description": "Discover salons in Bethlehem. Book hair salons, nail studios, and beauty services in Bethlehem, Free State.",
        "metaTitle": "Bethlehem Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bethlehem, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bethlehem salons",
          "Bethlehem hair salon",
          "beauty salon Bethlehem",
          "nails Bethlehem"
        ]
      },
      {
        "slug": "bloemfontein",
        "name": "Bloemfontein",
        "province": "Free State",
        "description": "Discover salons in Bloemfontein. Book hair salons, nail studios, and beauty services in Bloemfontein, Free State.",
        "metaTitle": "Bloemfontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bloemfontein, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bloemfontein salons",
          "Bloemfontein hair salon",
          "beauty salon Bloemfontein",
          "nails Bloemfontein"
        ]
      },
      {
        "slug": "bothaville",
        "name": "Bothaville",
        "province": "Free State",
        "description": "Discover salons in Bothaville. Book hair salons, nail studios, and beauty services in Bothaville, Free State.",
        "metaTitle": "Bothaville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bothaville, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bothaville salons",
          "Bothaville hair salon",
          "beauty salon Bothaville",
          "nails Bothaville"
        ]
      },
      {
        "slug": "botshabelo",
        "name": "Botshabelo",
        "province": "Free State",
        "description": "Discover salons in Botshabelo. Book hair salons, nail studios, and beauty services in Botshabelo, Free State.",
        "metaTitle": "Botshabelo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Botshabelo, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Botshabelo salons",
          "Botshabelo hair salon",
          "beauty salon Botshabelo",
          "nails Botshabelo"
        ]
      },
      {
        "slug": "brandfort",
        "name": "Brandfort",
        "province": "Free State",
        "description": "Discover salons in Brandfort. Book hair salons, nail studios, and beauty services in Brandfort, Free State.",
        "metaTitle": "Brandfort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Brandfort, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Brandfort salons",
          "Brandfort hair salon",
          "beauty salon Brandfort",
          "nails Brandfort"
        ]
      },
      {
        "slug": "clarens",
        "name": "Clarens",
        "province": "Free State",
        "description": "Discover salons in Clarens. Book hair salons, nail studios, and beauty services in Clarens, Free State.",
        "metaTitle": "Clarens Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Clarens, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Clarens salons",
          "Clarens hair salon",
          "beauty salon Clarens",
          "nails Clarens"
        ]
      },
      {
        "slug": "clocolan",
        "name": "Clocolan",
        "province": "Free State",
        "description": "Discover salons in Clocolan. Book hair salons, nail studios, and beauty services in Clocolan, Free State.",
        "metaTitle": "Clocolan Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Clocolan, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Clocolan salons",
          "Clocolan hair salon",
          "beauty salon Clocolan",
          "nails Clocolan"
        ]
      },
      {
        "slug": "dealesville",
        "name": "Dealesville",
        "province": "Free State",
        "description": "Discover salons in Dealesville. Book hair salons, nail studios, and beauty services in Dealesville, Free State.",
        "metaTitle": "Dealesville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dealesville, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dealesville salons",
          "Dealesville hair salon",
          "beauty salon Dealesville",
          "nails Dealesville"
        ]
      },
      {
        "slug": "deneysville",
        "name": "Deneysville",
        "province": "Free State",
        "description": "Discover salons in Deneysville. Book hair salons, nail studios, and beauty services in Deneysville, Free State.",
        "metaTitle": "Deneysville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Deneysville, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Deneysville salons",
          "Deneysville hair salon",
          "beauty salon Deneysville",
          "nails Deneysville"
        ]
      },
      {
        "slug": "ficksburg",
        "name": "Ficksburg",
        "province": "Free State",
        "description": "Discover salons in Ficksburg. Book hair salons, nail studios, and beauty services in Ficksburg, Free State.",
        "metaTitle": "Ficksburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ficksburg, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ficksburg salons",
          "Ficksburg hair salon",
          "beauty salon Ficksburg",
          "nails Ficksburg"
        ]
      },
      {
        "slug": "fouriesburg",
        "name": "Fouriesburg",
        "province": "Free State",
        "description": "Discover salons in Fouriesburg. Book hair salons, nail studios, and beauty services in Fouriesburg, Free State.",
        "metaTitle": "Fouriesburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Fouriesburg, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Fouriesburg salons",
          "Fouriesburg hair salon",
          "beauty salon Fouriesburg",
          "nails Fouriesburg"
        ]
      },
      {
        "slug": "frankfort",
        "name": "Frankfort",
        "province": "Free State",
        "description": "Discover salons in Frankfort. Book hair salons, nail studios, and beauty services in Frankfort, Free State.",
        "metaTitle": "Frankfort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Frankfort, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Frankfort salons",
          "Frankfort hair salon",
          "beauty salon Frankfort",
          "nails Frankfort"
        ]
      },
      {
        "slug": "harrismith",
        "name": "Harrismith",
        "province": "Free State",
        "description": "Discover salons in Harrismith. Book hair salons, nail studios, and beauty services in Harrismith, Free State.",
        "metaTitle": "Harrismith Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Harrismith, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Harrismith salons",
          "Harrismith hair salon",
          "beauty salon Harrismith",
          "nails Harrismith"
        ]
      },
      {
        "slug": "heilbron",
        "name": "Heilbron",
        "province": "Free State",
        "description": "Discover salons in Heilbron. Book hair salons, nail studios, and beauty services in Heilbron, Free State.",
        "metaTitle": "Heilbron Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Heilbron, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Heilbron salons",
          "Heilbron hair salon",
          "beauty salon Heilbron",
          "nails Heilbron"
        ]
      },
      {
        "slug": "hennenman",
        "name": "Hennenman",
        "province": "Free State",
        "description": "Discover salons in Hennenman. Book hair salons, nail studios, and beauty services in Hennenman, Free State.",
        "metaTitle": "Hennenman Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hennenman, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hennenman salons",
          "Hennenman hair salon",
          "beauty salon Hennenman",
          "nails Hennenman"
        ]
      },
      {
        "slug": "hoopstad",
        "name": "Hoopstad",
        "province": "Free State",
        "description": "Discover salons in Hoopstad. Book hair salons, nail studios, and beauty services in Hoopstad, Free State.",
        "metaTitle": "Hoopstad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hoopstad, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hoopstad salons",
          "Hoopstad hair salon",
          "beauty salon Hoopstad",
          "nails Hoopstad"
        ]
      },
      {
        "slug": "koffiefontein",
        "name": "Koffiefontein",
        "province": "Free State",
        "description": "Discover salons in Koffiefontein. Book hair salons, nail studios, and beauty services in Koffiefontein, Free State.",
        "metaTitle": "Koffiefontein Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Koffiefontein, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Koffiefontein salons",
          "Koffiefontein hair salon",
          "beauty salon Koffiefontein",
          "nails Koffiefontein"
        ]
      },
      {
        "slug": "kroonstad",
        "name": "Kroonstad",
        "province": "Free State",
        "description": "Discover salons in Kroonstad. Book hair salons, nail studios, and beauty services in Kroonstad, Free State.",
        "metaTitle": "Kroonstad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kroonstad, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kroonstad salons",
          "Kroonstad hair salon",
          "beauty salon Kroonstad",
          "nails Kroonstad"
        ]
      },
      {
        "slug": "ladybrand",
        "name": "Ladybrand",
        "province": "Free State",
        "description": "Discover salons in Ladybrand. Book hair salons, nail studios, and beauty services in Ladybrand, Free State.",
        "metaTitle": "Ladybrand Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ladybrand, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ladybrand salons",
          "Ladybrand hair salon",
          "beauty salon Ladybrand",
          "nails Ladybrand"
        ]
      },
      {
        "slug": "lindley",
        "name": "Lindley",
        "province": "Free State",
        "description": "Discover salons in Lindley. Book hair salons, nail studios, and beauty services in Lindley, Free State.",
        "metaTitle": "Lindley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lindley, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lindley salons",
          "Lindley hair salon",
          "beauty salon Lindley",
          "nails Lindley"
        ]
      },
      {
        "slug": "marquard",
        "name": "Marquard",
        "province": "Free State",
        "description": "Discover salons in Marquard. Book hair salons, nail studios, and beauty services in Marquard, Free State.",
        "metaTitle": "Marquard Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Marquard, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Marquard salons",
          "Marquard hair salon",
          "beauty salon Marquard",
          "nails Marquard"
        ]
      },
      {
        "slug": "odendaalsrus",
        "name": "Odendaalsrus",
        "province": "Free State",
        "description": "Discover salons in Odendaalsrus. Book hair salons, nail studios, and beauty services in Odendaalsrus, Free State.",
        "metaTitle": "Odendaalsrus Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Odendaalsrus, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Odendaalsrus salons",
          "Odendaalsrus hair salon",
          "beauty salon Odendaalsrus",
          "nails Odendaalsrus"
        ]
      },
      {
        "slug": "oranjeville",
        "name": "Oranjeville",
        "province": "Free State",
        "description": "Discover salons in Oranjeville. Book hair salons, nail studios, and beauty services in Oranjeville, Free State.",
        "metaTitle": "Oranjeville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Oranjeville, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Oranjeville salons",
          "Oranjeville hair salon",
          "beauty salon Oranjeville",
          "nails Oranjeville"
        ]
      },
      {
        "slug": "parys",
        "name": "Parys",
        "province": "Free State",
        "description": "Discover salons in Parys. Book hair salons, nail studios, and beauty services in Parys, Free State.",
        "metaTitle": "Parys Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Parys, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Parys salons",
          "Parys hair salon",
          "beauty salon Parys",
          "nails Parys"
        ]
      },
      {
        "slug": "phuthaditjhaba",
        "name": "Phuthaditjhaba",
        "province": "Free State",
        "description": "Discover salons in Phuthaditjhaba. Book hair salons, nail studios, and beauty services in Phuthaditjhaba, Free State.",
        "metaTitle": "Phuthaditjhaba Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Phuthaditjhaba, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Phuthaditjhaba salons",
          "Phuthaditjhaba hair salon",
          "beauty salon Phuthaditjhaba",
          "nails Phuthaditjhaba"
        ]
      },
      {
        "slug": "reitz",
        "name": "Reitz",
        "province": "Free State",
        "description": "Discover salons in Reitz. Book hair salons, nail studios, and beauty services in Reitz, Free State.",
        "metaTitle": "Reitz Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Reitz, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Reitz salons",
          "Reitz hair salon",
          "beauty salon Reitz",
          "nails Reitz"
        ]
      },
      {
        "slug": "rosendal",
        "name": "Rosendal",
        "province": "Free State",
        "description": "Discover salons in Rosendal. Book hair salons, nail studios, and beauty services in Rosendal, Free State.",
        "metaTitle": "Rosendal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rosendal, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rosendal salons",
          "Rosendal hair salon",
          "beauty salon Rosendal",
          "nails Rosendal"
        ]
      },
      {
        "slug": "sasolburg",
        "name": "Sasolburg",
        "province": "Free State",
        "description": "Discover salons in Sasolburg. Book hair salons, nail studios, and beauty services in Sasolburg, Free State.",
        "metaTitle": "Sasolburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sasolburg, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sasolburg salons",
          "Sasolburg hair salon",
          "beauty salon Sasolburg",
          "nails Sasolburg"
        ]
      },
      {
        "slug": "senekal",
        "name": "Senekal",
        "province": "Free State",
        "description": "Discover salons in Senekal. Book hair salons, nail studios, and beauty services in Senekal, Free State.",
        "metaTitle": "Senekal Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Senekal, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Senekal salons",
          "Senekal hair salon",
          "beauty salon Senekal",
          "nails Senekal"
        ]
      },
      {
        "slug": "smithfield",
        "name": "Smithfield",
        "province": "Free State",
        "description": "Discover salons in Smithfield. Book hair salons, nail studios, and beauty services in Smithfield, Free State.",
        "metaTitle": "Smithfield Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Smithfield, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Smithfield salons",
          "Smithfield hair salon",
          "beauty salon Smithfield",
          "nails Smithfield"
        ]
      },
      {
        "slug": "thaba-nchu",
        "name": "Thaba Nchu",
        "province": "Free State",
        "description": "Discover salons in Thaba Nchu. Book hair salons, nail studios, and beauty services in Thaba Nchu, Free State.",
        "metaTitle": "Thaba Nchu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Thaba Nchu, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Thaba Nchu salons",
          "Thaba Nchu hair salon",
          "beauty salon Thaba Nchu",
          "nails Thaba Nchu"
        ]
      },
      {
        "slug": "theunissen",
        "name": "Theunissen",
        "province": "Free State",
        "description": "Discover salons in Theunissen. Book hair salons, nail studios, and beauty services in Theunissen, Free State.",
        "metaTitle": "Theunissen Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Theunissen, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Theunissen salons",
          "Theunissen hair salon",
          "beauty salon Theunissen",
          "nails Theunissen"
        ]
      },
      {
        "slug": "trompsburg",
        "name": "Trompsburg",
        "province": "Free State",
        "description": "Discover salons in Trompsburg. Book hair salons, nail studios, and beauty services in Trompsburg, Free State.",
        "metaTitle": "Trompsburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Trompsburg, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Trompsburg salons",
          "Trompsburg hair salon",
          "beauty salon Trompsburg",
          "nails Trompsburg"
        ]
      },
      {
        "slug": "viljoenskroon",
        "name": "Viljoenskroon",
        "province": "Free State",
        "description": "Discover salons in Viljoenskroon. Book hair salons, nail studios, and beauty services in Viljoenskroon, Free State.",
        "metaTitle": "Viljoenskroon Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Viljoenskroon, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Viljoenskroon salons",
          "Viljoenskroon hair salon",
          "beauty salon Viljoenskroon",
          "nails Viljoenskroon"
        ]
      },
      {
        "slug": "virginia",
        "name": "Virginia",
        "province": "Free State",
        "description": "Discover salons in Virginia. Book hair salons, nail studios, and beauty services in Virginia, Free State.",
        "metaTitle": "Virginia Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Virginia, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Virginia salons",
          "Virginia hair salon",
          "beauty salon Virginia",
          "nails Virginia"
        ]
      },
      {
        "slug": "vrede",
        "name": "Vrede",
        "province": "Free State",
        "description": "Discover salons in Vrede. Book hair salons, nail studios, and beauty services in Vrede, Free State.",
        "metaTitle": "Vrede Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vrede, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vrede salons",
          "Vrede hair salon",
          "beauty salon Vrede",
          "nails Vrede"
        ]
      },
      {
        "slug": "vredefort",
        "name": "Vredefort",
        "province": "Free State",
        "description": "Discover salons in Vredefort. Book hair salons, nail studios, and beauty services in Vredefort, Free State.",
        "metaTitle": "Vredefort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vredefort, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vredefort salons",
          "Vredefort hair salon",
          "beauty salon Vredefort",
          "nails Vredefort"
        ]
      },
      {
        "slug": "welkom",
        "name": "Welkom",
        "province": "Free State",
        "description": "Discover salons in Welkom. Book hair salons, nail studios, and beauty services in Welkom, Free State.",
        "metaTitle": "Welkom Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Welkom, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Welkom salons",
          "Welkom hair salon",
          "beauty salon Welkom",
          "nails Welkom"
        ]
      },
      {
        "slug": "wesselsbron",
        "name": "Wesselsbron",
        "province": "Free State",
        "description": "Discover salons in Wesselsbron. Book hair salons, nail studios, and beauty services in Wesselsbron, Free State.",
        "metaTitle": "Wesselsbron Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Wesselsbron, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Wesselsbron salons",
          "Wesselsbron hair salon",
          "beauty salon Wesselsbron",
          "nails Wesselsbron"
        ]
      },
      {
        "slug": "winburg",
        "name": "Winburg",
        "province": "Free State",
        "description": "Discover salons in Winburg. Book hair salons, nail studios, and beauty services in Winburg, Free State.",
        "metaTitle": "Winburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Winburg, Free State. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Winburg salons",
          "Winburg hair salon",
          "beauty salon Winburg",
          "nails Winburg"
        ]
      }
    ]
  },
  "eastern-cape": {
    "slug": "eastern-cape",
    "name": "Eastern Cape",
    "description": "Discover beauty services in Eastern Cape. Find salons in Port Elizabeth, East London, and Mthatha.",
    "metaTitle": "Eastern Cape Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Eastern Cape. Book hair, nail, and beauty appointments at the best salons in Eastern Cape.",
    "keywords": [
      "Eastern Cape salons",
      "Eastern Cape hair salons"
    ],
    "cities": [
      {
        "slug": "addo",
        "name": "Addo",
        "province": "Eastern Cape",
        "description": "Discover salons in Addo. Book hair salons, nail studios, and beauty services in Addo, Eastern Cape.",
        "metaTitle": "Addo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Addo, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Addo salons",
          "Addo hair salon",
          "beauty salon Addo",
          "nails Addo"
        ]
      },
      {
        "slug": "adelaide",
        "name": "Adelaide",
        "province": "Eastern Cape",
        "description": "Discover salons in Adelaide. Book hair salons, nail studios, and beauty services in Adelaide, Eastern Cape.",
        "metaTitle": "Adelaide Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Adelaide, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Adelaide salons",
          "Adelaide hair salon",
          "beauty salon Adelaide",
          "nails Adelaide"
        ]
      },
      {
        "slug": "albany",
        "name": "Albany",
        "province": "Eastern Cape",
        "description": "Discover salons in Albany. Book hair salons, nail studios, and beauty services in Albany, Eastern Cape.",
        "metaTitle": "Albany Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Albany, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Albany salons",
          "Albany hair salon",
          "beauty salon Albany",
          "nails Albany"
        ]
      },
      {
        "slug": "alexandria",
        "name": "Alexandria",
        "province": "Eastern Cape",
        "description": "Discover salons in Alexandria. Book hair salons, nail studios, and beauty services in Alexandria, Eastern Cape.",
        "metaTitle": "Alexandria Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Alexandria, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Alexandria salons",
          "Alexandria hair salon",
          "beauty salon Alexandria",
          "nails Alexandria"
        ]
      },
      {
        "slug": "aliwal-north",
        "name": "Aliwal North",
        "province": "Eastern Cape",
        "description": "Discover salons in Aliwal North. Book hair salons, nail studios, and beauty services in Aliwal North, Eastern Cape.",
        "metaTitle": "Aliwal North Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Aliwal North, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Aliwal North salons",
          "Aliwal North hair salon",
          "beauty salon Aliwal North",
          "nails Aliwal North"
        ]
      },
      {
        "slug": "bathurst",
        "name": "Bathurst",
        "province": "Eastern Cape",
        "description": "Discover salons in Bathurst. Book hair salons, nail studios, and beauty services in Bathurst, Eastern Cape.",
        "metaTitle": "Bathurst Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bathurst, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bathurst salons",
          "Bathurst hair salon",
          "beauty salon Bathurst",
          "nails Bathurst"
        ]
      },
      {
        "slug": "bedford",
        "name": "Bedford",
        "province": "Eastern Cape",
        "description": "Discover salons in Bedford. Book hair salons, nail studios, and beauty services in Bedford, Eastern Cape.",
        "metaTitle": "Bedford Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bedford, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bedford salons",
          "Bedford hair salon",
          "beauty salon Bedford",
          "nails Bedford"
        ]
      },
      {
        "slug": "berlin",
        "name": "Berlin",
        "province": "Eastern Cape",
        "description": "Discover salons in Berlin. Book hair salons, nail studios, and beauty services in Berlin, Eastern Cape.",
        "metaTitle": "Berlin Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Berlin, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Berlin salons",
          "Berlin hair salon",
          "beauty salon Berlin",
          "nails Berlin"
        ]
      },
      {
        "slug": "bisho",
        "name": "Bisho",
        "province": "Eastern Cape",
        "description": "Discover salons in Bisho. Book hair salons, nail studios, and beauty services in Bisho, Eastern Cape.",
        "metaTitle": "Bisho Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Bisho, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Bisho salons",
          "Bisho hair salon",
          "beauty salon Bisho",
          "nails Bisho"
        ]
      },
      {
        "slug": "butterworth",
        "name": "Butterworth",
        "province": "Eastern Cape",
        "description": "Discover salons in Butterworth. Book hair salons, nail studios, and beauty services in Butterworth, Eastern Cape.",
        "metaTitle": "Butterworth Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Butterworth, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Butterworth salons",
          "Butterworth hair salon",
          "beauty salon Butterworth",
          "nails Butterworth"
        ]
      },
      {
        "slug": "cathcart",
        "name": "Cathcart",
        "province": "Eastern Cape",
        "description": "Discover salons in Cathcart. Book hair salons, nail studios, and beauty services in Cathcart, Eastern Cape.",
        "metaTitle": "Cathcart Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cathcart, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cathcart salons",
          "Cathcart hair salon",
          "beauty salon Cathcart",
          "nails Cathcart"
        ]
      },
      {
        "slug": "cintsa",
        "name": "Cintsa",
        "province": "Eastern Cape",
        "description": "Discover salons in Cintsa. Book hair salons, nail studios, and beauty services in Cintsa, Eastern Cape.",
        "metaTitle": "Cintsa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cintsa, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cintsa salons",
          "Cintsa hair salon",
          "beauty salon Cintsa",
          "nails Cintsa"
        ]
      },
      {
        "slug": "cradock",
        "name": "Cradock",
        "province": "Eastern Cape",
        "description": "Discover salons in Cradock. Book hair salons, nail studios, and beauty services in Cradock, Eastern Cape.",
        "metaTitle": "Cradock Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Cradock, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Cradock salons",
          "Cradock hair salon",
          "beauty salon Cradock",
          "nails Cradock"
        ]
      },
      {
        "slug": "despatch",
        "name": "Despatch",
        "province": "Eastern Cape",
        "description": "Discover salons in Despatch. Book hair salons, nail studios, and beauty services in Despatch, Eastern Cape.",
        "metaTitle": "Despatch Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Despatch, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Despatch salons",
          "Despatch hair salon",
          "beauty salon Despatch",
          "nails Despatch"
        ]
      },
      {
        "slug": "dutywa",
        "name": "Dutywa",
        "province": "Eastern Cape",
        "description": "Discover salons in Dutywa. Book hair salons, nail studios, and beauty services in Dutywa, Eastern Cape.",
        "metaTitle": "Dutywa Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Dutywa, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Dutywa salons",
          "Dutywa hair salon",
          "beauty salon Dutywa",
          "nails Dutywa"
        ]
      },
      {
        "slug": "east-london",
        "name": "East London",
        "province": "Eastern Cape",
        "description": "Discover salons in East London. Book hair salons, nail studios, and beauty services in East London, Eastern Cape.",
        "metaTitle": "East London Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in East London, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "East London salons",
          "East London hair salon",
          "beauty salon East London",
          "nails East London"
        ]
      },
      {
        "slug": "elliot",
        "name": "Elliot",
        "province": "Eastern Cape",
        "description": "Discover salons in Elliot. Book hair salons, nail studios, and beauty services in Elliot, Eastern Cape.",
        "metaTitle": "Elliot Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Elliot, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Elliot salons",
          "Elliot hair salon",
          "beauty salon Elliot",
          "nails Elliot"
        ]
      },
      {
        "slug": "fort-beaufort",
        "name": "Fort Beaufort",
        "province": "Eastern Cape",
        "description": "Discover salons in Fort Beaufort. Book hair salons, nail studios, and beauty services in Fort Beaufort, Eastern Cape.",
        "metaTitle": "Fort Beaufort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Fort Beaufort, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Fort Beaufort salons",
          "Fort Beaufort hair salon",
          "beauty salon Fort Beaufort",
          "nails Fort Beaufort"
        ]
      },
      {
        "slug": "gonubie",
        "name": "Gonubie",
        "province": "Eastern Cape",
        "description": "Discover salons in Gonubie. Book hair salons, nail studios, and beauty services in Gonubie, Eastern Cape.",
        "metaTitle": "Gonubie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Gonubie, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Gonubie salons",
          "Gonubie hair salon",
          "beauty salon Gonubie",
          "nails Gonubie"
        ]
      },
      {
        "slug": "graaff-reinet",
        "name": "Graaff-Reinet",
        "province": "Eastern Cape",
        "description": "Discover salons in Graaff-Reinet. Book hair salons, nail studios, and beauty services in Graaff-Reinet, Eastern Cape.",
        "metaTitle": "Graaff-Reinet Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Graaff-Reinet, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Graaff-Reinet salons",
          "Graaff-Reinet hair salon",
          "beauty salon Graaff-Reinet",
          "nails Graaff-Reinet"
        ]
      },
      {
        "slug": "grahamstown",
        "name": "Grahamstown",
        "province": "Eastern Cape",
        "description": "Discover salons in Grahamstown. Book hair salons, nail studios, and beauty services in Grahamstown, Eastern Cape.",
        "metaTitle": "Grahamstown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Grahamstown, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Grahamstown salons",
          "Grahamstown hair salon",
          "beauty salon Grahamstown",
          "nails Grahamstown"
        ]
      },
      {
        "slug": "hamburg",
        "name": "Hamburg",
        "province": "Eastern Cape",
        "description": "Discover salons in Hamburg. Book hair salons, nail studios, and beauty services in Hamburg, Eastern Cape.",
        "metaTitle": "Hamburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hamburg, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hamburg salons",
          "Hamburg hair salon",
          "beauty salon Hamburg",
          "nails Hamburg"
        ]
      },
      {
        "slug": "hankey",
        "name": "Hankey",
        "province": "Eastern Cape",
        "description": "Discover salons in Hankey. Book hair salons, nail studios, and beauty services in Hankey, Eastern Cape.",
        "metaTitle": "Hankey Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hankey, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hankey salons",
          "Hankey hair salon",
          "beauty salon Hankey",
          "nails Hankey"
        ]
      },
      {
        "slug": "hofmeyr",
        "name": "Hofmeyr",
        "province": "Eastern Cape",
        "description": "Discover salons in Hofmeyr. Book hair salons, nail studios, and beauty services in Hofmeyr, Eastern Cape.",
        "metaTitle": "Hofmeyr Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hofmeyr, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hofmeyr salons",
          "Hofmeyr hair salon",
          "beauty salon Hofmeyr",
          "nails Hofmeyr"
        ]
      },
      {
        "slug": "humansdorp",
        "name": "Humansdorp",
        "province": "Eastern Cape",
        "description": "Discover salons in Humansdorp. Book hair salons, nail studios, and beauty services in Humansdorp, Eastern Cape.",
        "metaTitle": "Humansdorp Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Humansdorp, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Humansdorp salons",
          "Humansdorp hair salon",
          "beauty salon Humansdorp",
          "nails Humansdorp"
        ]
      },
      {
        "slug": "jeffreys-bay",
        "name": "Jeffreys Bay",
        "province": "Eastern Cape",
        "description": "Discover salons in Jeffreys Bay. Book hair salons, nail studios, and beauty services in Jeffreys Bay, Eastern Cape.",
        "metaTitle": "Jeffreys Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Jeffreys Bay, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Jeffreys Bay salons",
          "Jeffreys Bay hair salon",
          "beauty salon Jeffreys Bay",
          "nails Jeffreys Bay"
        ]
      },
      {
        "slug": "joubertina",
        "name": "Joubertina",
        "province": "Eastern Cape",
        "description": "Discover salons in Joubertina. Book hair salons, nail studios, and beauty services in Joubertina, Eastern Cape.",
        "metaTitle": "Joubertina Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Joubertina, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Joubertina salons",
          "Joubertina hair salon",
          "beauty salon Joubertina",
          "nails Joubertina"
        ]
      },
      {
        "slug": "kareedouw",
        "name": "Kareedouw",
        "province": "Eastern Cape",
        "description": "Discover salons in Kareedouw. Book hair salons, nail studios, and beauty services in Kareedouw, Eastern Cape.",
        "metaTitle": "Kareedouw Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kareedouw, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kareedouw salons",
          "Kareedouw hair salon",
          "beauty salon Kareedouw",
          "nails Kareedouw"
        ]
      },
      {
        "slug": "kenton-on-sea",
        "name": "Kenton-on-Sea",
        "province": "Eastern Cape",
        "description": "Discover salons in Kenton-on-Sea. Book hair salons, nail studios, and beauty services in Kenton-on-Sea, Eastern Cape.",
        "metaTitle": "Kenton-on-Sea Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kenton-on-Sea, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kenton-on-Sea salons",
          "Kenton-on-Sea hair salon",
          "beauty salon Kenton-on-Sea",
          "nails Kenton-on-Sea"
        ]
      },
      {
        "slug": "king-williams-town",
        "name": "King William's Town",
        "province": "Eastern Cape",
        "description": "Discover salons in King William's Town. Book hair salons, nail studios, and beauty services in King William's Town, Eastern Cape.",
        "metaTitle": "King William's Town Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in King William's Town, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "King William's Town salons",
          "King William's Town hair salon",
          "beauty salon King William's Town",
          "nails King William's Town"
        ]
      },
      {
        "slug": "kirkwood",
        "name": "Kirkwood",
        "province": "Eastern Cape",
        "description": "Discover salons in Kirkwood. Book hair salons, nail studios, and beauty services in Kirkwood, Eastern Cape.",
        "metaTitle": "Kirkwood Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kirkwood, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kirkwood salons",
          "Kirkwood hair salon",
          "beauty salon Kirkwood",
          "nails Kirkwood"
        ]
      },
      {
        "slug": "komga",
        "name": "Komga",
        "province": "Eastern Cape",
        "description": "Discover salons in Komga. Book hair salons, nail studios, and beauty services in Komga, Eastern Cape.",
        "metaTitle": "Komga Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Komga, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Komga salons",
          "Komga hair salon",
          "beauty salon Komga",
          "nails Komga"
        ]
      },
      {
        "slug": "lady-frere",
        "name": "Lady Frere",
        "province": "Eastern Cape",
        "description": "Discover salons in Lady Frere. Book hair salons, nail studios, and beauty services in Lady Frere, Eastern Cape.",
        "metaTitle": "Lady Frere Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lady Frere, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lady Frere salons",
          "Lady Frere hair salon",
          "beauty salon Lady Frere",
          "nails Lady Frere"
        ]
      },
      {
        "slug": "lady-grey",
        "name": "Lady Grey",
        "province": "Eastern Cape",
        "description": "Discover salons in Lady Grey. Book hair salons, nail studios, and beauty services in Lady Grey, Eastern Cape.",
        "metaTitle": "Lady Grey Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lady Grey, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lady Grey salons",
          "Lady Grey hair salon",
          "beauty salon Lady Grey",
          "nails Lady Grey"
        ]
      },
      {
        "slug": "libode",
        "name": "Libode",
        "province": "Eastern Cape",
        "description": "Discover salons in Libode. Book hair salons, nail studios, and beauty services in Libode, Eastern Cape.",
        "metaTitle": "Libode Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Libode, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Libode salons",
          "Libode hair salon",
          "beauty salon Libode",
          "nails Libode"
        ]
      },
      {
        "slug": "lusikisiki",
        "name": "Lusikisiki",
        "province": "Eastern Cape",
        "description": "Discover salons in Lusikisiki. Book hair salons, nail studios, and beauty services in Lusikisiki, Eastern Cape.",
        "metaTitle": "Lusikisiki Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lusikisiki, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lusikisiki salons",
          "Lusikisiki hair salon",
          "beauty salon Lusikisiki",
          "nails Lusikisiki"
        ]
      },
      {
        "slug": "maclear",
        "name": "Maclear",
        "province": "Eastern Cape",
        "description": "Discover salons in Maclear. Book hair salons, nail studios, and beauty services in Maclear, Eastern Cape.",
        "metaTitle": "Maclear Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Maclear, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Maclear salons",
          "Maclear hair salon",
          "beauty salon Maclear",
          "nails Maclear"
        ]
      },
      {
        "slug": "makhanda",
        "name": "Makhanda",
        "province": "Eastern Cape",
        "description": "Discover salons in Makhanda. Book hair salons, nail studios, and beauty services in Makhanda, Eastern Cape.",
        "metaTitle": "Makhanda Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Makhanda, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Makhanda salons",
          "Makhanda hair salon",
          "beauty salon Makhanda",
          "nails Makhanda"
        ]
      },
      {
        "slug": "mdantsane",
        "name": "Mdantsane",
        "province": "Eastern Cape",
        "description": "Discover salons in Mdantsane. Book hair salons, nail studios, and beauty services in Mdantsane, Eastern Cape.",
        "metaTitle": "Mdantsane Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mdantsane, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mdantsane salons",
          "Mdantsane hair salon",
          "beauty salon Mdantsane",
          "nails Mdantsane"
        ]
      },
      {
        "slug": "middelburg",
        "name": "Middelburg",
        "province": "Eastern Cape",
        "description": "Discover salons in Middelburg. Book hair salons, nail studios, and beauty services in Middelburg, Eastern Cape.",
        "metaTitle": "Middelburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Middelburg, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Middelburg salons",
          "Middelburg hair salon",
          "beauty salon Middelburg",
          "nails Middelburg"
        ]
      },
      {
        "slug": "mthatha",
        "name": "Mthatha",
        "province": "Eastern Cape",
        "description": "Discover salons in Mthatha. Book hair salons, nail studios, and beauty services in Mthatha, Eastern Cape.",
        "metaTitle": "Mthatha Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Mthatha, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Mthatha salons",
          "Mthatha hair salon",
          "beauty salon Mthatha",
          "nails Mthatha"
        ]
      },
      {
        "slug": "ngcobo",
        "name": "Ngcobo",
        "province": "Eastern Cape",
        "description": "Discover salons in Ngcobo. Book hair salons, nail studios, and beauty services in Ngcobo, Eastern Cape.",
        "metaTitle": "Ngcobo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Ngcobo, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Ngcobo salons",
          "Ngcobo hair salon",
          "beauty salon Ngcobo",
          "nails Ngcobo"
        ]
      },
      {
        "slug": "noupoort",
        "name": "Noupoort",
        "province": "Eastern Cape",
        "description": "Discover salons in Noupoort. Book hair salons, nail studios, and beauty services in Noupoort, Eastern Cape.",
        "metaTitle": "Noupoort Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Noupoort, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Noupoort salons",
          "Noupoort hair salon",
          "beauty salon Noupoort",
          "nails Noupoort"
        ]
      },
      {
        "slug": "oyster-bay",
        "name": "Oyster Bay",
        "province": "Eastern Cape",
        "description": "Discover salons in Oyster Bay. Book hair salons, nail studios, and beauty services in Oyster Bay, Eastern Cape.",
        "metaTitle": "Oyster Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Oyster Bay, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Oyster Bay salons",
          "Oyster Bay hair salon",
          "beauty salon Oyster Bay",
          "nails Oyster Bay"
        ]
      },
      {
        "slug": "patensie",
        "name": "Patensie",
        "province": "Eastern Cape",
        "description": "Discover salons in Patensie. Book hair salons, nail studios, and beauty services in Patensie, Eastern Cape.",
        "metaTitle": "Patensie Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Patensie, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Patensie salons",
          "Patensie hair salon",
          "beauty salon Patensie",
          "nails Patensie"
        ]
      },
      {
        "slug": "paterson",
        "name": "Paterson",
        "province": "Eastern Cape",
        "description": "Discover salons in Paterson. Book hair salons, nail studios, and beauty services in Paterson, Eastern Cape.",
        "metaTitle": "Paterson Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Paterson, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Paterson salons",
          "Paterson hair salon",
          "beauty salon Paterson",
          "nails Paterson"
        ]
      },
      {
        "slug": "port-alfred",
        "name": "Port Alfred",
        "province": "Eastern Cape",
        "description": "Discover salons in Port Alfred. Book hair salons, nail studios, and beauty services in Port Alfred, Eastern Cape.",
        "metaTitle": "Port Alfred Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Alfred, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Alfred salons",
          "Port Alfred hair salon",
          "beauty salon Port Alfred",
          "nails Port Alfred"
        ]
      },
      {
        "slug": "port-elizabeth",
        "name": "Port Elizabeth",
        "province": "Eastern Cape",
        "description": "Discover salons in Port Elizabeth. Book hair salons, nail studios, and beauty services in Port Elizabeth, Eastern Cape.",
        "metaTitle": "Port Elizabeth Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Elizabeth, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Elizabeth salons",
          "Port Elizabeth hair salon",
          "beauty salon Port Elizabeth",
          "nails Port Elizabeth"
        ]
      },
      {
        "slug": "port-st-johns",
        "name": "Port St Johns",
        "province": "Eastern Cape",
        "description": "Discover salons in Port St Johns. Book hair salons, nail studios, and beauty services in Port St Johns, Eastern Cape.",
        "metaTitle": "Port St Johns Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port St Johns, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port St Johns salons",
          "Port St Johns hair salon",
          "beauty salon Port St Johns",
          "nails Port St Johns"
        ]
      },
      {
        "slug": "queenstown",
        "name": "Queenstown",
        "province": "Eastern Cape",
        "description": "Discover salons in Queenstown. Book hair salons, nail studios, and beauty services in Queenstown, Eastern Cape.",
        "metaTitle": "Queenstown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Queenstown, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Queenstown salons",
          "Queenstown hair salon",
          "beauty salon Queenstown",
          "nails Queenstown"
        ]
      },
      {
        "slug": "rhodes",
        "name": "Rhodes",
        "province": "Eastern Cape",
        "description": "Discover salons in Rhodes. Book hair salons, nail studios, and beauty services in Rhodes, Eastern Cape.",
        "metaTitle": "Rhodes Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Rhodes, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Rhodes salons",
          "Rhodes hair salon",
          "beauty salon Rhodes",
          "nails Rhodes"
        ]
      },
      {
        "slug": "somerset-east",
        "name": "Somerset East",
        "province": "Eastern Cape",
        "description": "Discover salons in Somerset East. Book hair salons, nail studios, and beauty services in Somerset East, Eastern Cape.",
        "metaTitle": "Somerset East Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Somerset East, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Somerset East salons",
          "Somerset East hair salon",
          "beauty salon Somerset East",
          "nails Somerset East"
        ]
      },
      {
        "slug": "st-francis-bay",
        "name": "St Francis Bay",
        "province": "Eastern Cape",
        "description": "Discover salons in St Francis Bay. Book hair salons, nail studios, and beauty services in St Francis Bay, Eastern Cape.",
        "metaTitle": "St Francis Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in St Francis Bay, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "St Francis Bay salons",
          "St Francis Bay hair salon",
          "beauty salon St Francis Bay",
          "nails St Francis Bay"
        ]
      },
      {
        "slug": "steynsburg",
        "name": "Steynsburg",
        "province": "Eastern Cape",
        "description": "Discover salons in Steynsburg. Book hair salons, nail studios, and beauty services in Steynsburg, Eastern Cape.",
        "metaTitle": "Steynsburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Steynsburg, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Steynsburg salons",
          "Steynsburg hair salon",
          "beauty salon Steynsburg",
          "nails Steynsburg"
        ]
      },
      {
        "slug": "steytlerville",
        "name": "Steytlerville",
        "province": "Eastern Cape",
        "description": "Discover salons in Steytlerville. Book hair salons, nail studios, and beauty services in Steytlerville, Eastern Cape.",
        "metaTitle": "Steytlerville Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Steytlerville, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Steytlerville salons",
          "Steytlerville hair salon",
          "beauty salon Steytlerville",
          "nails Steytlerville"
        ]
      },
      {
        "slug": "stutterheim",
        "name": "Stutterheim",
        "province": "Eastern Cape",
        "description": "Discover salons in Stutterheim. Book hair salons, nail studios, and beauty services in Stutterheim, Eastern Cape.",
        "metaTitle": "Stutterheim Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Stutterheim, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Stutterheim salons",
          "Stutterheim hair salon",
          "beauty salon Stutterheim",
          "nails Stutterheim"
        ]
      },
      {
        "slug": "tarkastad",
        "name": "Tarkastad",
        "province": "Eastern Cape",
        "description": "Discover salons in Tarkastad. Book hair salons, nail studios, and beauty services in Tarkastad, Eastern Cape.",
        "metaTitle": "Tarkastad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tarkastad, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tarkastad salons",
          "Tarkastad hair salon",
          "beauty salon Tarkastad",
          "nails Tarkastad"
        ]
      },
      {
        "slug": "tsolo",
        "name": "Tsolo",
        "province": "Eastern Cape",
        "description": "Discover salons in Tsolo. Book hair salons, nail studios, and beauty services in Tsolo, Eastern Cape.",
        "metaTitle": "Tsolo Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Tsolo, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Tsolo salons",
          "Tsolo hair salon",
          "beauty salon Tsolo",
          "nails Tsolo"
        ]
      },
      {
        "slug": "uitenhage",
        "name": "Uitenhage",
        "province": "Eastern Cape",
        "description": "Discover salons in Uitenhage. Book hair salons, nail studios, and beauty services in Uitenhage, Eastern Cape.",
        "metaTitle": "Uitenhage Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Uitenhage, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Uitenhage salons",
          "Uitenhage hair salon",
          "beauty salon Uitenhage",
          "nails Uitenhage"
        ]
      },
      {
        "slug": "whittlesea",
        "name": "Whittlesea",
        "province": "Eastern Cape",
        "description": "Discover salons in Whittlesea. Book hair salons, nail studios, and beauty services in Whittlesea, Eastern Cape.",
        "metaTitle": "Whittlesea Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Whittlesea, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Whittlesea salons",
          "Whittlesea hair salon",
          "beauty salon Whittlesea",
          "nails Whittlesea"
        ]
      },
      {
        "slug": "willowmore",
        "name": "Willowmore",
        "province": "Eastern Cape",
        "description": "Discover salons in Willowmore. Book hair salons, nail studios, and beauty services in Willowmore, Eastern Cape.",
        "metaTitle": "Willowmore Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Willowmore, Eastern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Willowmore salons",
          "Willowmore hair salon",
          "beauty salon Willowmore",
          "nails Willowmore"
        ]
      }
    ]
  },
  "northern-cape": {
    "slug": "northern-cape",
    "name": "Northern Cape",
    "description": "Find beauty services in Northern Cape. Book salons in Kimberley, Upington, and Springbok.",
    "metaTitle": "Northern Cape Salons & Spas | Book Online | Stylr SA",
    "metaDescription": "Find top-rated salons in Northern Cape. Book hair, nail, and beauty appointments at the best salons in Northern Cape.",
    "keywords": [
      "Northern Cape salons",
      "Northern Cape hair salons"
    ],
    "cities": [
      {
        "slug": "alexander-bay",
        "name": "Alexander Bay",
        "province": "Northern Cape",
        "description": "Discover salons in Alexander Bay. Book hair salons, nail studios, and beauty services in Alexander Bay, Northern Cape.",
        "metaTitle": "Alexander Bay Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Alexander Bay, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Alexander Bay salons",
          "Alexander Bay hair salon",
          "beauty salon Alexander Bay",
          "nails Alexander Bay"
        ]
      },
      {
        "slug": "barkly-west",
        "name": "Barkly West",
        "province": "Northern Cape",
        "description": "Discover salons in Barkly West. Book hair salons, nail studios, and beauty services in Barkly West, Northern Cape.",
        "metaTitle": "Barkly West Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Barkly West, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Barkly West salons",
          "Barkly West hair salon",
          "beauty salon Barkly West",
          "nails Barkly West"
        ]
      },
      {
        "slug": "britstown",
        "name": "Britstown",
        "province": "Northern Cape",
        "description": "Discover salons in Britstown. Book hair salons, nail studios, and beauty services in Britstown, Northern Cape.",
        "metaTitle": "Britstown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Britstown, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Britstown salons",
          "Britstown hair salon",
          "beauty salon Britstown",
          "nails Britstown"
        ]
      },
      {
        "slug": "calvinia",
        "name": "Calvinia",
        "province": "Northern Cape",
        "description": "Discover salons in Calvinia. Book hair salons, nail studios, and beauty services in Calvinia, Northern Cape.",
        "metaTitle": "Calvinia Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Calvinia, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Calvinia salons",
          "Calvinia hair salon",
          "beauty salon Calvinia",
          "nails Calvinia"
        ]
      },
      {
        "slug": "campbell",
        "name": "Campbell",
        "province": "Northern Cape",
        "description": "Discover salons in Campbell. Book hair salons, nail studios, and beauty services in Campbell, Northern Cape.",
        "metaTitle": "Campbell Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Campbell, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Campbell salons",
          "Campbell hair salon",
          "beauty salon Campbell",
          "nails Campbell"
        ]
      },
      {
        "slug": "carnarvon",
        "name": "Carnarvon",
        "province": "Northern Cape",
        "description": "Discover salons in Carnarvon. Book hair salons, nail studios, and beauty services in Carnarvon, Northern Cape.",
        "metaTitle": "Carnarvon Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Carnarvon, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Carnarvon salons",
          "Carnarvon hair salon",
          "beauty salon Carnarvon",
          "nails Carnarvon"
        ]
      },
      {
        "slug": "colesberg",
        "name": "Colesberg",
        "province": "Northern Cape",
        "description": "Discover salons in Colesberg. Book hair salons, nail studios, and beauty services in Colesberg, Northern Cape.",
        "metaTitle": "Colesberg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Colesberg, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Colesberg salons",
          "Colesberg hair salon",
          "beauty salon Colesberg",
          "nails Colesberg"
        ]
      },
      {
        "slug": "danielskuil",
        "name": "Danielskuil",
        "province": "Northern Cape",
        "description": "Discover salons in Danielskuil. Book hair salons, nail studios, and beauty services in Danielskuil, Northern Cape.",
        "metaTitle": "Danielskuil Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Danielskuil, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Danielskuil salons",
          "Danielskuil hair salon",
          "beauty salon Danielskuil",
          "nails Danielskuil"
        ]
      },
      {
        "slug": "de-aar",
        "name": "De Aar",
        "province": "Northern Cape",
        "description": "Discover salons in De Aar. Book hair salons, nail studios, and beauty services in De Aar, Northern Cape.",
        "metaTitle": "De Aar Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in De Aar, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "De Aar salons",
          "De Aar hair salon",
          "beauty salon De Aar",
          "nails De Aar"
        ]
      },
      {
        "slug": "douglas",
        "name": "Douglas",
        "province": "Northern Cape",
        "description": "Discover salons in Douglas. Book hair salons, nail studios, and beauty services in Douglas, Northern Cape.",
        "metaTitle": "Douglas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Douglas, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Douglas salons",
          "Douglas hair salon",
          "beauty salon Douglas",
          "nails Douglas"
        ]
      },
      {
        "slug": "griekwastad",
        "name": "Griekwastad",
        "province": "Northern Cape",
        "description": "Discover salons in Griekwastad. Book hair salons, nail studios, and beauty services in Griekwastad, Northern Cape.",
        "metaTitle": "Griekwastad Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Griekwastad, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Griekwastad salons",
          "Griekwastad hair salon",
          "beauty salon Griekwastad",
          "nails Griekwastad"
        ]
      },
      {
        "slug": "groblershoop",
        "name": "Groblershoop",
        "province": "Northern Cape",
        "description": "Discover salons in Groblershoop. Book hair salons, nail studios, and beauty services in Groblershoop, Northern Cape.",
        "metaTitle": "Groblershoop Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Groblershoop, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Groblershoop salons",
          "Groblershoop hair salon",
          "beauty salon Groblershoop",
          "nails Groblershoop"
        ]
      },
      {
        "slug": "hanover",
        "name": "Hanover",
        "province": "Northern Cape",
        "description": "Discover salons in Hanover. Book hair salons, nail studios, and beauty services in Hanover, Northern Cape.",
        "metaTitle": "Hanover Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hanover, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hanover salons",
          "Hanover hair salon",
          "beauty salon Hanover",
          "nails Hanover"
        ]
      },
      {
        "slug": "hopetown",
        "name": "Hopetown",
        "province": "Northern Cape",
        "description": "Discover salons in Hopetown. Book hair salons, nail studios, and beauty services in Hopetown, Northern Cape.",
        "metaTitle": "Hopetown Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hopetown, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hopetown salons",
          "Hopetown hair salon",
          "beauty salon Hopetown",
          "nails Hopetown"
        ]
      },
      {
        "slug": "hotazel",
        "name": "Hotazel",
        "province": "Northern Cape",
        "description": "Discover salons in Hotazel. Book hair salons, nail studios, and beauty services in Hotazel, Northern Cape.",
        "metaTitle": "Hotazel Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Hotazel, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Hotazel salons",
          "Hotazel hair salon",
          "beauty salon Hotazel",
          "nails Hotazel"
        ]
      },
      {
        "slug": "kakamas",
        "name": "Kakamas",
        "province": "Northern Cape",
        "description": "Discover salons in Kakamas. Book hair salons, nail studios, and beauty services in Kakamas, Northern Cape.",
        "metaTitle": "Kakamas Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kakamas, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kakamas salons",
          "Kakamas hair salon",
          "beauty salon Kakamas",
          "nails Kakamas"
        ]
      },
      {
        "slug": "kathu",
        "name": "Kathu",
        "province": "Northern Cape",
        "description": "Discover salons in Kathu. Book hair salons, nail studios, and beauty services in Kathu, Northern Cape.",
        "metaTitle": "Kathu Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kathu, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kathu salons",
          "Kathu hair salon",
          "beauty salon Kathu",
          "nails Kathu"
        ]
      },
      {
        "slug": "keimoes",
        "name": "Keimoes",
        "province": "Northern Cape",
        "description": "Discover salons in Keimoes. Book hair salons, nail studios, and beauty services in Keimoes, Northern Cape.",
        "metaTitle": "Keimoes Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Keimoes, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Keimoes salons",
          "Keimoes hair salon",
          "beauty salon Keimoes",
          "nails Keimoes"
        ]
      },
      {
        "slug": "kenhardt",
        "name": "Kenhardt",
        "province": "Northern Cape",
        "description": "Discover salons in Kenhardt. Book hair salons, nail studios, and beauty services in Kenhardt, Northern Cape.",
        "metaTitle": "Kenhardt Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kenhardt, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kenhardt salons",
          "Kenhardt hair salon",
          "beauty salon Kenhardt",
          "nails Kenhardt"
        ]
      },
      {
        "slug": "kimberley",
        "name": "Kimberley",
        "province": "Northern Cape",
        "description": "Discover salons in Kimberley. Book hair salons, nail studios, and beauty services in Kimberley, Northern Cape.",
        "metaTitle": "Kimberley Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kimberley, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kimberley salons",
          "Kimberley hair salon",
          "beauty salon Kimberley",
          "nails Kimberley"
        ]
      },
      {
        "slug": "kuruman",
        "name": "Kuruman",
        "province": "Northern Cape",
        "description": "Discover salons in Kuruman. Book hair salons, nail studios, and beauty services in Kuruman, Northern Cape.",
        "metaTitle": "Kuruman Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Kuruman, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Kuruman salons",
          "Kuruman hair salon",
          "beauty salon Kuruman",
          "nails Kuruman"
        ]
      },
      {
        "slug": "lime-acres",
        "name": "Lime Acres",
        "province": "Northern Cape",
        "description": "Discover salons in Lime Acres. Book hair salons, nail studios, and beauty services in Lime Acres, Northern Cape.",
        "metaTitle": "Lime Acres Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Lime Acres, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Lime Acres salons",
          "Lime Acres hair salon",
          "beauty salon Lime Acres",
          "nails Lime Acres"
        ]
      },
      {
        "slug": "marydale",
        "name": "Marydale",
        "province": "Northern Cape",
        "description": "Discover salons in Marydale. Book hair salons, nail studios, and beauty services in Marydale, Northern Cape.",
        "metaTitle": "Marydale Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Marydale, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Marydale salons",
          "Marydale hair salon",
          "beauty salon Marydale",
          "nails Marydale"
        ]
      },
      {
        "slug": "orania",
        "name": "Orania",
        "province": "Northern Cape",
        "description": "Discover salons in Orania. Book hair salons, nail studios, and beauty services in Orania, Northern Cape.",
        "metaTitle": "Orania Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Orania, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Orania salons",
          "Orania hair salon",
          "beauty salon Orania",
          "nails Orania"
        ]
      },
      {
        "slug": "pofadder",
        "name": "Pofadder",
        "province": "Northern Cape",
        "description": "Discover salons in Pofadder. Book hair salons, nail studios, and beauty services in Pofadder, Northern Cape.",
        "metaTitle": "Pofadder Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Pofadder, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Pofadder salons",
          "Pofadder hair salon",
          "beauty salon Pofadder",
          "nails Pofadder"
        ]
      },
      {
        "slug": "port-nolloth",
        "name": "Port Nolloth",
        "province": "Northern Cape",
        "description": "Discover salons in Port Nolloth. Book hair salons, nail studios, and beauty services in Port Nolloth, Northern Cape.",
        "metaTitle": "Port Nolloth Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Port Nolloth, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Port Nolloth salons",
          "Port Nolloth hair salon",
          "beauty salon Port Nolloth",
          "nails Port Nolloth"
        ]
      },
      {
        "slug": "postmasburg",
        "name": "Postmasburg",
        "province": "Northern Cape",
        "description": "Discover salons in Postmasburg. Book hair salons, nail studios, and beauty services in Postmasburg, Northern Cape.",
        "metaTitle": "Postmasburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Postmasburg, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Postmasburg salons",
          "Postmasburg hair salon",
          "beauty salon Postmasburg",
          "nails Postmasburg"
        ]
      },
      {
        "slug": "prieska",
        "name": "Prieska",
        "province": "Northern Cape",
        "description": "Discover salons in Prieska. Book hair salons, nail studios, and beauty services in Prieska, Northern Cape.",
        "metaTitle": "Prieska Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Prieska, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Prieska salons",
          "Prieska hair salon",
          "beauty salon Prieska",
          "nails Prieska"
        ]
      },
      {
        "slug": "richmond",
        "name": "Richmond",
        "province": "Northern Cape",
        "description": "Discover salons in Richmond. Book hair salons, nail studios, and beauty services in Richmond, Northern Cape.",
        "metaTitle": "Richmond Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Richmond, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Richmond salons",
          "Richmond hair salon",
          "beauty salon Richmond",
          "nails Richmond"
        ]
      },
      {
        "slug": "springbok",
        "name": "Springbok",
        "province": "Northern Cape",
        "description": "Discover salons in Springbok. Book hair salons, nail studios, and beauty services in Springbok, Northern Cape.",
        "metaTitle": "Springbok Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Springbok, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Springbok salons",
          "Springbok hair salon",
          "beauty salon Springbok",
          "nails Springbok"
        ]
      },
      {
        "slug": "strydenburg",
        "name": "Strydenburg",
        "province": "Northern Cape",
        "description": "Discover salons in Strydenburg. Book hair salons, nail studios, and beauty services in Strydenburg, Northern Cape.",
        "metaTitle": "Strydenburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Strydenburg, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Strydenburg salons",
          "Strydenburg hair salon",
          "beauty salon Strydenburg",
          "nails Strydenburg"
        ]
      },
      {
        "slug": "sutherland",
        "name": "Sutherland",
        "province": "Northern Cape",
        "description": "Discover salons in Sutherland. Book hair salons, nail studios, and beauty services in Sutherland, Northern Cape.",
        "metaTitle": "Sutherland Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Sutherland, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Sutherland salons",
          "Sutherland hair salon",
          "beauty salon Sutherland",
          "nails Sutherland"
        ]
      },
      {
        "slug": "upington",
        "name": "Upington",
        "province": "Northern Cape",
        "description": "Discover salons in Upington. Book hair salons, nail studios, and beauty services in Upington, Northern Cape.",
        "metaTitle": "Upington Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Upington, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Upington salons",
          "Upington hair salon",
          "beauty salon Upington",
          "nails Upington"
        ]
      },
      {
        "slug": "victoria-west",
        "name": "Victoria West",
        "province": "Northern Cape",
        "description": "Discover salons in Victoria West. Book hair salons, nail studios, and beauty services in Victoria West, Northern Cape.",
        "metaTitle": "Victoria West Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Victoria West, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Victoria West salons",
          "Victoria West hair salon",
          "beauty salon Victoria West",
          "nails Victoria West"
        ]
      },
      {
        "slug": "vryburg",
        "name": "Vryburg",
        "province": "Northern Cape",
        "description": "Discover salons in Vryburg. Book hair salons, nail studios, and beauty services in Vryburg, Northern Cape.",
        "metaTitle": "Vryburg Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Vryburg, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Vryburg salons",
          "Vryburg hair salon",
          "beauty salon Vryburg",
          "nails Vryburg"
        ]
      },
      {
        "slug": "warrenton",
        "name": "Warrenton",
        "province": "Northern Cape",
        "description": "Discover salons in Warrenton. Book hair salons, nail studios, and beauty services in Warrenton, Northern Cape.",
        "metaTitle": "Warrenton Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Warrenton, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Warrenton salons",
          "Warrenton hair salon",
          "beauty salon Warrenton",
          "nails Warrenton"
        ]
      },
      {
        "slug": "williston",
        "name": "Williston",
        "province": "Northern Cape",
        "description": "Discover salons in Williston. Book hair salons, nail studios, and beauty services in Williston, Northern Cape.",
        "metaTitle": "Williston Salons & Spas | Book Online | Stylr SA",
        "metaDescription": "Find and book top-rated salons in Williston, Northern Cape. Compare prices, read reviews, and book hair, nail, and beauty appointments online.",
        "keywords": [
          "Williston salons",
          "Williston hair salon",
          "beauty salon Williston",
          "nails Williston"
        ]
      }
    ]
  }
};

export function getAllCities(): City[] {
  const cities: City[] = [];
  Object.values(PROVINCES).forEach((province) => {
    cities.push(...province.cities);
  });
  return cities;
}

export function getCitiesByProvince(provinceSlug: string): City[] {
  const province = PROVINCES[provinceSlug];
  return province ? province.cities : [];
}
