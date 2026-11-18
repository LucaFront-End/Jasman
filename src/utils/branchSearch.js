import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  branchCoordinates,
  calculateDistanceKm,
  formatDistance,
  resolvePostalCodeCoords,
  resolvePostalCodeCoordsSync,
} from '../data/postalCodesData';
import { getWixPostalCode } from '../services/wixService';

export const CITY_FALLBACK_GEO = {
  'Atizapán de Zaragoza': [19.5567, -99.2456],
  'Azcapotzalco': [19.4913, -99.1823],
  'Cuautitlán Izcalli': [19.6486, -99.2104],
  'Naucalpan de Juárez': [19.4784, -99.24],
  'Pachuca de Soto': [20.0911, -98.7624],
  'Tlalnepantla De Baz': [19.5381, -99.1996],
  'Gustavo A. Madero': [19.4917, -99.1168],
  'Álvaro Obregón': [19.3588, -99.2122],
  'Miguel Hidalgo': [19.4326, -99.192],
  'Cuauhtémoc': [19.4285, -99.155],
  'Tlalpan': [19.2843, -99.1682],
  'Benito Juárez': [19.3718, -99.1571],
  'Coyoacán': [19.3437, -99.1562],
  'Venustiano Carranza': [19.4395, -99.1068],
  'Iztapalapa': [19.3548, -99.0728],
  'Iztacalco': [19.3961, -99.1004],
  'Nezahualcóyotl': [19.4006, -98.9884],
  'Los Reyes La Paz': [19.3629, -98.9671],
  'Chalco': [19.2649, -98.8968],
  'Texcoco': [19.5117, -98.8817],
  'Cuautla': [18.8107, -98.9543],
  'Toluca': [19.2826, -99.6557],
  'Salamanca': [20.574, -101.195],
  'Guanajuato': [21.019, -101.2574],
  'León de los Aldama': [21.1221, -101.6837],
  'Irapuato': [20.6736, -101.3497],
  'Guadalajara': [20.672, -103.3525],
  'Zapopan': [20.7214, -103.3919],
  'Tepic': [21.5049, -104.8946],
  'Huixquilucan': [19.3591, -99.3485],
  'San Pedro Garza García': [25.6577, -100.4031],
  'Guadalupe': [25.6768, -100.256],
  'Monterrey': [25.6866, -100.3161],
  'San Nicolás de los Garza': [25.7456, -100.2833],
  'Cdad. Apodaca': [25.78555, -100.26701],
  'Apodaca': [25.78555, -100.26701],
  'Nuevo Laredo': [27.4763, -99.5066],
  'Santiago de Querétaro': [20.5888, -100.3899],
  'San Juan del Río': [20.3893, -99.9961],
  'Celaya': [20.5233, -100.8157],
  'Morelia': [19.706, -101.195],
  'Los Reyes': [19.5849, -102.4762],
  'Zamora': [19.9862, -102.2833],
};

/**
 * Resolve reliable [lat, lng] coordinates for any branch object.
 */
export function getBranchCoords(branch) {
  if (!branch) return [19.4326, -99.1332];
  if (Number.isFinite(branch.lat) && Number.isFinite(branch.lng)) {
    return [branch.lat, branch.lng];
  }
  if (branch.id && branchCoordinates[branch.id]) {
    return [branchCoordinates[branch.id].lat, branchCoordinates[branch.id].lng];
  }
  if (branch.name && branchCoordinates[branch.name]) {
    return [branchCoordinates[branch.name].lat, branchCoordinates[branch.name].lng];
  }
  const geo = CITY_FALLBACK_GEO[branch.city];
  if (geo) return [geo[0], geo[1]];
  return [19.4326, -99.1332];
}

/**
 * Normalize text: strip diacritics, lowercase, punctuation -> spaces, collapse whitespace.
 */
export function normalizeSearchText(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function foldGeoPhrases(normStr) {
  return normStr
    .replace(/\b(ciudad de mexico|cd de mexico|distrito federal|d f)\b/g, 'cdmx')
    .replace(/\b(estado de mexico|edo de mexico|edo mex|edomex)\b/g, 'edomex')
    .replace(/\bnuevo leon\b/g, 'nuevoleon')
    .replace(/\bsan luis potosi\b/g, 'sanluispotosi');
}

const SEARCH_STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'en', 'por', 'a', 'al', 'y',
  'cp', 'c', 'p', 'col', 'colonia', 'calle', 'av', 'avenida', 'blvd',
  'boulevard', 'calz', 'calzada', 'suc', 'sucursal', 'jasman', 'automotriz',
  'cerca', 'cercana', 'cercanas', 'cercano',
]);

