
const fs = require('fs');
const path = require('path');

// 1. Backend Data (Copied from backend/src/locations/locations.data.ts to avoid import issues)
const locationsData = {
    'KwaZulu-Natal': [
        'DannhauserekuPhakameni', 'Bulwer', 'Ballito', 'Amahlongwa', 'Balgowan', 'Hluhluwe', 'Dundee', 'Bergville', 'Babanango', 'Hattingspruit', 'Adams Mission', 'Franklin', 'Groutville', 'Amandawe', 'Boston', 'Ingwavuma', 'Glencoe', 'Colenso', 'Louwsburg', 'Madadeni', 'Amanzimtoti (eManzimtoti)', 'Himeville', 'Shakaskraal', 'Anerley', 'Hilton', 'Mkuze', 'Greytown', 'Elandslaagte', 'Mahlabatini', 'Newcastle', 'Assagay', 'Stuartstown (Ixopo)', 'Stanger (KwaDukuza)', 'Bazley Beach', 'Howick', 'Mtubatuba', 'Kranskop', 'Estcourt', 'Nongoma', 'Mountain View (Osizweni)', "Botha's Hill", 'Kokstad', 'Salt Rock', 'Dududu', 'Merrivale', 'Ubombo', 'Pomeroy', 'Ladysmith', 'Paulpietersburg', 'Charlestown', 'Cato Ridge', 'Umzimkulu', 'Mandeni', 'Gamalakhe', 'Mooi River', 'Jozini', 'Wasbank', 'Pongola', 'Ngagane', 'Chatsworth', 'Underberg', 'Maphumulo', 'Harding', 'New Hanover', 'Mbazwana', 'Nquthu', 'Ulundi', 'Emadlangeni', 'Clermont', 'Umhlali', 'Hibberdene', 'Pietermaritzburg', 'Kosi Bay town (Manguzi)', 'Vryheid', 'Kingsley', 'Durban', 'Ifafa Beach', 'Richmond', 'Gillitts', 'Izingolweni (eZinqoleni)', 'Wartburg', 'Hillcrest', 'Izotsha', 'Dalton', 'Inanda', 'Kelso', 'Inchanga', 'Leisure Bay', 'Isipingo', 'KwaCele', 'Kingsburgh', 'Manaba Beach', 'Kloof', 'Margate', 'KwaMakhutha', 'Marina Beach', 'KwaMashu', 'Melville', 'La Mercy', 'Umtalumi (Mthwalume)', 'Mpumalanga', 'Umzumbe', 'New Germany', 'Munster', 'Ntuzuma', 'Oshabeni (oShabeni)', 'Tongaat (oThongathi)', 'Palm Beach', 'Pinetown', 'Park Rynie', 'Phoenix', 'Pennington', 'Prospecton', 'Port Edward', 'Queensburgh', 'Port Shepstone', 'Shallcross', 'Ramsgate', 'Umbumbulu', 'Scottburgh', 'Umdloti (eMdloti)', 'Sea Park', 'Umgababa', 'Sezela', 'Umhlanga (uMhlanga)', 'Shelly Beach', 'Umkomaas (eMkhomazi)', 'Southbroom', 'Umlazi', 'Southport', 'Verulam', 'Sunwich Port', 'Waterfall', 'Trafalgar', 'Westville', 'Umtentweni (eMthenteni)', 'Umzinto', 'Uvongo', 'Weza'
    ],
    'Western Cape': [
        'Atlantis', 'Milnerton', 'Aurora', 'Ashton', 'Arniston', 'Avontuur', 'Montagu', 'Beaufort West', 'Bellville', "Mitchell's Plain", 'Bitterfontein', 'Bonnievale', 'Baardskeerdersbos', 'Albertinia', 'Barrydale', 'Laingsburg', 'Blouberg', 'Muizenberg', 'Chatsworth', 'Ceres', "Betty's Bay", 'Amaliënstein', 'Ladismith', 'Leeu-Gamka', 'Blue Downs', 'Noordhoek', 'Citrusdal', 'De Doorns', 'Birkenhead', 'Bergplaas', 'Calitzdorp', 'Matjiesfontein', 'Bothasig', 'Nyanga', 'Clanwilliam', 'De Hollandsche Molen', 'Botrivier', 'Boggomsbaai', 'Oudtshoorn', 'Merweville', 'Brackenfell', 'Parow', 'Darling', 'Denneburg', 'Bredasdorp', 'Bracken Hill', 'De Rust', 'Murraysburg', 'Cape Town', 'Philadelphia', 'Doringbaai', 'Franschhoek', 'Caledon', 'Brandwag', 'Nelspoort', 'Crossroads', "Simon's Town", 'Dwarskersbos', 'Gouda', 'Dennehof', 'Brenton-on-Sea', 'Prince Albert', 'Delft', 'Somerset West', 'Ebenhaeser', 'Kayamandi', 'Elgin', 'Eerste River', 'Elands Bay', 'Klapmuts', 'Elim', 'Dana Baai', "Elsie's River", 'Goedverwacht', 'Languedoc', 'Fisherhaven', 'De Hoop', 'Fish Hoek', 'Graafwater', 'McGregor', 'Franskraalstrand', 'De Vlugt', 'Goodwood', 'Grotto Bay', 'Gansbaai', 'Dysselsdorp', "Gordon's Bay", 'Hopefield', 'Op-die-Berg', 'Genadendal', 'Farleigh', 'Guguletu', 'Jacobsbaai', 'Paarl', 'Grabouw', 'Friemersheim', 'Hout Bay', 'Jakkalsfontein', 'Pniel', 'Greyton', 'George', 'Khayelitsha', 'Kalbaskraal', 'Prince Alfred Hamlet', 'Hawston', 'Glentana', 'Kraaifontein', 'Klawer', 'Rawsonville', 'Hermanus', 'Gouna', 'Kuils River', 'Koekenaap', 'Robertson', 'Hotagterklip', 'Gouritsmond', 'Langa', 'Koringberg', 'Robertsvlei', 'Infanta', 'Great Brak River', 'Macassar', "Lamber's Bay", 'Rozendal', 'Kleinbaai', 'Groot-Jongensfontein', 'Melkbosstrand', 'Langebaan', 'Saron', 'Kleinmond', 'Haarlem', 'Mfuleni', 'Langebaanweg', 'Stellenbosch', 'Klipdale', 'Hartenbos', 'Moorreesburg', 'Tulbagh', "L'Agulhas", 'Heidelberg', 'Paternoster', 'Wellington', 'Onrusrivier', 'Herbertsdale', 'Piketberg', 'Wolseley', 'Papiesvlei', 'Herold', 'Porterville', 'Worcester', 'Pearly Beach', 'Hoekwil', 'Redelinghuys', 'Riviersonderend', 'Jonkersberg', 'Riebeek-Kasteel', 'Rooi Els', 'Karatara', 'Riebeek West', 'Sandbaai', 'Keurboomsrivier', 'Saldanha', 'Skipskop', 'Keurboomstrand', 'St Helena Bay', 'Stanford', 'Knysna', 'Strandfontein', 'Struisbaai', 'Kranshoek', 'Vanrhynsdorp', 'Suiderstrand', 'Kurland Estate', 'Velddrif', 'Suurbraak', 'Little Brak River', 'Vredenburg', 'Swellendam', 'Matjiesrivier', 'Vredendal', 'Uilenkraalsmond', 'Mossel Bay', 'Wupperthal', 'Van Dyksbaai', "Nature's Valley", 'Yzerfontein', 'Vermont', 'Noetzie', 'Villiersdorp', 'Pacaltsdorp', 'Wolvengat', 'Plettenberg Bay', 'Port Beaufort', 'Puntjie', 'Rheenendal', 'Riversdale', 'Ruiterbos', 'Schoemanshoek', 'Sedgefield', 'Slangrivier', 'Stilbaai', 'Touwsranten', 'Twee Rivieren', 'Uniondale', 'Vanwyksdorp', 'Vermaaklikheid', 'Volmoed', 'Victoria Bay', 'Vleesbaai', 'Wilderness', 'Wittedrift', 'Witsand', 'Woodville', 'Zoar'
    ],
    'Gauteng': [
        'Alexandra', 'Alberton', 'Atteridgeville', 'Boipatong', 'Meyerton', 'Devon', 'Carletonville', 'Hekpoort', 'Bhongweni', 'Bekkersdal', 'Diepsloot', 'Bedfordview', 'Bronberg', 'Bophelong', 'Randvaal', 'Heidelberg', 'Khutsong', 'Kagiso', 'Brandvlei', 'Westonaria', 'Ennerdale', 'Benoni', 'Bronkhorstspruit', 'Evaton', 'Walkerville', 'Impumelelo', 'Fochville', 'Kromdraai', 'Mohlakeng', 'Simunye, Westonaria', 'Johannesburg', 'Boksburg', 'Centurion', 'Sebokeng', 'Ratanda', 'Kokosi', 'Krugersdorp', 'Panvlak Gold Mine', 'Borwa, Westonaria', 'Lenz (Lenasia)', 'Brakpan', 'Cullinan', 'Sharpeville', 'Greenspark', 'Magaliesburg', 'Randfontein', 'Modderfontein', 'Bapsfontein', 'Ekangala', 'Vanderbijlpark', 'Wedela', 'Muldersdrift', 'Toekomsrus', 'Orange Farm', 'Clayville', 'Ga-Rankuwa', 'Vereeniging', 'Welverdiend', 'Munsieville', 'Zenzele', 'Randburg', 'Daveyton', 'Hammanskraal', 'Blybank', 'Rietvallei', 'Roodepoort', 'Duduza', 'Irene', 'Silverfields', 'Sandton', 'Edenvale', 'Mabopane', 'Tarlton', 'Soweto', 'Holfontein', 'Mamelodi', 'Germiston', 'Pretoria', 'Isando', 'Rayton', 'Katlehong', 'Refilwe', 'Kempton Park', 'Soshanguve', 'KwaThema', 'Winterveld', 'Dunnottar', 'Zithobeni', 'Nigel', 'Reiger Park', 'Springs', 'Tembisa', 'Tokoza', 'Tsakane', 'Vosloorus', 'Wattville', 'Luweero'
    ],
    'Mpumalanga': [
        'Barberton', 'Belfast', 'Bethal', 'Breyten', 'Bushbuckridge', 'Carolina', 'Delmas', 'Dullstroom', 'Eerstehoek', 'Elukwatini', 'Emalahleni (Witbank)', 'Ermelo', 'Graskop', 'Hazyview', 'Hendrina', 'Komatipoort', 'Kriel', 'Lydenburg', 'Machadodorp', 'Malelane', 'Middleburg', 'Nelspruit (Mbombela)', 'Ohrigstad', 'Piet Retief', "Pilgrim's Rest", 'Sabie', 'Secunda', 'Standerton', 'Thulamahashe', 'Volksrust', 'Wakkerstroom', 'White River'
    ],
    'Limpopo': [
        'Alldays', 'Bela-Bela (Warmbaths)', 'Burgersfort', 'Dendron', 'Duiwelskloof (Modjadjiskloof)', 'Ellisras (Lephalale)', 'Giyani', 'Groblersdal', 'Hoedspruit', 'Jane Furse', 'Lebowakgomo', 'Lephalale', 'Louis Trichardt (Makhado)', 'Marble Hall', 'Messina (Musina)', 'Modimolle (Nylstroom)', 'Mokopane (Potgietersrus)', 'Mookgophong', 'Musina', 'Phalaborwa', 'Polokwane (Pietersburg)', 'Seshego', 'Thabazimbi', 'Thohoyandou', 'Tlakgameng', 'Tzaneen', 'Vaalwater', 'Vivo', 'Warmbaths'
    ],
    'North West': [
        'Bloemhof', 'Brits', 'Christiana', 'Coligny', 'Delareyville', 'Ga-Rankuwa', 'Ganyesa', 'Groot Marico', 'Hartbeesfontein', 'Koster', 'Klerksdorp', 'Lichtenburg', 'Mafikeng (Mmabatho)', 'Mahikeng', 'Makwassie', 'Mooinooi', 'Orkney', 'Ottosdal', 'Parys', 'Potchefstroom', 'Rustenburg', 'Schweizer-Reneke', 'Stilfontein', 'Sun City', 'Taung', 'Ventersdorp', 'Vryburg', 'Wolmaransstad', 'Zeerust'
    ],
    'Free State': [
        'Bethlehem', 'Bloemfontein', 'Botshabelo', 'Bothaville', 'Brandfort', 'Clarens', 'Clocolan', 'Dealesville', 'Deneysville', 'Ficksburg', 'Fouriesburg', 'Frankfort', 'Harrismith', 'Heilbron', 'Hennenman', 'Hoopstad', 'Koffiefontein', 'Kroonstad', 'Ladybrand', 'Lindley', 'Marquard', 'Odendaalsrus', 'Oranjeville', 'Parys', 'Phuthaditjhaba', 'Reitz', 'Rosendal', 'Sasolburg', 'Senekal', 'Smithfield', 'Thaba Nchu', 'Theunissen', 'Trompsburg', 'Viljoenskroon', 'Virginia', 'Vrede', 'Vredefort', 'Welkom', 'Wesselsbron', 'Winburg'
    ],
    'Eastern Cape': [
        'Adelaide', 'Addo', 'Albany', 'Alexandria', 'Aliwal North', 'Bathurst', 'Bedford', 'Berlin', 'Bisho', 'Butterworth', 'Cathcart', 'Cintsa', 'Cradock', 'Despatch', 'Dutywa', 'East London', 'Elliot', 'Fort Beaufort', 'Gonubie', 'Graaff-Reinet', 'Grahamstown (Makhanda)', 'Hamburg', 'Hankey', 'Hofmeyr', 'Humansdorp', 'Jeffreys Bay', 'Joubertina', 'Kareedouw', "King William's Town", 'Kirkwood', 'Komga', 'Kenton-on-Sea', 'Lady Frere', 'Lady Grey', 'Libode', 'Lusikisiki', 'Maclear', 'Makhanda (Grahamstown)', 'Mdantsane', 'Middelburg', 'Mthatha (Umtata)', 'Ngcobo', 'Noupoort', 'Oyster Bay', 'Paterson', 'Patensie', 'Port Alfred', 'Port Elizabeth (Gqeberha)', 'Port St Johns', 'Queenstown', 'Rhodes', 'Somerset East', 'St Francis Bay', 'Steynsburg', 'Steytlerville', 'Stutterheim', 'Tarkastad', 'Tsolo', 'Uitenhage', 'Whittlesea', 'Willowmore'
    ],
    'Northern Cape': [
        'Alexander Bay', 'Barkly West', 'Britstown', 'Calvinia', 'Campbell', 'Carnarvon', 'Colesberg', 'Danielskuil', 'De Aar', 'Douglas', 'Griekwastad', 'Groblershoop', 'Hanover', 'Hopetown', 'Hotazel', 'Kakamas', 'Kathu', 'Keimoes', 'Kenhardt', 'Kimberley', 'Kuruman', 'Lime Acres', 'Marydale', 'Orania', 'Pofadder', 'Port Nolloth', 'Postmasburg', 'Prieska', 'Richmond', 'Springbok', 'Strydenburg', 'Sutherland', 'Upington', 'Victoria West', 'Vryburg', 'Warrenton', 'Williston'
    ]
};

