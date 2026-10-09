/**
 * Postal Codes & Branch Geocoding Data for Jasman Automotriz
 * Supports all 71 Jasman branches nationwide + postal code lookup for Mexico (CDMX and national)
 */

import { sucursales } from './sucursalesData.js';

// Exact coordinates for all 71 branches
export const branchCoordinates = {
  // Norte
  'alamedas-2': { lat: 19.5580, lng: -99.2490 },
  'alamedas': { lat: 19.5512, lng: -99.2435 },
  'azcapotzalco': { lat: 19.4913, lng: -99.1985 },
  'azcapotzalco-2': { lat: 19.4795, lng: -99.1912 },
  'cuautitlan': { lat: 19.6690, lng: -99.1870 },
  'lomas-verdes': { lat: 19.5085, lng: -99.2555 },
  'naucalpan': { lat: 19.4760, lng: -99.2390 },
  'pachuca': { lat: 20.1085, lng: -98.7560 },
  'tlalnepantla': { lat: 19.5385, lng: -99.2135 },
  'vallejo': { lat: 19.4715, lng: -99.1470 },

  // Poniente
  'santa-fe': { lat: 19.3780, lng: -99.2515 },
  'mariano-escobedo': { lat: 19.4525, lng: -99.1795 },
  'interlomas': { lat: 19.4015, lng: -99.2785 },
  'yucatan': { lat: 19.4165, lng: -99.1635 },
  'polanco': { lat: 19.4310, lng: -99.1835 },
  'toluca-1': { lat: 19.3090, lng: -99.6450 },
  'toluca-centro': { lat: 19.2815, lng: -99.6540 },

  // Sur
  'chabacano': { lat: 19.4075, lng: -99.1345 },
  'revolucion': { lat: 19.3515, lng: -99.1910 },
  'ajusco': { lat: 19.2890, lng: -99.2170 },
  'vertiz': { lat: 19.3840, lng: -99.1535 },
  'san-jeronimo': { lat: 19.3295, lng: -99.2105 },
  'portales': { lat: 19.3710, lng: -99.1455 },
  'miramontes': { lat: 19.3140, lng: -99.1305 },
  'av-toluca': { lat: 19.3365, lng: -99.2270 },

  // Oriente
  'cuautla': { lat: 18.8150, lng: -98.9560 },
  'aeropuerto': { lat: 19.4320, lng: -99.0910 },
  'texcoco-allende': { lat: 19.5140, lng: -98.8820 },
  'texcoco': { lat: 19.5090, lng: -98.8790 },
  'central-de-abastos': { lat: 19.3725, lng: -99.0915 },
  'iztapalapa': { lat: 19.3530, lng: -99.0620 },
  'iztacalco': { lat: 19.3980, lng: -99.1025 },
  'nezahualcoyotl': { lat: 19.4010, lng: -99.0180 },
  'los-reyes': { lat: 19.3615, lng: -98.9760 },
  'chalco': { lat: 19.2610, lng: -98.8980 },
  'aragon': { lat: 19.4750, lng: -99.0520 },

  // Bajío
  'salamanca': { lat: 20.5720, lng: -101.1960 },
  'guanajuato': { lat: 21.0110, lng: -101.2650 },
  'torres-landa': { lat: 21.1090, lng: -101.6910 },
  'morelos': { lat: 21.1160, lng: -101.6420 },
  'hidalgo': { lat: 21.1390, lng: -101.6850 },
  'irapuato': { lat: 20.6780, lng: -101.3520 },

  // Guadalajara
  'country-guadalajara': { lat: 20.7020, lng: -103.3680 },
  'tepic': { lat: 21.4920, lng: -104.8970 },
  'revolucion-guadalajara': { lat: 20.6480, lng: -103.3090 },
  'patria': { lat: 20.6690, lng: -103.4210 },
  'gonzalez-gallo': { lat: 20.6510, lng: -103.3320 },
  'javier-mina': { lat: 20.6695, lng: -103.3210 },
  'americas': { lat: 20.6870, lng: -103.3740 },
  'la-paz': { lat: 20.6720, lng: -103.3610 },
  'providencia': { lat: 20.6980, lng: -103.3850 },

  // Monterrey
  'nuevo-laredo': { lat: 27.4890, lng: -99.5120 },
  'valle': { lat: 25.6560, lng: -100.3750 },
  'primavera': { lat: 25.6710, lng: -100.2410 },
  'linda-vista': { lat: 25.6980, lng: -100.2620 },
  'abastos': { lat: 25.7190, lng: -100.3010 },
  'san-nicolas': { lat: 25.7480, lng: -100.2920 },
  'chapultepec': { lat: 25.6620, lng: -100.2850 },
  'universidad': { lat: 25.7250, lng: -100.3150 },
  'lincoln': { lat: 25.7310, lng: -100.3790 },

  // Querétaro
  'queretaro': { lat: 20.5890, lng: -100.4050 },
  'constituyentes': { lat: 20.5810, lng: -100.3950 },
  'americas-qro': { lat: 20.5910, lng: -100.3720 },
  'mega-estadio': { lat: 20.5750, lng: -100.3650 },
  'juriquilla': { lat: 20.6890, lng: -100.4410 },
  'san-juan-del-rio': { lat: 20.3870, lng: -99.9920 },
  'celaya': { lat: 20.5280, lng: -100.8120 },

  // Michoacán
  'camelinas': { lat: 19.6820, lng: -101.1620 },
  'huertas': { lat: 19.6910, lng: -101.2180 },
  'los-reyes-michoacan': { lat: 19.5870, lng: -102.4720 },
  'zamora-juarez': { lat: 19.9850, lng: -102.2810 },
};