function getBranchSynonyms(branch) {
  const normState = foldGeoPhrases(normalizeSearchText(branch.state));
  const normRegion = normalizeSearchText(branch.region);
  const normCity = normalizeSearchText(branch.city);
  const aliases = [];

  if (normState.includes('cdmx') || normCity.includes('cdmx')) {
    aliases.push('cdmx df distrito federal ciudad de mexico valle de mexico zona metropolitana');
  }
  if (normState.includes('edomex') || normState.includes('mexico')) {
    aliases.push('edomex estado de mexico edo mex area metropolitana valle de mexico');
  }
  if (normState.includes('nuevoleon') || normRegion === 'monterrey') {
    aliases.push('nuevoleon nuevo leon nl mty monterrey');
  }
  if (normState.includes('jalisco') || normRegion === 'guadalajara') {
    aliases.push('jalisco jal gdl guadalajara zmg');
  }
  if (normState.includes('queretaro') || normRegion === 'queretaro') {
    aliases.push('queretaro qro santiago de queretaro');
  }
  if (normState.includes('guanajuato') || normRegion === 'bajio') {
    aliases.push('guanajuato gto bajio');
  }
  if (normState.includes('michoacan') || normRegion === 'michoacan') {
    aliases.push('michoacan mich');
  }
  if (normState.includes('hidalgo')) aliases.push('hidalgo hgo');
  if (normState.includes('morelos')) aliases.push('morelos mor');
  if (normState.includes('nayarit')) aliases.push('nayarit nay');
  if (normState.includes('tamaulipas')) aliases.push('tamaulipas tam tamps');

  return aliases.join(' ');
}

/**
 * Local Mexican gazetteer for instant (0 ms) proximity resolution when a user
 * searches by colony, alcaldia, municipality, or nearby city not present in branch text.
 */
