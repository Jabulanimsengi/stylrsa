// Location data for SEO and navigation

export interface CityInfo {
  slug: string;
  name: string;
  province: string;
  description: string;
  keywords: string[];
  popularAreas?: string[];
}

export interface ProvinceInfo {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  cities: CityInfo[];
}

export const PROVINCES: Record<string, ProvinceInfo> = {
  gauteng: {
    slug: 'gauteng',
    name: 'Gauteng',
    description: 'Find top-rated salons, spas, and beauty professionals in Gauteng. Book appointments at the best hair salons, nail salons, barbershops, and wellness centers in Johannesburg, Pretoria, and surrounding areas.',
    keywords: ['Gauteng salons', 'Johannesburg beauty', 'Pretoria hair salon', 'Gauteng spa', 'Johannesburg nail salon', 'Pretoria barbershop'],
    cities: [
      // Major Cities & CBDs
      {
        slug: 'johannesburg',
        name: 'Johannesburg',
        province: 'Gauteng',
        description: 'Discover premium salons and beauty services in Johannesburg. Book appointments at top-rated hair salons, nail studios, spas, and barbershops in the heart of Jozi.',
        keywords: ['hair salon near me Johannesburg', 'nail salon near me Johannesburg', 'spa near me Johannesburg', 'best hair salon in Johannesburg', 'beauty salon near me Johannesburg'],
      },
      {
        slug: 'sandton',
        name: 'Sandton',
        province: 'Gauteng',
        description: 'Find luxury salons and premium beauty services in Sandton. Book at the finest hair salons, nail studios, spas, and wellness centers in Sandton City and surrounding areas.',
        keywords: ['luxury spa near me Sandton', 'best hair salon in Sandton', 'nail salon near me Sandton', 'beauty salon Sandton', 'balayage near me Sandton'],
      },
      {
        slug: 'pretoria',
        name: 'Pretoria',
        province: 'Gauteng',
        description: 'Explore top salons and beauty professionals in Pretoria. Book appointments at the best hair salons, nail salons, spas, and barbershops in Tshwane.',
        keywords: ['hair salon near me Pretoria', 'nail salon near me Pretoria', 'spa near me Pretoria', 'beauty salon Pretoria', 'Tshwane salons'],
      },

      // Soweto & Townships
      {
        slug: 'soweto',
        name: 'Soweto',
        province: 'Gauteng',
        description: 'Find quality salons and beauty services in Soweto. Book appointments at trusted hair salons, nail studios, and barbershops serving the Soweto community.',
        keywords: ['hair salon near me Soweto', 'african hair braiding near me Soweto', 'beauty salon Soweto', 'barbershop near me Soweto', 'nail salon Soweto'],
      },
      {
        slug: 'alexandra',
        name: 'Alexandra',
        province: 'Gauteng',
        description: 'Find local salons and beauty services in Alexandra. Book at trusted hair salons, nail studios, and barbershops in Alex.',
        keywords: ['hair salon near me Alexandra', 'beauty salon Alexandra', 'barbershop Alex', 'nail salon Alexandra'],
      },
      {
        slug: 'katlehong',
        name: 'Katlehong',
        province: 'Gauteng',
        description: 'Discover local salons and beauty professionals in Katlehong. Book at trusted hair salons, nail studios, and barbershops in the East Rand.',
        keywords: ['hair salon near me Katlehong', 'beauty salon Katlehong', 'nail salon Katlehong', 'barbershop Katlehong', 'East Rand salons'],
      },
      {
        slug: 'tembisa',
        name: 'Tembisa',
        province: 'Gauteng',
        description: 'Find salons and beauty services in Tembisa. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Tembisa', 'beauty salon Tembisa', 'nail salon Tembisa', 'barbershop Tembisa'],
      },
      {
        slug: 'vosloorus',
        name: 'Vosloorus',
        province: 'Gauteng',
        description: 'Discover salons and beauty professionals in Vosloorus. Book at trusted hair salons and barbershops.',
        keywords: ['hair salon near me Vosloorus', 'beauty salon Vosloorus', 'barbershop Vosloorus'],
      },
      {
        slug: 'thokoza',
        name: 'Thokoza',
        province: 'Gauteng',
        description: 'Find local salons in Thokoza. Book appointments at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Thokoza', 'beauty salon Thokoza', 'barbershop Thokoza'],
      },
      {
        slug: 'daveyton',
        name: 'Daveyton',
        province: 'Gauteng',
        description: 'Discover salons in Daveyton. Book at local hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Daveyton', 'beauty salon Daveyton', 'nail salon Daveyton'],
      },
      {
        slug: 'diepsloot',
        name: 'Diepsloot',
        province: 'Gauteng',
        description: 'Find salons in Diepsloot. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Diepsloot', 'beauty salon Diepsloot', 'barbershop Diepsloot'],
      },

      //       // Northern Suburbs
      //       {
      //         slug: 'fourways',
      //         name: 'Fourways',
      //         province: 'Gauteng',
      //         description: 'Find premium salons in Fourways. Book at top hair salons, nail studios, spas, and beauty centers in Fourways and surrounding areas.',
      //         keywords: ['hair salon near me Fourways', 'spa near me Fourways', 'nail salon near me Fourways', 'beauty salon Fourways'],
      //       },
      //       {
      //         slug: 'midrand',
      //         name: 'Midrand',
      //         province: 'Gauteng',
      //         description: 'Discover salons in Midrand. Book at quality hair salons, nail studios, and spas between Johannesburg and Pretoria.',
      //         keywords: ['hair salon near me Midrand', 'nail salon Midrand', 'spa near me Midrand', 'beauty salon Midrand'],
      //       },
      //       {
      //         slug: 'randburg',
      //         name: 'Randburg',
      //         province: 'Gauteng',
      //         description: 'Find top salons in Randburg. Book at hair salons, nail studios, spas, and barbershops.',
      //         keywords: ['hair salon near me Randburg', 'nail salon Randburg', 'spa Randburg', 'beauty salon Randburg'],
      //       },
      //       {
      //         slug: 'roodepoort',
      //         name: 'Roodepoort',
      //         province: 'Gauteng',
      //         description: 'Discover salons in Roodepoort. Book at hair salons, nail studios, and beauty centers in the West Rand.',
      //         keywords: ['hair salon near me Roodepoort', 'nail salon Roodepoort', 'beauty salon Roodepoort', 'West Rand salons'],
      //       },
      //       {
      //         slug: 'krugersdorp',
      //         name: 'Krugersdorp',
      //         province: 'Gauteng',
      //         description: 'Find salons in Krugersdorp. Book at local hair salons, nail studios, and barbershops in the West Rand.',
      //         keywords: ['hair salon near me Krugersdorp', 'nail salon Krugersdorp', 'beauty salon Krugersdorp'],
      //       },

      // East Rand
      {
        slug: 'benoni',
        name: 'Benoni',
        province: 'Gauteng',
        description: 'Find salons in Benoni. Book at hair salons, nail studios, spas, and barbershops in the East Rand.',
        keywords: ['hair salon near me Benoni', 'nail salon Benoni', 'spa Benoni', 'beauty salon Benoni'],
      },
      {
        slug: 'boksburg',
        name: 'Boksburg',
        province: 'Gauteng',
        description: 'Discover salons in Boksburg. Book at hair salons, nail studios, and beauty centers in East Rand.',
        keywords: ['hair salon near me Boksburg', 'nail salon Boksburg', 'beauty salon Boksburg'],
      },
      {
        slug: 'germiston',
        name: 'Germiston',
        province: 'Gauteng',
        description: 'Find salons in Germiston. Book at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Germiston', 'nail salon Germiston', 'beauty salon Germiston'],
      },
      {
        slug: 'springs',
        name: 'Springs',
        province: 'Gauteng',
        description: 'Discover salons in Springs. Book at hair salons, nail studios, and beauty professionals.',
        keywords: ['hair salon near me Springs', 'nail salon Springs', 'beauty salon Springs'],
      },
      {
        slug: 'alberton',
        name: 'Alberton',
        province: 'Gauteng',
        description: 'Find salons in Alberton. Book at hair salons, nail studios, and spas.',
        keywords: ['hair salon near me Alberton', 'nail salon Alberton', 'spa Alberton', 'beauty salon Alberton'],
      },
      {
        slug: 'edenvale',
        name: 'Edenvale',
        province: 'Gauteng',
        description: 'Discover salons in Edenvale. Book at hair salons, nail studios, and beauty centers near OR Tambo.',
        keywords: ['hair salon near me Edenvale', 'nail salon Edenvale', 'beauty salon Edenvale'],
      },
      {
        slug: 'kempton-park',
        name: 'Kempton Park',
        province: 'Gauteng',
        description: 'Find salons in Kempton Park. Book at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Kempton Park', 'nail salon Kempton Park', 'beauty salon Kempton Park'],
      },

      // Vaal Triangle
      {
        slug: 'vanderbijlpark',
        name: 'Vanderbijlpark',
        province: 'Gauteng',
        description: 'Find salons in Vanderbijlpark. Book at hair salons, nail studios, and beauty professionals in the Vaal Triangle.',
        keywords: ['hair salon near me Vanderbijlpark', 'nail salon Vanderbijlpark', 'beauty salon Vanderbijlpark'],
      },
      {
        slug: 'vereeniging',
        name: 'Vereeniging',
        province: 'Gauteng',
        description: 'Discover salons in Vereeniging. Book at hair salons, nail studios, and barbershops in the Vaal.',
        keywords: ['hair salon near me Vereeniging', 'nail salon Vereeniging', 'beauty salon Vereeniging'],
      },

      // Tshwane/Pretoria Areas
      {
        slug: 'centurion',
        name: 'Centurion',
        province: 'Gauteng',
        description: 'Find top salons in Centurion. Book at premium hair salons, nail studios, spas, and beauty centers.',
        keywords: ['hair salon near me Centurion', 'nail salon Centurion', 'spa near me Centurion', 'beauty salon Centurion'],
      },
      {
        slug: 'mamelodi',
        name: 'Mamelodi',
        province: 'Gauteng',
        description: 'Discover salons in Mamelodi. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Mamelodi', 'beauty salon Mamelodi', 'nail salon Mamelodi', 'barbershop Mamelodi'],
      },
      {
        slug: 'atteridgeville',
        name: 'Atteridgeville',
        province: 'Gauteng',
        description: 'Find salons in Atteridgeville. Book at hair salons, nail studios, and beauty professionals.',
        keywords: ['hair salon near me Atteridgeville', 'beauty salon Atteridgeville', 'nail salon Atteridgeville'],
      },
      {
        slug: 'soshanguve',
        name: 'Soshanguve',
        province: 'Gauteng',
        description: 'Discover salons in Soshanguve. Book at local hair salons and barbershops.',
        keywords: ['hair salon near me Soshanguve', 'beauty salon Soshanguve', 'barbershop Soshanguve'],
      },

      // Upmarket Areas
      {
        slug: 'rosebank',
        name: 'Rosebank',
        province: 'Gauteng',
        description: 'Find premium salons in Rosebank. Book at top hair salons, nail studios, and spas.',
        keywords: ['hair salon near me Rosebank', 'nail salon Rosebank', 'spa Rosebank', 'luxury salon Rosebank'],
      },
      {
        slug: 'melrose',
        name: 'Melrose',
        province: 'Gauteng',
        description: 'Discover upscale salons in Melrose. Book at premium hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Melrose', 'nail salon Melrose', 'beauty salon Melrose'],
      },
      {
        slug: 'hyde-park',
        name: 'Hyde Park',
        province: 'Gauteng',
        description: 'Find luxury salons in Hyde Park. Book at exclusive hair salons, nail studios, and spas.',
        keywords: ['luxury spa near me Hyde Park', 'hair salon Hyde Park', 'nail salon Hyde Park'],
      },
      {
        slug: 'bryanston',
        name: 'Bryanston',
        province: 'Gauteng',
        description: 'Discover premium salons in Bryanston. Book at top hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Bryanston', 'nail salon Bryanston', 'beauty salon Bryanston'],
      },
      // CBD & Central Areas
      {
        slug: 'pretoria-central',
        name: 'Pretoria Central',
        province: 'Gauteng',
        description: 'Find salons in Pretoria Central CBD. Book hair salons, nail studios, and beauty services in the heart of Tshwane.',
        keywords: ['hair salon Pretoria Central', 'nails Pretoria CBD', 'salon Pretoria Central', 'braids Pretoria Central'],
      },
      {
        slug: 'johannesburg-cbd',
        name: 'Johannesburg CBD',
        province: 'Gauteng',
        description: 'Discover salons in Johannesburg CBD. Book hair salons, braiding, and beauty services in central Joburg.',
        keywords: ['hair salon Joburg CBD', 'braids Johannesburg Central', 'salon Johannesburg CBD', 'barbershop Joburg CBD'],
      },
      // Pretoria Suburbs
      {
        slug: 'hatfield',
        name: 'Hatfield',
        province: 'Gauteng',
        description: 'Find student-friendly salons in Hatfield. Book hair salons, nail studios, and beauty services near Tuks.',
        keywords: ['hair salon Hatfield', 'nail salon Hatfield', 'braids Hatfield', 'salon near Tuks'],
      },
      {
        slug: 'menlyn',
        name: 'Menlyn',
        province: 'Gauteng',
        description: 'Discover salons near Menlyn Mall. Book hair salons, nail studios, spas, and beauty services.',
        keywords: ['salon near Menlyn', 'hair salon Menlyn', 'nails Menlyn Mall', 'spa near Menlyn'],
      },
      {
        slug: 'brooklyn',
        name: 'Brooklyn',
        province: 'Gauteng',
        description: 'Find salons in Brooklyn, Pretoria. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Brooklyn Pretoria', 'nail salon Brooklyn', 'beauty salon Brooklyn'],
      },
      {
        slug: 'arcadia',
        name: 'Arcadia',
        province: 'Gauteng',
        description: 'Discover salons in Arcadia, Pretoria. Book hair salons and beauty services near the Union Buildings.',
        keywords: ['salon Arcadia Pretoria', 'hair salon Arcadia', 'beauty services Arcadia'],
      },
      {
        slug: 'sunnyside',
        name: 'Sunnyside',
        province: 'Gauteng',
        description: 'Find affordable salons in Sunnyside. Book hair braiding, nail studios, and beauty services.',
        keywords: ['braids Sunnyside Pretoria', 'salon Sunnyside', 'hair salon Sunnyside', 'affordable salon Sunnyside'],
      },
      {
        slug: 'lynnwood',
        name: 'Lynnwood',
        province: 'Gauteng',
        description: 'Discover premium salons in Lynnwood. Book hair salons, nail studios, and spa services.',
        keywords: ['salon Lynnwood Pretoria', 'hair salon Lynnwood', 'nails Lynnwood', 'spa Lynnwood'],
      },
      {
        slug: 'waterkloof',
        name: 'Waterkloof',
        province: 'Gauteng',
        description: 'Find luxury salons in Waterkloof. Book premium hair salons, spas, and beauty services.',
        keywords: ['luxury spa Waterkloof', 'hair salon Waterkloof', 'premium salon Waterkloof'],
      },
      {
        slug: 'garsfontein',
        name: 'Garsfontein',
        province: 'Gauteng',
        description: 'Discover salons in Garsfontein. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Garsfontein', 'hair salon Garsfontein', 'nails Garsfontein'],
      },
      {
        slug: 'montana',
        name: 'Montana',
        province: 'Gauteng',
        description: 'Find salons in Montana, Pretoria. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Montana Pretoria', 'hair salon Montana', 'nails Montana'],
      },
      // Johannesburg Suburbs
      {
        slug: 'rosebank',
        name: 'Rosebank',
        province: 'Gauteng',
        description: 'Discover premium salons in Rosebank. Book hair salons, nail studios, spas, and beauty services.',
        keywords: ['hair salon Rosebank', 'spa Rosebank', 'nails Rosebank', 'beauty salon Rosebank'],
      },
      {
        slug: 'braamfontein',
        name: 'Braamfontein',
        province: 'Gauteng',
        description: 'Find trendy salons in Braamfontein. Book hair salons, braiding, and beauty services.',
        keywords: ['salon Braamfontein', 'braids Braamfontein', 'hair salon Braamfontein'],
      },
      {
        slug: 'melville',
        name: 'Melville',
        province: 'Gauteng',
        description: 'Discover artistic salons in Melville. Book creative hair salons and beauty services.',
        keywords: ['salon Melville', 'hair salon Melville Joburg', 'braids Melville'],
      },
      {
        slug: 'parkhurst',
        name: 'Parkhurst',
        province: 'Gauteng',
        description: 'Find boutique salons in Parkhurst. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Parkhurst', 'hair salon Parkhurst', 'beauty salon Parkhurst'],
      },
      {
        slug: 'rivonia',
        name: 'Rivonia',
        province: 'Gauteng',
        description: 'Discover salons in Rivonia. Book hair salons, nail studios, and spa services.',
        keywords: ['hair salon Rivonia', 'nails Rivonia', 'spa Rivonia', 'beauty salon Rivonia'],
      },
      {
        slug: 'bedfordview',
        name: 'Bedfordview',
        province: 'Gauteng',
        description: 'Find premium salons in Bedfordview. Book hair salons, spas, and beauty services.',
        keywords: ['spa Bedfordview', 'hair salon Bedfordview', 'beauty salon Bedfordview'],
      },
      {
        slug: 'norwood',
        name: 'Norwood',
        province: 'Gauteng',
        description: 'Discover salons in Norwood. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Norwood Joburg', 'hair salon Norwood', 'nails Norwood'],
      },
      {
        slug: 'northcliff',
        name: 'Northcliff',
        province: 'Gauteng',
        description: 'Find salons in Northcliff. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Northcliff', 'hair salon Northcliff', 'beauty services Northcliff'],
      },
      // Soweto Suburbs
      {
        slug: 'orlando',
        name: 'Orlando',
        province: 'Gauteng',
        description: 'Find salons in Orlando, Soweto. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Orlando Soweto', 'braids Orlando', 'hair salon Orlando Soweto'],
      },
      {
        slug: 'diepkloof',
        name: 'Diepkloof',
        province: 'Gauteng',
        description: 'Discover salons in Diepkloof. Book hair salons, braiding, and beauty services.',
        keywords: ['hair salon Diepkloof', 'braids Diepkloof', 'salon Diepkloof Soweto'],
      },
      {
        slug: 'protea-glen',
        name: 'Protea Glen',
        province: 'Gauteng',
        description: 'Find salons in Protea Glen. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Protea Glen', 'hair salon Protea Glen', 'braids Protea Glen'],
      },
      {
        slug: 'meadowlands',
        name: 'Meadowlands',
        province: 'Gauteng',
        description: 'Discover salons in Meadowlands. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Meadowlands Soweto', 'salon Meadowlands', 'hair salon Meadowlands'],
      },
      // Malls as locations
      {
        slug: 'sandton-city',
        name: 'Sandton City',
        province: 'Gauteng',
        description: 'Find luxury salons near Sandton City Mall. Book premium hair salons, spas, and beauty services.',
        keywords: ['salon near Sandton City', 'spa Sandton City', 'nails Sandton City Mall'],
      },
      {
        slug: 'mall-of-africa',
        name: 'Mall of Africa',
        province: 'Gauteng',
        description: 'Discover salons near Mall of Africa. Book hair salons, spas, and beauty services in Waterfall.',
        keywords: ['salon Mall of Africa', 'spa Mall of Africa', 'hair salon Waterfall'],
      },
      {
        slug: 'menlyn-mall',
        name: 'Menlyn Mall',
        province: 'Gauteng',
        description: 'Find salons at Menlyn Park Mall. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Menlyn Mall', 'nails Menlyn Park', 'hair salon Menlyn Mall'],
      },
      {
        slug: 'eastgate',
        name: 'Eastgate',
        province: 'Gauteng',
        description: 'Discover salons near Eastgate Mall. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Eastgate', 'nails Eastgate Mall', 'hair salon Eastgate'],
      },
      {
        slug: 'brooklyn-mall',
        name: 'Brooklyn Mall',
        province: 'Gauteng',
        description: 'Find salons at Brooklyn Mall. Book hair salons, nail studios, and spa services.',
        keywords: ['salon Brooklyn Mall', 'hair salon Brooklyn Mall Pretoria', 'nails Brooklyn Mall'],
      },
      {
        slug: 'maponya-mall',
        name: 'Maponya Mall',
        province: 'Gauteng',
        description: 'Discover salons at Maponya Mall Soweto. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Maponya Mall', 'braids Maponya Mall', 'hair salon Maponya Mall Soweto'],
      },
      // Pretoria Townships
      {
        slug: 'mamelodi',
        name: 'Mamelodi',
        province: 'Gauteng',
        description: 'Find salons in Mamelodi. Book hair braiding, salons, and beauty services in Mamelodi East and West.',
        keywords: ['braids Mamelodi', 'salon Mamelodi', 'hair salon Mamelodi', 'barbershop Mamelodi'],
      },
      {
        slug: 'atteridgeville',
        name: 'Atteridgeville',
        province: 'Gauteng',
        description: 'Discover salons in Atteridgeville. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Atteridgeville', 'braids Atteridgeville', 'hair salon Atteridgeville'],
      },
      {
        slug: 'soshanguve',
        name: 'Soshanguve',
        province: 'Gauteng',
        description: 'Find salons in Soshanguve. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Soshanguve', 'salon Soshanguve', 'hair salon Soshanguve'],
      },
      {
        slug: 'hammanskraal',
        name: 'Hammanskraal',
        province: 'Gauteng',
        description: 'Discover salons in Hammanskraal. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Hammanskraal', 'braids Hammanskraal', 'hair salon Hammanskraal'],
      },
      {
        slug: 'mabopane',
        name: 'Mabopane',
        province: 'Gauteng',
        description: 'Find salons in Mabopane. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Mabopane', 'salon Mabopane', 'hair salon Mabopane'],
      },
      {
        slug: 'ga-rankuwa',
        name: 'Ga-Rankuwa',
        province: 'Gauteng',
        description: 'Discover salons in Ga-Rankuwa. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Ga-Rankuwa', 'braids Ga-Rankuwa', 'hair salon Ga-Rankuwa'],
      },
      {
        slug: 'winterveld',
        name: 'Winterveld',
        province: 'Gauteng',
        description: 'Find salons in Winterveld. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Winterveld', 'salon Winterveld', 'hair salon Winterveld'],
      },
      // East Rand Townships
      {
        slug: 'etwatwa',
        name: 'Etwatwa',
        province: 'Gauteng',
        description: 'Discover salons in Etwatwa. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Etwatwa', 'braids Etwatwa', 'hair salon Etwatwa'],
      },
      {
        slug: 'duduza',
        name: 'Duduza',
        province: 'Gauteng',
        description: 'Find salons in Duduza. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Duduza', 'salon Duduza', 'hair salon Duduza'],
      },
      {
        slug: 'kwathema',
        name: 'KwaThema',
        province: 'Gauteng',
        description: 'Discover salons in KwaThema. Book hair braiding, salons, and beauty services.',
        keywords: ['salon KwaThema', 'braids KwaThema', 'hair salon KwaThema'],
      },
      {
        slug: 'springs',
        name: 'Springs',
        province: 'Gauteng',
        description: 'Find salons in Springs. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Springs', 'nail salon Springs', 'beauty salon Springs'],
      },
      {
        slug: 'benoni',
        name: 'Benoni',
        province: 'Gauteng',
        description: 'Discover salons in Benoni. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Benoni', 'hair salon Benoni', 'nails Benoni'],
      },
      {
        slug: 'boksburg',
        name: 'Boksburg',
        province: 'Gauteng',
        description: 'Find salons in Boksburg. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Boksburg', 'nail salon Boksburg', 'beauty salon Boksburg'],
      },
      // West Rand
      {
        slug: 'krugersdorp',
        name: 'Krugersdorp',
        province: 'Gauteng',
        description: 'Discover salons in Krugersdorp. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Krugersdorp', 'hair salon Krugersdorp', 'nails Krugersdorp'],
      },
      {
        slug: 'randfontein',
        name: 'Randfontein',
        province: 'Gauteng',
        description: 'Find salons in Randfontein. Book hair salons and beauty services.',
        keywords: ['hair salon Randfontein', 'salon Randfontein', 'beauty salon Randfontein'],
      },
      {
        slug: 'roodepoort',
        name: 'Roodepoort',
        province: 'Gauteng',
        description: 'Discover salons in Roodepoort. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Roodepoort', 'hair salon Roodepoort', 'nails Roodepoort'],
      },
      // Vaal
      {
        slug: 'vereeniging',
        name: 'Vereeniging',
        province: 'Gauteng',
        description: 'Find salons in Vereeniging. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Vereeniging', 'salon Vereeniging', 'Vaal salons'],
      },
      {
        slug: 'vanderbijlpark',
        name: 'Vanderbijlpark',
        province: 'Gauteng',
        description: 'Discover salons in Vanderbijlpark. Book hair salons and beauty services.',
        keywords: ['salon Vanderbijlpark', 'hair salon Vanderbijlpark', 'nails Vanderbijlpark'],
      },
      {
        slug: 'sebokeng',
        name: 'Sebokeng',
        province: 'Gauteng',
        description: 'Find salons in Sebokeng. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Sebokeng', 'salon Sebokeng', 'hair salon Sebokeng'],
      },
      {
        slug: 'evaton',
        name: 'Evaton',
        province: 'Gauteng',
        description: 'Discover salons in Evaton. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Evaton', 'braids Evaton', 'hair salon Evaton'],
      },
      {
        slug: 'sharpeville',
        name: 'Sharpeville',
        province: 'Gauteng',
        description: 'Find salons in Sharpeville. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Sharpeville', 'salon Sharpeville', 'hair salon Sharpeville'],
      },
    ],
  },
  'western-cape': {
    slug: 'western-cape',
    name: 'Western Cape',
    description: 'Discover premier salons, spas, and beauty services in the Western Cape. Book appointments at top-rated establishments in Cape Town, Stellenbosch, and the Garden Route.',
    keywords: ['Western Cape salons', 'Cape Town beauty', 'Cape Town hair salon', 'Western Cape spa', 'Cape Town nail salon'],
    cities: [
      {
        slug: 'cape-town',
        name: 'Cape Town',
        province: 'Western Cape',
        description: 'Explore the best salons and beauty professionals in Cape Town. Book at top-rated hair salons, nail studios, spas, and wellness centers in the Mother City.',
        keywords: ['Cape Town salons', 'Cape Town hair salon', 'Cape Town spa', 'Cape Town nail salon', 'Cape Town beauty', 'V&A Waterfront salon'],
        popularAreas: ['V&A Waterfront', 'City Bowl', 'Sea Point', 'Camps Bay', 'Constantia', 'Claremont'],
      },
      {
        slug: 'stellenbosch',
        name: 'Stellenbosch',
        province: 'Western Cape',
        description: 'Find quality salons in Stellenbosch. Book appointments at trusted hair salons, nail studios, and beauty centers in the Winelands.',
        keywords: ['Stellenbosch salons', 'Stellenbosch hair salon', 'Stellenbosch beauty', 'Winelands salon'],
      },
      {
        slug: 'somerset-west',
        name: 'Somerset West',
        province: 'Western Cape',
        description: 'Discover salons in Somerset West. Book at local hair salons, nail studios, and beauty professionals in the Helderberg area.',
        keywords: ['Somerset West salons', 'Somerset West hair salon', 'Helderberg beauty', 'Somerset West spa'],
      },
      // Cape Town Suburbs
      {
        slug: 'cape-town-cbd',
        name: 'Cape Town CBD',
        province: 'Western Cape',
        description: 'Find salons in Cape Town CBD. Book hair salons, nail studios, and beauty services in the city centre.',
        keywords: ['hair salon Cape Town Central', 'nails Cape Town CBD', 'salon Cape Town CBD'],
      },
      {
        slug: 'sea-point',
        name: 'Sea Point',
        province: 'Western Cape',
        description: 'Discover salons in Sea Point. Book hair salons, nail studios, and beauty services on the Atlantic Seaboard.',
        keywords: ['salon Sea Point', 'hair salon Sea Point', 'nails Sea Point'],
      },
      {
        slug: 'camps-bay',
        name: 'Camps Bay',
        province: 'Western Cape',
        description: 'Find luxury salons in Camps Bay. Book premium spa and beauty services.',
        keywords: ['spa Camps Bay', 'luxury salon Camps Bay', 'beauty Camps Bay'],
      },
      {
        slug: 'claremont',
        name: 'Claremont',
        province: 'Western Cape',
        description: 'Discover salons in Claremont. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Claremont', 'hair salon Claremont', 'nails Claremont'],
      },
      {
        slug: 'constantia',
        name: 'Constantia',
        province: 'Western Cape',
        description: 'Find luxury salons in Constantia. Book premium spas and beauty services.',
        keywords: ['luxury spa Constantia', 'salon Constantia', 'hair salon Constantia'],
      },
      {
        slug: 'bellville',
        name: 'Bellville',
        province: 'Western Cape',
        description: 'Discover salons in Bellville. Book hair salons, braiding, and beauty services.',
        keywords: ['salon Bellville', 'braids Bellville', 'hair salon Bellville'],
      },
      {
        slug: 'century-city',
        name: 'Century City',
        province: 'Western Cape',
        description: 'Find salons at Century City. Book hair salons, spas, and beauty services near Canal Walk.',
        keywords: ['spa Century City', 'salon Canal Walk', 'hair salon Century City'],
      },
      {
        slug: 'tyger-valley',
        name: 'Tyger Valley',
        province: 'Western Cape',
        description: 'Discover salons near Tyger Valley. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Tyger Valley', 'hair salon Tyger Valley Centre', 'nails Tyger Valley'],
      },
      {
        slug: 'table-view',
        name: 'Table View',
        province: 'Western Cape',
        description: 'Find salons in Table View. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Table View', 'hair salon Table View', 'nails Table View'],
      },
      {
        slug: 'blouberg',
        name: 'Blouberg',
        province: 'Western Cape',
        description: 'Discover salons in Blouberg. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Blouberg', 'hair salon Blouberg', 'nails Blouberg'],
      },
      {
        slug: 'khayelitsha',
        name: 'Khayelitsha',
        province: 'Western Cape',
        description: 'Find salons in Khayelitsha. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Khayelitsha', 'salon Khayelitsha', 'hair salon Khayelitsha'],
      },
      {
        slug: 'mitchells-plain',
        name: 'Mitchells Plain',
        province: 'Western Cape',
        description: 'Discover salons in Mitchells Plain. Book hair salons, braiding, and beauty services.',
        keywords: ['braids Mitchells Plain', 'salon Mitchells Plain', 'hair salon Mitchells Plain'],
      },
      {
        slug: 'gugulethu',
        name: 'Gugulethu',
        province: 'Western Cape',
        description: 'Find salons in Gugulethu. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Gugulethu', 'braids Gugulethu', 'hair salon Gugulethu'],
      },
      // Cape Town Malls
      {
        slug: 'waterfront',
        name: 'V&A Waterfront',
        province: 'Western Cape',
        description: 'Find luxury salons at V&A Waterfront. Book premium hair salons, spas, and beauty services.',
        keywords: ['salon V&A Waterfront', 'spa Waterfront', 'hair salon Waterfront Cape Town'],
      },
      {
        slug: 'canal-walk',
        name: 'Canal Walk',
        province: 'Western Cape',
        description: 'Discover salons at Canal Walk Mall. Book hair salons, spas, and beauty services.',
        keywords: ['spa Canal Walk', 'salon Century City', 'hair salon Canal Walk'],
      },
      {
        slug: 'cavendish-square',
        name: 'Cavendish Square',
        province: 'Western Cape',
        description: 'Find salons at Cavendish Square. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Cavendish Square', 'hair salon Cavendish', 'nails Cavendish'],
      },
    ],
  },
  'kwazulu-natal': {
    slug: 'kwazulu-natal',
    name: 'KwaZulu-Natal',
    description: 'Find exceptional salons and beauty professionals in KwaZulu-Natal. Book services at top hair salons, nail salons, and spas in Durban, Pietermaritzburg, and the North Coast.',
    keywords: ['KwaZulu-Natal salons', 'Durban hair salon', 'Durban beauty salon', 'KZN spa', 'Durban nail salon'],
    cities: [
      {
        slug: 'durban',
        name: 'Durban',
        province: 'KwaZulu-Natal',
        description: 'Discover top salons and beauty services in Durban. Book appointments at the best hair salons, nail studios, spas, and barbershops in Durban and surrounding areas.',
        keywords: ['Durban salons', 'Durban hair salon', 'Durban spa', 'Durban nail salon', 'Durban beauty', 'Umhlanga salons'],
        popularAreas: ['Umhlanga', 'Durban North', 'Westville', 'Gateway', 'Morningside'],
      },
      {
        slug: 'pietermaritzburg',
        name: 'Pietermaritzburg',
        province: 'KwaZulu-Natal',
        description: 'Find quality salons in Pietermaritzburg. Book at trusted hair salons, nail studios, and beauty centers in the capital city of KZN.',
        keywords: ['Pietermaritzburg salons', 'PMB hair salon', 'Pietermaritzburg beauty', 'PMB spa'],
      },
      // Durban Suburbs
      {
        slug: 'umhlanga',
        name: 'Umhlanga',
        province: 'KwaZulu-Natal',
        description: 'Discover luxury salons in Umhlanga. Book premium hair salons, spas, and beauty services near Gateway.',
        keywords: ['salon Umhlanga', 'spa Umhlanga', 'hair salon Umhlanga', 'nails Gateway'],
      },
      {
        slug: 'durban-north',
        name: 'Durban North',
        province: 'KwaZulu-Natal',
        description: 'Find salons in Durban North. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Durban North', 'hair salon Durban North', 'nails Durban North'],
      },
      {
        slug: 'westville',
        name: 'Westville',
        province: 'KwaZulu-Natal',
        description: 'Discover salons in Westville. Book hair salons, spas, and beauty services near Pavilion.',
        keywords: ['spa Westville Durban', 'salon Westville', 'hair salon Westville'],
      },
      {
        slug: 'pinetown',
        name: 'Pinetown',
        province: 'KwaZulu-Natal',
        description: 'Find salons in Pinetown. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Pinetown', 'salon Pinetown', 'hair salon Pinetown'],
      },
      {
        slug: 'ballito',
        name: 'Ballito',
        province: 'KwaZulu-Natal',
        description: 'Discover salons in Ballito. Book hair salons, spas, and beauty services on the North Coast.',
        keywords: ['salon Ballito', 'spa Ballito', 'hair salon Ballito'],
      },
      {
        slug: 'chatsworth',
        name: 'Chatsworth',
        province: 'KwaZulu-Natal',
        description: 'Find salons in Chatsworth. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Chatsworth Durban', 'hair salon Chatsworth', 'nails Chatsworth'],
      },
      {
        slug: 'phoenix',
        name: 'Phoenix',
        province: 'KwaZulu-Natal',
        description: 'Discover salons in Phoenix. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Phoenix Durban', 'salon Phoenix', 'hair salon Phoenix'],
      },
      {
        slug: 'umlazi',
        name: 'Umlazi',
        province: 'KwaZulu-Natal',
        description: 'Find salons in Umlazi. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Umlazi', 'braids Umlazi', 'hair salon Umlazi'],
      },
      {
        slug: 'kwamashu',
        name: 'KwaMashu',
        province: 'KwaZulu-Natal',
        description: 'Discover salons in KwaMashu. Book hair braiding, salons, and beauty services.',
        keywords: ['braids KwaMashu', 'salon KwaMashu', 'hair salon KwaMashu'],
      },
      // KZN Malls
      {
        slug: 'gateway',
        name: 'Gateway',
        province: 'KwaZulu-Natal',
        description: 'Find salons at Gateway Theatre of Shopping. Book hair salons, spas, and beauty services.',
        keywords: ['salon Gateway Umhlanga', 'spa Gateway', 'hair salon Gateway'],
      },
      {
        slug: 'pavilion',
        name: 'Pavilion',
        province: 'KwaZulu-Natal',
        description: 'Discover salons at Pavilion Mall Westville. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Pavilion Westville', 'hair salon Pavilion', 'nails Pavilion Mall'],
      },
    ],
  },
  'eastern-cape': {
    slug: 'eastern-cape',
    name: 'Eastern Cape',
    description: 'Find top salons and beauty professionals in the Eastern Cape. Book appointments in Gqeberha (Port Elizabeth), East London, and surrounding areas.',
    keywords: ['Eastern Cape salons', 'Port Elizabeth hair salon', 'East London beauty salon', 'Gqeberha spa'],
    cities: [
      {
        slug: 'gqeberha',
        name: 'Gqeberha (Port Elizabeth)',
        province: 'Eastern Cape',
        description: 'Discover salons in Gqeberha. Book at top hair salons, nail studios, and spas in the Friendly City.',
        keywords: ['hair salon Gqeberha', 'Port Elizabeth beauty salon', 'nail salon PE', 'spa Gqeberha'],
      },
      {
        slug: 'east-london',
        name: 'East London',
        province: 'Eastern Cape',
        description: 'Find quality salons in East London. Book at trusted hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon East London', 'nail salon East London', 'beauty salon East London'],
      },
      // Eastern Cape Townships
      {
        slug: 'mdantsane',
        name: 'Mdantsane',
        province: 'Eastern Cape',
        description: 'Find salons in Mdantsane. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Mdantsane', 'salon Mdantsane', 'hair salon Mdantsane'],
      },
      {
        slug: 'motherwell',
        name: 'Motherwell',
        province: 'Eastern Cape',
        description: 'Discover salons in Motherwell. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Motherwell', 'braids Motherwell', 'hair salon Motherwell PE'],
      },
      {
        slug: 'kwanobuhle',
        name: 'KwaNobuhle',
        province: 'Eastern Cape',
        description: 'Find salons in KwaNobuhle. Book hair braiding, salons, and beauty services.',
        keywords: ['braids KwaNobuhle', 'salon KwaNobuhle', 'hair salon KwaNobuhle'],
      },
      {
        slug: 'zwide',
        name: 'Zwide',
        province: 'Eastern Cape',
        description: 'Discover salons in Zwide. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Zwide', 'braids Zwide', 'hair salon Zwide'],
      },
      {
        slug: 'new-brighton',
        name: 'New Brighton',
        province: 'Eastern Cape',
        description: 'Find salons in New Brighton. Book hair braiding, salons, and beauty services.',
        keywords: ['braids New Brighton', 'salon New Brighton', 'hair salon New Brighton'],
      },
      {
        slug: 'uitenhage',
        name: 'Uitenhage',
        province: 'Eastern Cape',
        description: 'Discover salons in Uitenhage. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Uitenhage', 'hair salon Uitenhage', 'nails Uitenhage'],
      },
      {
        slug: 'grahamstown',
        name: 'Makhanda (Grahamstown)',
        province: 'Eastern Cape',
        description: 'Find salons in Makhanda. Book hair salons and beauty services.',
        keywords: ['hair salon Grahamstown', 'salon Makhanda', 'beauty Grahamstown'],
      },
      {
        slug: 'vincent',
        name: 'Vincent',
        province: 'Eastern Cape',
        description: 'Discover salons in Vincent, East London. Book hair salons and beauty services.',
        keywords: ['salon Vincent East London', 'hair salon Vincent', 'nails Vincent'],
      },
      {
        slug: 'beacon-bay',
        name: 'Beacon Bay',
        province: 'Eastern Cape',
        description: 'Find salons in Beacon Bay. Book hair salons, nail studios, and beauty services.',
        keywords: ['salon Beacon Bay', 'hair salon Beacon Bay', 'nails Beacon Bay'],
      },
    ],
  },
  'free-state': {
    slug: 'free-state',
    name: 'Free State',
    description: 'Discover salons and beauty services in the Free State. Book appointments in Bloemfontein, Welkom, and Sasolburg.',
    keywords: ['Free State salons', 'Bloemfontein hair salon', 'Welkom beauty salon', 'Free State spa'],
    cities: [
      {
        slug: 'bloemfontein',
        name: 'Bloemfontein',
        province: 'Free State',
        description: 'Find top salons in Bloemfontein. Book at hair salons, nail studios, and spas in the City of Roses.',
        keywords: ['hair salon Bloemfontein', 'nail salon Bloemfontein', 'beauty salon Bloemfontein', 'spa Bloemfontein'],
      },
      {
        slug: 'welkom',
        name: 'Welkom',
        province: 'Free State',
        description: 'Discover salons in Welkom. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon Welkom', 'nail salon Welkom', 'beauty salon Welkom'],
      },
      // Free State Townships & Cities
      {
        slug: 'botshabelo',
        name: 'Botshabelo',
        province: 'Free State',
        description: 'Find salons in Botshabelo. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Botshabelo', 'salon Botshabelo', 'hair salon Botshabelo'],
      },
      {
        slug: 'thaba-nchu',
        name: 'Thaba Nchu',
        province: 'Free State',
        description: 'Discover salons in Thaba Nchu. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Thaba Nchu', 'braids Thaba Nchu', 'hair salon Thaba Nchu'],
      },
      {
        slug: 'qwaqwa',
        name: 'QwaQwa (Phuthaditjhaba)',
        province: 'Free State',
        description: 'Find salons in QwaQwa. Book hair braiding, salons, and beauty services.',
        keywords: ['braids QwaQwa', 'salon Phuthaditjhaba', 'hair salon QwaQwa'],
      },
      {
        slug: 'sasolburg',
        name: 'Sasolburg',
        province: 'Free State',
        description: 'Discover salons in Sasolburg. Book hair salons and beauty services.',
        keywords: ['salon Sasolburg', 'hair salon Sasolburg', 'nails Sasolburg'],
      },
      {
        slug: 'kroonstad',
        name: 'Kroonstad',
        province: 'Free State',
        description: 'Find salons in Kroonstad. Book hair salons and beauty services.',
        keywords: ['hair salon Kroonstad', 'salon Kroonstad', 'beauty Kroonstad'],
      },
      {
        slug: 'bethlehem',
        name: 'Bethlehem',
        province: 'Free State',
        description: 'Discover salons in Bethlehem. Book hair salons and beauty services.',
        keywords: ['salon Bethlehem', 'hair salon Bethlehem', 'beauty Bethlehem'],
      },
    ],
  },
  'limpopo': {
    slug: 'limpopo',
    name: 'Limpopo',
    description: 'Find beauty professionals in Limpopo. Book appointments in Polokwane, Tzaneen, and Thohoyandou.',
    keywords: ['Limpopo salons', 'Polokwane hair salon', 'Limpopo beauty', 'Polokwane spa'],
    cities: [
      {
        slug: 'polokwane',
        name: 'Polokwane',
        province: 'Limpopo',
        description: 'Discover salons in Polokwane. Book at top hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon Polokwane', 'nail salon Polokwane', 'beauty salon Polokwane'],
      },
      {
        slug: 'tzaneen',
        name: 'Tzaneen',
        province: 'Limpopo',
        description: 'Find salons in Tzaneen. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Tzaneen', 'beauty salon Tzaneen'],
      },
      // Limpopo Townships & Towns
      {
        slug: 'seshego',
        name: 'Seshego',
        province: 'Limpopo',
        description: 'Discover salons in Seshego. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Seshego', 'salon Seshego', 'hair salon Seshego'],
      },
      {
        slug: 'mankweng',
        name: 'Mankweng',
        province: 'Limpopo',
        description: 'Find salons in Mankweng. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Mankweng', 'braids Mankweng', 'hair salon Mankweng'],
      },
      {
        slug: 'thohoyandou',
        name: 'Thohoyandou',
        province: 'Limpopo',
        description: 'Discover salons in Thohoyandou. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Thohoyandou', 'salon Thohoyandou', 'hair salon Thohoyandou'],
      },
      {
        slug: 'giyani',
        name: 'Giyani',
        province: 'Limpopo',
        description: 'Find salons in Giyani. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Giyani', 'braids Giyani', 'hair salon Giyani'],
      },
      {
        slug: 'lephalale',
        name: 'Lephalale',
        province: 'Limpopo',
        description: 'Discover salons in Lephalale. Book hair salons and beauty services.',
        keywords: ['hair salon Lephalale', 'salon Lephalale', 'Ellisras salons'],
      },
      {
        slug: 'mokopane',
        name: 'Mokopane',
        province: 'Limpopo',
        description: 'Find salons in Mokopane. Book hair salons and beauty services.',
        keywords: ['salon Mokopane', 'hair salon Mokopane', 'Potgietersrus salons'],
      },
      {
        slug: 'louis-trichardt',
        name: 'Louis Trichardt (Makhado)',
        province: 'Limpopo',
        description: 'Discover salons in Louis Trichardt. Book hair salons and beauty services.',
        keywords: ['hair salon Louis Trichardt', 'salon Makhado', 'beauty Louis Trichardt'],
      },
    ],
  },
  'mpumalanga': {
    slug: 'mpumalanga',
    name: 'Mpumalanga',
    description: 'Discover beauty services in Mpumalanga. Book appointments in Mbombela (Nelspruit), Witbank, and surrounding areas.',
    keywords: ['Mpumalanga salons', 'Nelspruit hair salon', 'Mbombela beauty salon', 'Witbank spa'],
    cities: [
      {
        slug: 'mbombela',
        name: 'Mbombela (Nelspruit)',
        province: 'Mpumalanga',
        description: 'Find top salons in Mbombela. Book at hair salons, nail studios, and spas in the Lowveld.',
        keywords: ['hair salon Nelspruit', 'beauty salon Mbombela', 'nail salon Nelspruit'],
      },
      {
        slug: 'witbank',
        name: 'Witbank (Emalahleni)',
        province: 'Mpumalanga',
        description: 'Discover salons in Witbank. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Witbank', 'nail salon Witbank', 'beauty salon Emalahleni'],
      },
      // Mpumalanga Townships & Towns
      {
        slug: 'kwamuhlanga',
        name: 'KwaMhlanga',
        province: 'Mpumalanga',
        description: 'Find salons in KwaMhlanga. Book hair braiding, salons, and beauty services.',
        keywords: ['braids KwaMhlanga', 'salon KwaMhlanga', 'hair salon KwaMhlanga'],
      },
      {
        slug: 'malelane',
        name: 'Malelane',
        province: 'Mpumalanga',
        description: 'Discover salons in Malelane. Book hair salons and beauty services.',
        keywords: ['salon Malelane', 'hair salon Malelane', 'beauty Malelane'],
      },
      {
        slug: 'secunda',
        name: 'Secunda',
        province: 'Mpumalanga',
        description: 'Find salons in Secunda. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Secunda', 'nail salon Secunda', 'beauty salon Secunda'],
      },
      {
        slug: 'middelburg-mp',
        name: 'Middelburg',
        province: 'Mpumalanga',
        description: 'Discover salons in Middelburg. Book hair salons and beauty services.',
        keywords: ['salon Middelburg Mpumalanga', 'hair salon Middelburg', 'beauty Middelburg'],
      },
      {
        slug: 'ermelo',
        name: 'Ermelo',
        province: 'Mpumalanga',
        description: 'Find salons in Ermelo. Book hair salons and beauty services.',
        keywords: ['hair salon Ermelo', 'salon Ermelo', 'beauty Ermelo'],
      },
      {
        slug: 'white-river',
        name: 'White River',
        province: 'Mpumalanga',
        description: 'Discover salons in White River. Book hair salons and beauty services.',
        keywords: ['salon White River', 'hair salon White River', 'spa White River'],
      },
    ],
  },
  'north-west': {
    slug: 'north-west',
    name: 'North West',
    description: 'Find salons and beauty professionals in North West. Book appointments in Rustenburg, Potchefstroom, and Klerksdorp.',
    keywords: ['North West salons', 'Rustenburg hair salon', 'Potchefstroom beauty salon', 'North West spa'],
    cities: [
      {
        slug: 'rustenburg',
        name: 'Rustenburg',
        province: 'North West',
        description: 'Find top salons in Rustenburg. Book at hair salons, nail studios, and spas in the Platinum City.',
        keywords: ['hair salon Rustenburg', 'nail salon Rustenburg', 'beauty salon Rustenburg'],
      },
      {
        slug: 'potchefstroom',
        name: 'Potchefstroom',
        province: 'North West',
        description: 'Discover salons in Potchefstroom. Book at local hair salons and beauty centers.',
        keywords: ['hair salon Potchefstroom', 'nail salon Potchefstroom', 'beauty salon Potchefstroom'],
      },
      // North West Townships & Towns
      {
        slug: 'klerksdorp',
        name: 'Klerksdorp',
        province: 'North West',
        description: 'Find salons in Klerksdorp. Book hair salons, nail studios, and beauty services.',
        keywords: ['hair salon Klerksdorp', 'nail salon Klerksdorp', 'beauty salon Klerksdorp'],
      },
      {
        slug: 'mmabatho',
        name: 'Mmabatho',
        province: 'North West',
        description: 'Discover salons in Mmabatho. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Mmabatho', 'salon Mmabatho', 'hair salon Mmabatho'],
      },
      {
        slug: 'mahikeng',
        name: 'Mahikeng',
        province: 'North West',
        description: 'Find salons in Mahikeng. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Mahikeng', 'braids Mahikeng', 'hair salon Mahikeng'],
      },
      {
        slug: 'ikageng',
        name: 'Ikageng',
        province: 'North West',
        description: 'Discover salons in Ikageng. Book hair braiding, salons, and beauty services.',
        keywords: ['braids Ikageng', 'salon Ikageng', 'hair salon Ikageng'],
      },
      {
        slug: 'jouberton',
        name: 'Jouberton',
        province: 'North West',
        description: 'Find salons in Jouberton. Book hair braiding, salons, and beauty services.',
        keywords: ['salon Jouberton', 'braids Jouberton', 'hair salon Jouberton'],
      },
      {
        slug: 'brits',
        name: 'Brits',
        province: 'North West',
        description: 'Discover salons in Brits. Book hair salons and beauty services.',
        keywords: ['hair salon Brits', 'salon Brits', 'beauty Brits'],
      },
      {
        slug: 'sun-city',
        name: 'Sun City',
        province: 'North West',
        description: 'Find luxury spas at Sun City. Book premium spa and beauty services.',
        keywords: ['spa Sun City', 'luxury spa Sun City', 'beauty Sun City'],
      },
    ],
  },
  'northern-cape': {
    slug: 'northern-cape',
    name: 'Northern Cape',
    description: 'Discover beauty services in the Northern Cape. Book appointments in Kimberley, Upington, and surrounding areas.',
    keywords: ['Northern Cape salons', 'Kimberley hair salon', 'Upington beauty salon', 'Northern Cape spa'],
    cities: [
      {
        slug: 'kimberley',
        name: 'Kimberley',
        province: 'Northern Cape',
        description: 'Find top salons in Kimberley. Book at hair salons, nail studios, and spas in the Diamond City.',
        keywords: ['hair salon Kimberley', 'nail salon Kimberley', 'beauty salon Kimberley'],
      },
      {
        slug: 'upington',
        name: 'Upington',
        province: 'Northern Cape',
        description: 'Discover salons in Upington. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Upington', 'beauty salon Upington'],
      },
    ],
  },
};

// Helper function to get all cities across all provinces
export function getAllCities(): CityInfo[] {
  return Object.values(PROVINCES).flatMap(province => province.cities);
}

// Helper function to get cities by province slug
export function getCitiesByProvince(provinceSlug: string): CityInfo[] {
  return PROVINCES[provinceSlug]?.cities || [];
}

// Helper function to get city info
export function getCityInfo(provinceSlug: string, citySlug: string): CityInfo | null {
  const province = PROVINCES[provinceSlug];
  if (!province) return null;

  return province.cities.find(city => city.slug === citySlug) || null;
}

// Helper function to get province info
export function getProvinceInfo(provinceSlug: string): ProvinceInfo | null {
  return PROVINCES[provinceSlug] || null;
}

// Generate URL-friendly slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