// Enriched sucursales with lat and lng
export const sucursalesWithCoords = sucursales.map(s => {
  const coords = branchCoordinates[s.id] || { lat: 19.4326, lng: -99.1332 };
  return {
    ...s,
    lat: coords.lat,
    lng: coords.lng,
  };
});

// Centroids for Mexican postal code ranges (SEPOMEX)
// Covers all CDMX alcaldías (01xxx - 16xxx), EdoMéx (52xxx - 57xxx), and other key states
export const postalCodeCentroids = {
  // CDMX Alcaldías
  '01': { name: 'Álvaro Obregón, CDMX', lat: 19.3588, lng: -99.2122 },
  '02': { name: 'Azcapotzalco, CDMX', lat: 19.4913, lng: -99.1823 },
  '03': { name: 'Benito Juárez, CDMX', lat: 19.3718, lng: -99.1571 },
  '04': { name: 'Coyoacán, CDMX', lat: 19.3437, lng: -99.1562 },
  '05': { name: 'Cuajimalpa de Morelos, CDMX', lat: 19.3590, lng: -99.2920 },
  '06': { name: 'Cuauhtémoc, CDMX', lat: 19.4285, lng: -99.1550 },
  '07': { name: 'Gustavo A. Madero, CDMX', lat: 19.4917, lng: -99.1168 },
  '08': { name: 'Iztacalco, CDMX', lat: 19.3961, lng: -99.1004 },
  '09': { name: 'Iztapalapa, CDMX', lat: 19.3548, lng: -99.0728 },
  '10': { name: 'La Magdalena Contreras, CDMX', lat: 19.3080, lng: -99.2340 },
  '11': { name: 'Miguel Hidalgo, CDMX', lat: 19.4326, lng: -99.1920 },
  '12': { name: 'Milpa Alta, CDMX', lat: 19.1920, lng: -99.0230 },
  '13': { name: 'Tláhuac, CDMX', lat: 19.2730, lng: -99.0040 },
  '14': { name: 'Tlalpan, CDMX', lat: 19.2843, lng: -99.1682 },
  '15': { name: 'Venustiano Carranza, CDMX', lat: 19.4395, lng: -99.1068 },
  '16': { name: 'Xochimilco, CDMX', lat: 19.2570, lng: -99.1030 },

  // Edo. de México (Zona Metropolitana y Valle de Toluca)
  '50': { name: 'Toluca / Metepec, Edo. Méx.', lat: 19.2826, lng: -99.6557 },
  '52': { name: 'Huixquilucan / Atizapán, Edo. Méx.', lat: 19.4015, lng: -99.2785 },
  '53': { name: 'Naucalpan de Juárez, Edo. Méx.', lat: 19.4784, lng: -99.2400 },
  '54': { name: 'Tlalnepantla / Cuautitlán, Edo. Méx.', lat: 19.5381, lng: -99.1996 },
  '55': { name: 'Ecatepec de Morelos, Edo. Méx.', lat: 19.6097, lng: -99.0599 },
  '56': { name: 'Texcoco / Los Reyes / Chalco, Edo. Méx.', lat: 19.4500, lng: -98.9200 },
  '57': { name: 'Nezahualcóyotl, Edo. Méx.', lat: 19.4006, lng: -98.9884 },

  // Querétaro
  '76': { name: 'Santiago de Querétaro, Qro.', lat: 20.5888, lng: -100.3899 },

  // Guanajuato
  '36': { name: 'Irapuato / Salamanca / Guanajuato, Gto.', lat: 20.6736, lng: -101.3497 },
  '37': { name: 'León de los Aldama, Gto.', lat: 21.1221, lng: -101.6837 },
  '38': { name: 'Celaya, Gto.', lat: 20.5233, lng: -100.8157 },

  // Jalisco
  '44': { name: 'Guadalajara Centro / Oriente, Jal.', lat: 20.6720, lng: -103.3525 },
  '45': { name: 'Zapopan / Guadalajara Poniente, Jal.', lat: 20.7214, lng: -103.3919 },

  // Nuevo León
  '64': { name: 'Monterrey Centro, N.L.', lat: 25.6866, lng: -100.3161 },
  '65': { name: 'Monterrey Norte, N.L.', lat: 25.7200, lng: -100.3100 },
  '66': { name: 'San Pedro Garza García / San Nicolás, N.L.', lat: 25.6577, lng: -100.4031 },
  '67': { name: 'Guadalupe, N.L.', lat: 25.6768, lng: -100.2560 },

  // Michoacán
  '58': { name: 'Morelia, Mich.', lat: 19.7060, lng: -101.1950 },
  '59': { name: 'Zamora, Mich.', lat: 19.9862, lng: -102.2833 },
  '60': { name: 'Los Reyes / Uruapan, Mich.', lat: 19.5849, lng: -102.4762 },

  // Morelos
  '62': { name: 'Cuautla / Cuernavaca, Mor.', lat: 18.8107, lng: -98.9543 },

  // Hidalgo
  '42': { name: 'Pachuca de Soto, Hgo.', lat: 20.0911, lng: -98.7624 },

  // Tamaulipas
  '88': { name: 'Nuevo Laredo, Tamps.', lat: 27.4763, lng: -99.5066 },

  // Nayarit
  '63': { name: 'Tepic, Nay.', lat: 21.5049, lng: -104.8946 },
};