const MEXICO_PLACES_GAZETTEER = {
  anahuac: { lat: 19.4426, lng: -99.1748, label: 'Col. Anáhuac, Miguel Hidalgo, CDMX' },
  anzures: { lat: 19.4339, lng: -99.1769, label: 'Col. Anzures, Miguel Hidalgo, CDMX' },
  'veronica anzures': { lat: 19.4395, lng: -99.1715, label: 'Col. Verónica Anzures, CDMX' },
  condesa: { lat: 19.412, lng: -99.173, label: 'Col. Condesa, Cuauhtémoc, CDMX' },
  hipodromo: { lat: 19.4105, lng: -99.1705, label: 'Col. Hipódromo Condesa, CDMX' },
  roma: { lat: 19.418, lng: -99.162, label: 'Col. Roma, Cuauhtémoc, CDMX' },
  'roma norte': { lat: 19.4195, lng: -99.1625, label: 'Col. Roma Norte, CDMX' },
  'roma sur': { lat: 19.406, lng: -99.162, label: 'Col. Roma Sur, CDMX' },
  juarez: { lat: 19.427, lng: -99.162, label: 'Col. Juárez, Cuauhtémoc, CDMX' },
  'zona rosa': { lat: 19.4255, lng: -99.164, label: 'Zona Rosa, Cuauhtémoc, CDMX' },
  'del valle': { lat: 19.3805, lng: -99.1665, label: 'Col. Del Valle, Benito Juárez, CDMX' },
  napoles: { lat: 19.392, lng: -99.177, label: 'Col. Nápoles, Benito Juárez, CDMX' },
  escandon: { lat: 19.402, lng: -99.18, label: 'Col. Escandón, Miguel Hidalgo, CDMX' },
  tacuba: { lat: 19.459, lng: -99.188, label: 'Tacuba, Miguel Hidalgo, CDMX' },
  tacubaya: { lat: 19.402, lng: -99.188, label: 'Tacubaya, Miguel Hidalgo, CDMX' },
  observatorio: { lat: 19.398, lng: -99.2, label: 'Observatorio, Miguel Hidalgo, CDMX' },
  chapultepec: { lat: 19.4205, lng: -99.19, label: 'Chapultepec, CDMX' },
  'lomas de chapultepec': { lat: 19.421, lng: -99.213, label: 'Lomas de Chapultepec, CDMX' },
  claveria: { lat: 19.465, lng: -99.186, label: 'Clavería, Azcapotzalco, CDMX' },
  lindavista: { lat: 19.489, lng: -99.129, label: 'Lindavista, Gustavo A. Madero, CDMX' },
  tepeyac: { lat: 19.486, lng: -99.118, label: 'Villa de Guadalupe, GAM, CDMX' },
  coapa: { lat: 19.308, lng: -99.126, label: 'Coapa, Coyoacán / Tlalpan, CDMX' },
  pedregal: { lat: 19.318, lng: -99.208, label: 'Jardines del Pedregal, CDMX' },
  copilco: { lat: 19.335, lng: -99.176, label: 'Copilco, Coyoacán, CDMX' },
  mixcoac: { lat: 19.376, lng: -99.187, label: 'Mixcoac, Benito Juárez, CDMX' },
  'san angel': { lat: 19.347, lng: -99.191, label: 'San Ángel, Álvaro Obregón, CDMX' },
  xochimilco: { lat: 19.257, lng: -99.103, label: 'Xochimilco, CDMX' },
  tlahuac: { lat: 19.273, lng: -99.004, label: 'Tláhuac, CDMX' },
  'milpa alta': { lat: 19.192, lng: -99.023, label: 'Milpa Alta, CDMX' },
  'magdalena contreras': { lat: 19.308, lng: -99.234, label: 'La Magdalena Contreras, CDMX' },
  cuajimalpa: { lat: 19.359, lng: -99.292, label: 'Cuajimalpa de Morelos, CDMX' },
  bosques: { lat: 19.388, lng: -99.252, label: 'Bosques de las Lomas, CDMX' },
  satelite: { lat: 19.511, lng: -99.235, label: 'Ciudad Satélite, Naucalpan, Edo. Méx.' },
  'ciudad satelite': { lat: 19.511, lng: -99.235, label: 'Ciudad Satélite, Naucalpan, Edo. Méx.' },
  echegaray: { lat: 19.493, lng: -99.228, label: 'Hacienda de Echegaray, Naucalpan' },
  tecamachalco: { lat: 19.423, lng: -99.236, label: 'Lomas de Tecamachalco, Edo. Méx.' },
  ecatepec: { lat: 19.601, lng: -99.051, label: 'Ecatepec de Morelos, Edo. Méx.' },
  coacalco: { lat: 19.631, lng: -99.107, label: 'Coacalco, Edo. Méx.' },
  tultitlan: { lat: 19.645, lng: -99.169, label: 'Tultitlán, Edo. Méx.' },
  metepec: { lat: 19.253, lng: -99.603, label: 'Metepec, Edo. Méx.' },
  lerma: { lat: 19.286, lng: -99.512, label: 'Lerma, Edo. Méx.' },
  ixtapaluca: { lat: 19.318, lng: -98.882, label: 'Ixtapaluca, Edo. Méx.' },
  chimalhuacan: { lat: 19.419, lng: -98.948, label: 'Chimalhuacán, Edo. Méx.' },
  'nicolas romero': { lat: 19.622, lng: -99.307, label: 'Nicolás Romero, Edo. Méx.' },
  puebla: { lat: 19.0414, lng: -98.2063, label: 'Puebla, Pue.' },
  cholula: { lat: 19.062, lng: -98.306, label: 'Cholula, Pue.' },
  cuernavaca: { lat: 18.9242, lng: -99.2216, label: 'Cuernavaca, Mor.' },
  jiutepec: { lat: 18.882, lng: -99.177, label: 'Jiutepec, Mor.' },
  aguascalientes: { lat: 21.8853, lng: -102.2916, label: 'Aguascalientes, Ags.' },
  'san luis potosi': { lat: 22.1565, lng: -100.9855, label: 'San Luis Potosí, S.L.P.' },
  saltillo: { lat: 25.4232, lng: -101.0053, label: 'Saltillo, Coah.' },
  torreon: { lat: 25.5428, lng: -103.4068, label: 'Torreón, Coah.' },
  tampico: { lat: 22.2331, lng: -97.8611, label: 'Tampico, Tamps.' },
  reynosa: { lat: 26.0508, lng: -98.2979, label: 'Reynosa, Tamps.' },
  veracruz: { lat: 19.1738, lng: -96.1342, label: 'Veracruz, Ver.' },
  merida: { lat: 20.9674, lng: -89.5926, label: 'Mérida, Yuc.' },
  cancun: { lat: 21.1619, lng: -86.8515, label: 'Cancún, Q. Roo' },
  juriquilla: { lat: 20.703, lng: -100.446, label: 'Juriquilla, Querétaro' },
  corregidora: { lat: 20.533, lng: -100.443, label: 'Corregidora, Querétaro' },
  'el marques': { lat: 20.614, lng: -100.281, label: 'El Marqués, Querétaro' },
  tlaquepaque: { lat: 20.6409, lng: -103.3119, label: 'Tlaquepaque, Jal.' },
  tonala: { lat: 20.624, lng: -103.242, label: 'Tonalá, Jal.' },
  tlajomulco: { lat: 20.474, lng: -103.443, label: 'Tlajomulco, Jal.' },
  cumbres: { lat: 25.736, lng: -100.398, label: 'Cumbres, Monterrey, N.L.' },
  escobedo: { lat: 25.797, lng: -100.326, label: 'General Escobedo, N.L.' },
  'santa catarina': { lat: 25.673, lng: -100.458, label: 'Santa Catarina, N.L.' },
  uruapan: { lat: 19.411, lng: -102.056, label: 'Uruapan, Mich.' },
  patzcuaro: { lat: 19.516, lng: -101.609, label: 'Pátzcuaro, Mich.' },
};