// 2. Pre-canned rich descriptions for major locations (to preserve existing quality)
const PROVINCE_DESCRIPTIONS = {
    'Gauteng': 'Find top-rated salons, spas, and hair professionals in Gauteng. Book appointments at the best hair salons, nail studios, and wellness centers in Johannesburg, Pretoria, and Sandton.',
    'Western Cape': 'Discover premium salons in the Western Cape. From Cape Town to the Garden Route, find and book the best hair, beauty, and spa services near you.',
    'KwaZulu-Natal': 'Find top-rated salons and spas in KwaZulu-Natal. Book appointments at the best hair salons, nail studios, and wellness centers in Durban, Pietermaritzburg, and Ballito.',
    'North West': 'Find top-rated salons and spas in North West. Book appointments at the best hair salons, nail studios, and wellness centers in Rustenburg, Potchefstroom, and Mahikeng.',
    'Eastern Cape': 'Discover beauty services in Eastern Cape. Find salons in Port Elizabeth, East London, and Mthatha.',
    'Free State': 'Find top salons in the Free State. Book appointments in Bloemfontein, Welkom, and Sasolburg.',
    'Mpumalanga': 'Explore beauty services in Mpumalanga. Find salons in Nelspruit, Witbank, and Secunda.',
    'Limpopo': 'Discover salons in Limpopo. Book appointments in Polokwane, Tzaneen, and Thohoyandou.',
    'Northern Cape': 'Find beauty services in Northern Cape. Book salons in Kimberley, Upington, and Springbok.'
};