// Specific exact postal codes for high-density colonies
export const specificPostalCodes = {
  // Benito Juárez
  '03100': { name: 'Col. Del Valle Norte, Benito Juárez, CDMX', lat: 19.3860, lng: -99.1670 },
  '03200': { name: 'Col. Del Valle Sur, Benito Juárez, CDMX', lat: 19.3690, lng: -99.1720 },
  '03300': { name: 'Col. Portales Norte, Benito Juárez, CDMX', lat: 19.3710, lng: -99.1455 },
  '03600': { name: 'Col. Narvarte Poniente, Benito Juárez, CDMX', lat: 19.3840, lng: -99.1535 },
  '03810': { name: 'Col. Nápoles, Benito Juárez, CDMX', lat: 19.3920, lng: -99.1770 },

  // Cuauhtémoc
  '06000': { name: 'Col. Centro, Cuauhtémoc, CDMX', lat: 19.4326, lng: -99.1332 },
  '06700': { name: 'Col. Roma Norte, Cuauhtémoc, CDMX', lat: 19.4180, lng: -99.1620 },
  '06720': { name: 'Col. Roma Sur, Cuauhtémoc, CDMX', lat: 19.4080, lng: -99.1610 },
  '06100': { name: 'Col. Condesa, Cuauhtémoc, CDMX', lat: 19.4120, lng: -99.1730 },
  '06850': { name: 'Col. Asturias / Chabacano, Cuauhtémoc, CDMX', lat: 19.4075, lng: -99.1345 },

  // Miguel Hidalgo
  '11000': { name: 'Col. Lomas de Chapultepec, Miguel Hidalgo, CDMX', lat: 19.4210, lng: -99.2130 },
  '11580': { name: 'Col. Rincón del Bosque / Polanco, Miguel Hidalgo, CDMX', lat: 19.4310, lng: -99.1835 },
  '11400': { name: 'Col. Popotla / Mariano Escobedo, Miguel Hidalgo, CDMX', lat: 19.4525, lng: -99.1795 },
  '11800': { name: 'Col. San Miguel Chapultepec, Miguel Hidalgo, CDMX', lat: 19.4110, lng: -99.1890 },

  // Azcapotzalco
  '02710': { name: 'Col. San Pedro Xalpa, Azcapotzalco, CDMX', lat: 19.4913, lng: -99.1985 },
  '02460': { name: 'Col. La Preciosa / Aquiles Serdán, Azcapotzalco, CDMX', lat: 19.4795, lng: -99.1912 },
  '02000': { name: 'Col. Azcapotzalco Centro, Azcapotzalco, CDMX', lat: 19.4830, lng: -99.1850 },

  // Álvaro Obregón
  '01000': { name: 'Col. San Ángel Inn / Revolución, Álvaro Obregón, CDMX', lat: 19.3515, lng: -99.1910 },
  '01090': { name: 'Col. La Otra Banda / San Jerónimo, Álvaro Obregón, CDMX', lat: 19.3295, lng: -99.2105 },
  '01330': { name: 'Col. Santa Fe / Paseo de las Lomas, Álvaro Obregón, CDMX', lat: 19.3780, lng: -99.2515 },
  '01780': { name: 'Col. Olivar de los Padres / Av. Toluca, Álvaro Obregón, CDMX', lat: 19.3365, lng: -99.2270 },

  // Coyoacán
  '04000': { name: 'Col. Coyoacán Centro, Coyoacán, CDMX', lat: 19.3490, lng: -99.1620 },
  '04890': { name: 'Col. Jardines de Coyoacán / Miramontes, Coyoacán, CDMX', lat: 19.3140, lng: -99.1305 },
  '04700': { name: 'Col. Insurgentes Cuicuilco, Coyoacán, CDMX', lat: 19.3050, lng: -99.1820 },

  // Tlalpan
  '14200': { name: 'Col. Héroes de Padierna / Ajusco, Tlalpan, CDMX', lat: 19.2890, lng: -99.2170 },
  '14000': { name: 'Col. Tlalpan Centro, Tlalpan, CDMX', lat: 19.2880, lng: -99.1680 },

  // Gustavo A. Madero
  '02600': { name: 'Col. Defensores de la República / Vallejo, GAM, CDMX', lat: 19.4715, lng: -99.1470 },
  '07000': { name: 'Col. Villa Gustavo A. Madero, GAM, CDMX', lat: 19.4880, lng: -99.1150 },
  '07300': { name: 'Col. Lindavista, GAM, CDMX', lat: 19.4890, lng: -99.1290 },

  // Iztapalapa & Iztacalco & Venustiano Carranza
  '08400': { name: 'Col. Granjas México / Iztacalco, CDMX', lat: 19.3980, lng: -99.1025 },
  '09310': { name: 'Col. Central de Abastos, Iztapalapa, CDMX', lat: 19.3725, lng: -99.0915 },
  '09700': { name: 'Col. Santa Cruz Meyehualco, Iztapalapa, CDMX', lat: 19.3530, lng: -99.0620 },
  '15530': { name: 'Col. Moctezuma 2da Sección / Aeropuerto, VC, CDMX', lat: 19.4320, lng: -99.0910 },

  // Edo. Méx
  '52760': { name: 'Interlomas / Huixquilucan, Edo. Méx.', lat: 19.4015, lng: -99.2785 },
  '52970': { name: 'Fracc. Las Alamedas, Atizapán, Edo. Méx.', lat: 19.5512, lng: -99.2435 },
  '52978': { name: 'Jardines de Atizapán, Atizapán, Edo. Méx.', lat: 19.5580, lng: -99.2490 },
  '53120': { name: 'Col. Lomas Verdes, Naucalpan, Edo. Méx.', lat: 19.5085, lng: -99.2555 },
  '53279': { name: 'Bosques de Moctezuma, Naucalpan, Edo. Méx.', lat: 19.4760, lng: -99.2390 },
  '54060': { name: 'Viveros de la Hacienda, Tlalnepantla, Edo. Méx.', lat: 19.5385, lng: -99.2135 },
  '54800': { name: 'Col. Lázaro Cárdenas, Cuautitlán Izcalli, Edo. Méx.', lat: 19.6690, lng: -99.1870 },
  '57700': { name: 'Col. Nueva Evolución, Nezahualcóyotl, Edo. Méx.', lat: 19.4010, lng: -99.0180 },
  '57170': { name: 'Col. Bosques de Aragón, Neza, Edo. Méx.', lat: 19.4750, lng: -99.0520 },
  '56400': { name: 'Col. Floresta, Los Reyes La Paz, Edo. Méx.', lat: 19.3615, lng: -98.9760 },
  '56110': { name: 'Col. San Mateo, Texcoco, Edo. Méx.', lat: 19.5090, lng: -98.8790 },
  '56120': { name: 'Col. San Juan de Dios, Texcoco, Edo. Méx.', lat: 19.5140, lng: -98.8820 },
  '56600': { name: 'Col. San Miguel Jacalones, Chalco, Edo. Méx.', lat: 19.2610, lng: -98.8980 },
  '50010': { name: 'Col. Club Jardín, Toluca, Edo. Méx.', lat: 19.3090, lng: -99.6450 },
  '50130': { name: 'Col. Cuauhtémoc / Centro, Toluca, Edo. Méx.', lat: 19.2815, lng: -99.6540 },
};