function lookupPlaceInGazetteer(normQuery) {
  if (!normQuery) return null;
  const cleaned = normQuery
    .replace(/\b(col|colonia|alcaldia|municipio|ciudad|cd|mexico)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (MEXICO_PLACES_GAZETTEER[normQuery]) return MEXICO_PLACES_GAZETTEER[normQuery];
  if (cleaned && MEXICO_PLACES_GAZETTEER[cleaned]) return MEXICO_PLACES_GAZETTEER[cleaned];
  for (const [key, value] of Object.entries(MEXICO_PLACES_GAZETTEER)) {
    if (normQuery === key || (cleaned && cleaned === key)) return value;
    if (cleaned.length >= 4 && (cleaned.includes(key) || key.includes(cleaned))) {
      return value;
    }
  }
  return null;
}

const placeGeocodeCache = new Map();

/**
 * Geocode any Mexican city, colony, or address via Nominatim (with 2.5s timeout + cache).
 */
export async function geocodeMexicoPlaceAsync(rawQuery, externalSignal) {
  const norm = normalizeSearchText(rawQuery);
  if (!norm || norm.length < 3) return null;

  if (placeGeocodeCache.has(norm)) {
    return placeGeocodeCache.get(norm);
  }

  const gaz = lookupPlaceInGazetteer(norm);
  if (gaz) {
    placeGeocodeCache.set(norm, gaz);
    return gaz;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timerId = controller ? setTimeout(() => controller.abort(), 2800) : null;
  if (externalSignal && controller) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const queryText = rawQuery.trim();
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${queryText}, México`)}&countrycodes=mx&format=json&limit=1`,
      {
        headers: { 'Accept-Language': 'es' },
        signal: controller ? controller.signal : undefined,
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const parsed = {
            lat,
            lng,
            label: data[0].display_name.split(',').slice(0, 2).join(',').trim(),
          };
          placeGeocodeCache.set(norm, parsed);
          return parsed;
        }
      }
    }
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.warn('Place geocoding fallback error:', err);
    }
  } finally {
    if (timerId) clearTimeout(timerId);
  }

  return null;
}

function extractPostalQuery(rawQuery) {
  const trimmed = String(rawQuery || '').trim();
  const pureDigits = trimmed.replace(/\D/g, '');
  const hasLetters = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed);

  if (!hasLetters && /^\d{3,5}$/.test(pureDigits)) {
    if (pureDigits.length === 5) return { exactCp5: pureDigits, partialDigits: null };
    return { exactCp5: null, partialDigits: pureDigits };
  }

  const cpMatch = trimmed.match(/(?:^|\b)(?:c\.?\s*p\.?\s*)?(\d{5})(?:\b|$)/i);
  if (cpMatch) {
    return { exactCp5: cpMatch[1], partialDigits: null };
  }

  return { exactCp5: null, partialDigits: null };
}