const CITY_DESCRIPTIONS = {
    // Gauteng
    'Johannesburg': 'Find the best salons in Johannesburg. From Sandton to Soweto, book top-rated hair and beauty professionals.',
    'Pretoria': 'Find expert hair and beauty services in Pretoria. Book top-rated salons in Tshwane, Menlyn, and Centurion.',
    'Sandton': 'Discover luxury salons in Sandton. Book premium hair and beauty services in Sandton City and surrounds.',

    // Western Cape
    'Cape Town': 'Discover salons in Cape Town. Book hair salons, nail studios, and beauty services in the Mother City.',
    'Stellenbosch': 'Find top salons in Stellenbosch. Book hair and beauty services in the Winelands.',

    // KZN
    'Durban': 'Discover salons in Durban. Book hair salons, nail studios, and beauty services in eThekwini.',
    'Umhlanga (uMhlanga)': 'Find luxury salons and spas in Umhlanga. Book premium treatments in Umhlanga Rocks.',
    'Ballito': 'Discover beauty services in Ballito. Book hair and spa treatments on the Dolphin Coast.',
    'Pietermaritzburg': 'Find top-rated salons in Pietermaritzburg. Book hair and beauty services in the Midlands currently.',

    // Defaults for others will be generated
};

function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateLocationData() {
    const provinces = {};

    for (const [provinceName, cities] of Object.entries(locationsData)) {
        const provinceSlug = generateSlug(provinceName);

        // Process Cities
        const processedCities = cities.map(cityRaw => {
            // Handle names with brackets: e.g. "Amanzimtoti (eManzimtoti)"
            let cityName = cityRaw;
            if (cityRaw.includes('(')) {
                cityName = cityRaw.split('(')[0].trim();
            }

            const citySlug = generateSlug(cityName);

            // Description
            let description = CITY_DESCRIPTIONS[cityRaw] || "";
            if (!description) {
                description = `Discover salons in ${cityName}. Book hair salons, nail studios, and beauty services in ${cityName}, ${provinceName}.`;
            }

            return {
                slug: citySlug,
                name: cityName,
                province: provinceName,
                description: description,
                metaTitle: `${cityName} Salons & Spas | Book Online | Stylr SA`,
                metaDescription: `Find and book top-rated salons in ${cityName}, ${provinceName}. Compare prices, read reviews, and book hair, nail, and beauty appointments online.`,
                keywords: [`${cityName} salons`, `${cityName} hair salon`, `beauty salon ${cityName}`, `nails ${cityName}`]
            };
        });

        // Sort cities by name
        processedCities.sort((a, b) => a.name.localeCompare(b.name));

        provinces[provinceSlug] = {
            slug: provinceSlug,
            name: provinceName,
            description: PROVINCE_DESCRIPTIONS[provinceName] || `Find salons in ${provinceName}.`,
            metaTitle: `${provinceName} Salons & Spas | Book Online | Stylr SA`,
            metaDescription: `Find top-rated salons in ${provinceName}. Book hair, nail, and beauty appointments at the best salons in ${provinceName}.`,
            keywords: [`${provinceName} salons`, `${provinceName} hair salons`],
            cities: processedCities
        };
    }

    // Output File Content
    const fileContent = `
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

export interface LocationData {
  [key: string]: Province;
}

export const locationData: LocationData = ${JSON.stringify(provinces, null, 2)};
  `.trim();

    const outputPath = path.join(__dirname, '../src/lib/locationData.ts');
    fs.writeFileSync(outputPath, fileContent);
    console.log(`✅ Generated locationData.ts with ${Object.keys(provinces).length} provinces and ${Object.values(provinces).reduce((acc, p) => acc + p.cities.length, 0)} locations.`);
}

generateLocationData();