/**
 * Calculate Haversine distance in kilometers between two GPS points
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance into a clean string (e.g., "1.4 km" or "850 m")
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Resolve coordinates for a Mexican postal code
 * 1. Checks specific exact table
 * 2. Checks 2-digit prefix centroid (covers all 16 CDMX alcaldías + states)
 * 3. Asynchronously attempts OpenStreetMap Nominatim for nationwide coverage
 */
export async function resolvePostalCodeCoords(postalCode) {
  const clean = String(postalCode || '').trim().padStart(5, '0');

  // 1. Direct specific hit
  if (specificPostalCodes[clean]) {
    return {
      cp: clean,
      ...specificPostalCodes[clean],
      isExact: true,
    };
  }

  // 2. Centroid prefix hit
  const prefix2 = clean.slice(0, 2);
  if (postalCodeCentroids[prefix2]) {
    const centroid = postalCodeCentroids[prefix2];
    // Slightly jitter or interpolate by 3rd and 4th digits for micro-differentiation
    const subDigit = (parseInt(clean.slice(2, 5), 10) || 500) / 1000 - 0.5;
    const latOffset = subDigit * 0.04;
    const lngOffset = subDigit * 0.04;

    return {
      cp: clean,
      name: `C.P. ${clean} (${centroid.name})`,
      lat: centroid.lat + latOffset,
      lng: centroid.lng + lngOffset,
      isExact: false,
    };
  }

  // 3. Fallback online geocoding for any nationwide Mexican CP
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${clean}&country=Mexico&format=json&limit=1`, {
      headers: { 'Accept-Language': 'es' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          cp: clean,
          name: data[0].display_name.split(',').slice(0, 2).join(','),
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          isExact: true,
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim lookup error:', err);
  }

  // Default to CDMX Center if unrecognized
  return {
    cp: clean,
    name: `C.P. ${clean} (CDMX / Área Metropolitana)`,
    lat: 19.4326,
    lng: -99.1332,
    isExact: false,
  };
}

/**
 * Find closest branches to given coordinates
 */
export function getClosestBranches(lat, lng, limit = 4) {
  const list = sucursalesWithCoords.map(branch => {
    const dist = calculateDistanceKm(lat, lng, branch.lat, branch.lng);
    return {
      ...branch,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
    };
  });

  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return list.slice(0, limit);
}