function rankBranchesByProximity(branches, lat, lng, { maxRadiusKm = 50, minResults = 8, exactCp = null } = {}) {
  const withDist = branches.map((b) => {
    const [bLat, bLng] = getBranchCoords(b);
    const dist = calculateDistanceKm(lat, lng, bLat, bLng);
    return {
      ...b,
      lat: bLat,
      lng: bLng,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
      _exactCpMatch: Boolean(exactCp && String(b.cp || '').trim() === exactCp),
    };
  });

  withDist.sort((a, b) => {
    if (a._exactCpMatch !== b._exactCpMatch && a.distanceKm < 5 && b.distanceKm < 5) {
      return a._exactCpMatch ? -1 : 1;
    }
    return a.distanceKm - b.distanceKm;
  });

  const withinPrimary = withDist.filter((b) => b.distanceKm <= maxRadiusKm);
  if (withinPrimary.length >= Math.min(3, withDist.length)) {
    return withinPrimary.slice(0, Math.max(12, minResults)).map(({ _exactCpMatch, ...rest }) => {
      void _exactCpMatch;
      return rest;
    });
  }

  const withinExtended = withDist.filter((b) => b.distanceKm <= Math.max(maxRadiusKm * 2.2, 120));
  if (withinExtended.length >= Math.min(3, withDist.length)) {
    return withinExtended.slice(0, minResults).map(({ _exactCpMatch, ...rest }) => {
      void _exactCpMatch;
      return rest;
    });
  }

  return withDist.slice(0, minResults).map(({ _exactCpMatch, ...rest }) => {
    void _exactCpMatch;
    return rest;
  });
}

function attachDistancesFrom(branches, lat, lng) {
  return branches.map((b) => {
    const [bLat, bLng] = getBranchCoords(b);
    const dist = calculateDistanceKm(lat, lng, bLat, bLng);
    return {
      ...b,
      lat: bLat,
      lng: bLng,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
    };
  });
}

function computeCenterAndZoom(branches) {
  if (!branches || branches.length === 0) return { centerCoords: null, zoom: null };
  if (branches.length === 1) {
    return { centerCoords: getBranchCoords(branches[0]), zoom: 14 };
  }
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let sumLat = 0;
  let sumLng = 0;

  branches.forEach((b) => {
    const [lat, lng] = getBranchCoords(b);
    sumLat += lat;
    sumLng += lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  const spread = Math.max(maxLat - minLat, maxLng - minLng);
  const zoom = spread < 0.08 ? 13 : spread < 0.45 ? 11 : spread < 2.2 ? 9 : 6;
  return {
    centerCoords: [sumLat / branches.length, sumLng / branches.length],
    zoom,
  };
}

/**
 * Pure smart branch search supporting:
 * - Postal codes (5-digit proximity + partial 3-4 digit matching)
 * - Branch name, street/colonia address, city/alcaldia, state & Mexican geo aliases ("Ciudad de mexico" -> CDMX)
 * - Colony / place proximity fallback (local gazetteer + async Nominatim MX)
 * - Active GPS proximity ranking
 */
export function searchBranchesSmart(branches, rawQuery = '', options = {}) {
  const {
    activeRegion = null,
    resolvedCp = null,
    resolvedPlace = null,
    gpsLocation = null,
    maxRadiusKm = 50,
    minResults = 8,
  } = options;

  const list = Array.isArray(branches) ? branches : [];
  const trimmed = String(rawQuery || '').trim();

  if (!trimmed) {
    if (gpsLocation && Number.isFinite(gpsLocation.lat) && Number.isFinite(gpsLocation.lng)) {
      const ranked = rankBranchesByProximity(list, gpsLocation.lat, gpsLocation.lng, {
        maxRadiusKm,
        minResults,
      });
      return {
        results: ranked,
        mode: 'gps',
        centerCoords: [gpsLocation.lat, gpsLocation.lng],
        zoom: 12,
        contextLabel: 'Sucursales más cercanas a tu ubicación GPS',
        needsAsyncPlaceGeocode: false,
        activeCp5: null,
        normQuery: '',
      };
    }

    const base = activeRegion ? list.filter((b) => b.region === activeRegion) : list;
    return {
      results: base,
      mode: 'all',
      centerCoords: null,
      zoom: null,
      contextLabel: null,
      needsAsyncPlaceGeocode: false,
      activeCp5: null,
      normQuery: '',
    };
  }

  const { exactCp5, partialDigits } = extractPostalQuery(trimmed);

  if (exactCp5) {
    const cpObj = resolvedCp && resolvedCp.cp === exactCp5 ? resolvedCp : resolvePostalCodeCoordsSync(exactCp5);
    const ranked = rankBranchesByProximity(list, cpObj.lat, cpObj.lng, {
      maxRadiusKm: 45,
      minResults,
      exactCp: exactCp5,
    });
    return {
      results: ranked,
      mode: 'cp-proximity',
      centerCoords: [cpObj.lat, cpObj.lng],
      zoom: 12,
      contextLabel: cpObj.name
        ? (cpObj.name.includes(exactCp5)
            ? `Más cercanas a ${cpObj.name}`
            : `Más cercanas a ${cpObj.name} (C.P. ${exactCp5})`)
        : `Más cercanas al C.P. ${exactCp5}`,
      needsAsyncPlaceGeocode: false,
      activeCp5: exactCp5,
      normQuery: exactCp5,
    };
  }

  if (partialDigits) {
    const paddedCp = partialDigits.padEnd(5, '0');
    const cpObj = resolvePostalCodeCoordsSync(paddedCp);
    const prefixMatches = list.filter((b) => String(b.cp || '').startsWith(partialDigits));
    const nearbyMatches = rankBranchesByProximity(list, cpObj.lat, cpObj.lng, {
      maxRadiusKm: 35,
      minResults: 6,
    });

    const merged = [];
    const seen = new Set();
    attachDistancesFrom(prefixMatches, cpObj.lat, cpObj.lng).forEach((b) => {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        merged.push(b);
      }
    });
    nearbyMatches.forEach((b) => {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        merged.push(b);
      }
    });

    return {
      results: merged,
      mode: 'cp-partial',
      centerCoords: [cpObj.lat, cpObj.lng],
      zoom: 12,
      contextLabel: `C.P. ${partialDigits}... • Sucursales cercanas`,
      needsAsyncPlaceGeocode: false,
      activeCp5: null,
      normQuery: partialDigits,
    };
  }

  const rawNorm = normalizeSearchText(trimmed);
  const foldedNorm = foldGeoPhrases(rawNorm);
  const rawTokens = foldedNorm.split(' ').filter(Boolean);
  const meaningfulTokens = rawTokens.filter((t) => !SEARCH_STOPWORDS.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  const findScoredMatches = (source) => {
    const scored = [];
    for (const b of source) {
      const normName = foldGeoPhrases(normalizeSearchText(b.name));
      const normFullName = foldGeoPhrases(normalizeSearchText(b.fullName));
      const normCity = foldGeoPhrases(normalizeSearchText(b.city));
      const normState = foldGeoPhrases(normalizeSearchText(b.state));
      const normRegion = foldGeoPhrases(normalizeSearchText(b.region));
      const normAddress = foldGeoPhrases(normalizeSearchText(b.address));
      const normCp = normalizeSearchText(b.cp);
      const normAliases = foldGeoPhrases(getBranchSynonyms(b));

      const corpus = `${normName} ${normFullName} ${normAddress} ${normCity} ${normState} ${normRegion} ${normCp} ${normAliases}`;
      const allMatch = tokens.every((tok) => corpus.includes(tok));
      if (!allMatch) continue;

      let score = 0;
      if (normName === foldedNorm) score += 120;
      else if (normName.startsWith(foldedNorm)) score += 90;
      else if (normName.includes(foldedNorm)) score += 70;

      if (normCity.includes(foldedNorm) || normState.includes(foldedNorm) || normRegion.includes(foldedNorm) || normAliases.includes(foldedNorm)) {
        score += 45;
      }
      if (normAddress.includes(foldedNorm)) score += 30;
      score += tokens.reduce((acc, tok) => acc + (normName.includes(tok) ? 15 : 5), 0);

      scored.push({ branch: b, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.branch);
  };

  let matches = findScoredMatches(activeRegion ? list.filter((b) => b.region === activeRegion) : list);
  if (matches.length === 0 && activeRegion) {
    matches = findScoredMatches(list);
  }

  if (matches.length > 0) {
    const { centerCoords, zoom } = computeCenterAndZoom(matches);
    const enriched = gpsLocation
      ? attachDistancesFrom(matches, gpsLocation.lat, gpsLocation.lng)
      : matches;
    return {
      results: enriched,
      mode: 'text',
      centerCoords,
      zoom,
      contextLabel: null,
      needsAsyncPlaceGeocode: false,
      activeCp5: null,
      normQuery: rawNorm,
    };
  }

  const placeCoord =
    (resolvedPlace && resolvedPlace.query === rawNorm ? resolvedPlace : null) ||
    lookupPlaceInGazetteer(rawNorm);

  if (placeCoord && Number.isFinite(placeCoord.lat) && Number.isFinite(placeCoord.lng)) {
    const ranked = rankBranchesByProximity(list, placeCoord.lat, placeCoord.lng, {
      maxRadiusKm,
      minResults,
    });
    return {
      results: ranked,
      mode: 'place-proximity',
      centerCoords: [placeCoord.lat, placeCoord.lng],
      zoom: 12,
      contextLabel: `Más cercanas a ${placeCoord.label || trimmed}`,
      needsAsyncPlaceGeocode: false,
      activeCp5: null,
      normQuery: rawNorm,
    };
  }

  return {
    results: [],
    mode: 'empty',
    centerCoords: null,
    zoom: null,
    contextLabel: null,
    needsAsyncPlaceGeocode: rawNorm.length >= 3,
    activeCp5: null,
    normQuery: rawNorm,
  };
}

/**
 * React hook powering instant local + proximity + async geocoded branch search.
 */
export function useSmartBranchSearch(branches, searchTerm, activeRegion = null) {
  const [resolvedCp, setResolvedCp] = useState(null);
  const [resolvedPlace, setResolvedPlace] = useState(null);
  const [resolvingKey, setResolvingKey] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const syncSearch = useMemo(
    () =>
      searchBranchesSmart(branches, searchTerm, {
        activeRegion,
        resolvedCp,
        resolvedPlace,
        gpsLocation,
      }),
    [branches, searchTerm, activeRegion, resolvedCp, resolvedPlace, gpsLocation]
  );

  // Refine 5-digit postal codes against Wix CMS "Codigospostales" + Nominatim
  const activeCp5 = syncSearch.activeCp5;
  useEffect(() => {
    if (!activeCp5) return undefined;
    let active = true;
    async function refineCp() {
      try {
        const wixHit = await getWixPostalCode(activeCp5);
        if (!active) return;
        if (wixHit && Number.isFinite(wixHit.lat) && Number.isFinite(wixHit.lng)) {
          setResolvedCp({
            cp: activeCp5,
            name: wixHit.name,
            lat: wixHit.lat,
            lng: wixHit.lng,
          });
          return;
        }
        const netHit = await resolvePostalCodeCoords(activeCp5);
        if (!active) return;
        if (netHit && Number.isFinite(netHit.lat) && Number.isFinite(netHit.lng)) {
          setResolvedCp({
            cp: activeCp5,
            name: netHit.name,
            lat: netHit.lat,
            lng: netHit.lng,
          });
        }
      } catch {
        // Sync fallback coordinates already active
      }
    }
    refineCp();
    return () => {
      active = false;
    };
  }, [activeCp5]);

  // Debounced Nominatim fallback for unrecognized Mexican colonies / municipalities
  const needsAsyncPlace = syncSearch.needsAsyncPlaceGeocode;
  const normQuery = syncSearch.normQuery;
  const rawTrimmed = String(searchTerm || '').trim();

  useEffect(() => {
    if (!needsAsyncPlace || !normQuery || normQuery.length < 3) return undefined;
    let active = true;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

    const timerId = setTimeout(async () => {
      setResolvingKey(normQuery);
      try {
        const geo = await geocodeMexicoPlaceAsync(rawTrimmed, controller ? controller.signal : undefined);
        if (active && geo) {
          setResolvedPlace({ query: normQuery, ...geo });
        }
      } finally {
        if (active) {
          setResolvingKey((prev) => (prev === normQuery ? '' : prev));
        }
      }
    }, 320);

    return () => {
      active = false;
      clearTimeout(timerId);
      if (controller) controller.abort();
    };
  }, [needsAsyncPlace, normQuery, rawTrimmed]);

  const locateByGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      () => {
        setGpsError('No se pudo obtener tu ubicación actual. Busca por C.P. o ciudad.');
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const clearGps = useCallback(() => {
    setGpsLocation(null);
    setGpsError(null);
  }, []);

  return {
    filtered: syncSearch.results,
    mode: syncSearch.mode,
    centerCoords: syncSearch.centerCoords,
    zoom: syncSearch.zoom,
    contextLabel: syncSearch.contextLabel,
    isResolving: Boolean(resolvingKey && resolvingKey === normQuery),
    gpsLocation,
    gpsLoading,
    gpsError,
    locateByGps,
    clearGps,
  };
}
