/**
 * Postal Codes & Branch Geocoding Data for Jasman Automotriz
 * Official 2026 Directory: Supports all 71 Jasman branches nationwide + postal code lookup for Mexico (CDMX and nationwide)
 */

import { sucursales } from './sucursalesData.js';

// Exact coordinates for all 71 Jasman branches nationwide
export const branchCoordinates = {
  "alamedas-2": {
    "lat": 19.558,
    "lng": -99.249
  },
  "alamedas": {
    "lat": 19.5512,
    "lng": -99.2435
  },
  "azcapotzalco": {
    "lat": 19.4913,
    "lng": -99.1985
  },
  "azcapotzalco-2": {
    "lat": 19.4795,
    "lng": -99.1912
  },
  "cuautitlan": {
    "lat": 19.669,
    "lng": -99.187
  },
  "lomas-verdes": {
    "lat": 19.5085,
    "lng": -99.2555
  },
  "naucalpan": {
    "lat": 19.476,
    "lng": -99.239
  },
  "pachuca": {
    "lat": 20.1085,
    "lng": -98.756
  },
  "tlalnepantla": {
    "lat": 19.5385,
    "lng": -99.2135
  },
  "vallejo": {
    "lat": 19.4715,
    "lng": -99.147
  },
  "santa-fe": {
    "lat": 19.378,
    "lng": -99.2515
  },
  "mariano-escobedo": {
    "lat": 19.4525,
    "lng": -99.1795
  },
  "interlomas": {
    "lat": 19.4015,
    "lng": -99.2785
  },
  "yucatan": {
    "lat": 19.4165,
    "lng": -99.1635
  },
  "polanco": {
    "lat": 19.431,
    "lng": -99.1835
  },
  "toluca-1": {
    "lat": 19.309,
    "lng": -99.645
  },
  "toluca-centro": {
    "lat": 19.2815,
    "lng": -99.654
  },
  "chabacano": {
    "lat": 19.4075,
    "lng": -99.1345
  },
  "revolucion": {
    "lat": 19.3515,
    "lng": -99.191
  },
  "ajusco": {
    "lat": 19.289,
    "lng": -99.217
  },
  "vertiz": {
    "lat": 19.384,
    "lng": -99.1535
  },
  "san-jeronimo": {
    "lat": 19.3295,
    "lng": -99.2105
  },
  "portales": {
    "lat": 19.371,
    "lng": -99.1455
  },
  "miramontes": {
    "lat": 19.314,
    "lng": -99.1305
  },
  "av-toluca": {
    "lat": 19.3365,
    "lng": -99.227
  },
  "cuautla": {
    "lat": 18.815,
    "lng": -98.956
  },
  "aeropuerto": {
    "lat": 19.432,
    "lng": -99.091
  },
  "texcoco-allende": {
    "lat": 19.514,
    "lng": -98.882
  },
  "texcoco": {
    "lat": 19.509,
    "lng": -98.879
  },
  "central-de-abastos": {
    "lat": 19.3725,
    "lng": -99.0915
  },
  "iztapalapa": {
    "lat": 19.353,
    "lng": -99.062
  },
  "iztacalco": {
    "lat": 19.398,
    "lng": -99.1025
  },
  "nezahualcoyotl": {
    "lat": 19.401,
    "lng": -99.018
  },
  "los-reyes": {
    "lat": 19.3615,
    "lng": -98.976
  },
  "chalco": {
    "lat": 19.261,
    "lng": -98.898
  },
  "aragon": {
    "lat": 19.475,
    "lng": -99.052
  },
  "salamanca": {
    "lat": 20.572,
    "lng": -101.196
  },
  "guanajuato": {
    "lat": 21.011,
    "lng": -101.265
  },
  "torres-landa": {
    "lat": 21.109,
    "lng": -101.691
  },
  "morelos": {
    "lat": 21.116,
    "lng": -101.642
  },
  "hidalgo": {
    "lat": 21.139,
    "lng": -101.685
  },
  "irapuato": {
    "lat": 20.678,
    "lng": -101.352
  },
  "country-guadalajara": {
    "lat": 20.702,
    "lng": -103.368
  },
  "tepic": {
    "lat": 21.492,
    "lng": -104.897
  },
  "revolucion-guadalajara": {
    "lat": 20.648,
    "lng": -103.309
  },
  "patria": {
    "lat": 20.669,
    "lng": -103.421
  },
  "gonzalez-gallo": {
    "lat": 20.651,
    "lng": -103.332
  },
  "javier-mina": {
    "lat": 20.6695,
    "lng": -103.321
  },
  "americas": {
    "lat": 20.687,
    "lng": -103.374
  },
  "la-paz": {
    "lat": 20.672,
    "lng": -103.361
  },
  "providencia": {
    "lat": 20.698,
    "lng": -103.385
  },
  "nuevo-laredo": {
    "lat": 27.489,
    "lng": -99.512
  },
  "valle": {
    "lat": 25.656,
    "lng": -100.375
  },
  "primavera": {
    "lat": 25.671,
    "lng": -100.241
  },
  "linda-vista": {
    "lat": 25.698,
    "lng": -100.262
  },
  "abastos": {
    "lat": 25.719,
    "lng": -100.301
  },
  "san-nicolas": {
    "lat": 25.748,
    "lng": -100.292
  },
  "chapultepec": {
    "lat": 25.662,
    "lng": -100.285
  },
  "universidad": {
    "lat": 25.725,
    "lng": -100.315
  },
  "lincoln": {
    "lat": 25.731,
    "lng": -100.379
  },
  "queretaro": {
    "lat": 20.589,
    "lng": -100.405
  },
  "constituyentes": {
    "lat": 20.581,
    "lng": -100.395
  },
  "americas-qro": {
    "lat": 20.591,
    "lng": -100.372
  },
  "mega-estadio": {
    "lat": 20.575,
    "lng": -100.365
  },
  "juriquilla": {
    "lat": 20.689,
    "lng": -100.441
  },
  "san-juan-del-rio": {
    "lat": 20.387,
    "lng": -99.992
  },
  "celaya": {
    "lat": 20.528,
    "lng": -100.812
  },
  "camelinas": {
    "lat": 19.682,
    "lng": -101.162
  },
  "huertas": {
    "lat": 19.691,
    "lng": -101.218
  },
  "los-reyes-michoacan": {
    "lat": 19.587,
    "lng": -102.472
  },
  "zamora-juarez": {
    "lat": 19.985,
    "lng": -102.281
  }
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
// Covers all CDMX alcaldías (01xxx - 16xxx) and all 32 Mexican states
export const postalCodeCentroids = {
  "10": {
    "name": "La Magdalena Contreras, CDMX",
    "lat": 19.308,
    "lng": -99.234
  },
  "11": {
    "name": "Miguel Hidalgo, CDMX",
    "lat": 19.4326,
    "lng": -99.192
  },
  "12": {
    "name": "Milpa Alta, CDMX",
    "lat": 19.192,
    "lng": -99.023
  },
  "13": {
    "name": "Tláhuac, CDMX",
    "lat": 19.273,
    "lng": -99.004
  },
  "14": {
    "name": "Tlalpan, CDMX",
    "lat": 19.2843,
    "lng": -99.1682
  },
  "15": {
    "name": "Venustiano Carranza, CDMX",
    "lat": 19.4395,
    "lng": -99.1068
  },
  "16": {
    "name": "Xochimilco, CDMX",
    "lat": 19.257,
    "lng": -99.103
  },
  "20": {
    "name": "Aguascalientes, Ags.",
    "lat": 21.8853,
    "lng": -102.2916
  },
  "21": {
    "name": "Mexicali, B.C.",
    "lat": 32.6245,
    "lng": -115.4523
  },
  "22": {
    "name": "Tijuana / Ensenada, B.C.",
    "lat": 32.5149,
    "lng": -117.0382
  },
  "23": {
    "name": "La Paz / Los Cabos, B.C.S.",
    "lat": 24.1426,
    "lng": -110.3128
  },
  "24": {
    "name": "Campeche, Camp.",
    "lat": 19.8301,
    "lng": -90.5349
  },
  "25": {
    "name": "Saltillo, Coah.",
    "lat": 25.4267,
    "lng": -101.0053
  },
  "26": {
    "name": "Monclova, Coah.",
    "lat": 26.9069,
    "lng": -101.4206
  },
  "27": {
    "name": "Torreón / La Laguna, Coah.",
    "lat": 25.5428,
    "lng": -103.4068
  },
  "28": {
    "name": "Colima / Manzanillo, Col.",
    "lat": 19.2452,
    "lng": -103.7241
  },
  "29": {
    "name": "Tuxtla Gutiérrez, Chis.",
    "lat": 16.7569,
    "lng": -93.1292
  },
  "30": {
    "name": "Tapachula / San Cristóbal, Chis.",
    "lat": 14.9079,
    "lng": -92.2618
  },
  "31": {
    "name": "Chihuahua Centro, Chih.",
    "lat": 28.633,
    "lng": -106.0691
  },
  "32": {
    "name": "Ciudad Juárez, Chih.",
    "lat": 31.6904,
    "lng": -106.4245
  },
  "33": {
    "name": "Delicias / Cuauhtémoc, Chih.",
    "lat": 28.1928,
    "lng": -105.4714
  },
  "34": {
    "name": "Victoria de Durango, Dgo.",
    "lat": 24.0277,
    "lng": -104.6532
  },
  "35": {
    "name": "Gómez Palacio, Dgo.",
    "lat": 25.5727,
    "lng": -103.4988
  },
  "36": {
    "name": "Irapuato / Salamanca / Guanajuato, Gto.",
    "lat": 20.6736,
    "lng": -101.3497
  },
  "37": {
    "name": "León de los Aldama, Gto.",
    "lat": 21.1221,
    "lng": -101.6837
  },
  "38": {
    "name": "Celaya, Gto.",
    "lat": 20.5233,
    "lng": -100.8157
  },
  "39": {
    "name": "Acapulco de Juárez, Gro.",
    "lat": 16.8531,
    "lng": -99.8237
  },
  "40": {
    "name": "Iguala, Gro.",
    "lat": 18.3448,
    "lng": -99.5398
  },
  "41": {
    "name": "Chilpancingo, Gro.",
    "lat": 17.5516,
    "lng": -99.5008
  },
  "42": {
    "name": "Pachuca de Soto / Tulancingo, Hgo.",
    "lat": 20.0911,
    "lng": -98.7624
  },
  "43": {
    "name": "Tula de Allende, Hgo.",
    "lat": 20.0526,
    "lng": -99.3444
  },
  "44": {
    "name": "Guadalajara Centro / Oriente, Jal.",
    "lat": 20.672,
    "lng": -103.3525
  },
  "45": {
    "name": "Zapopan / Guadalajara Poniente, Jal.",
    "lat": 20.7214,
    "lng": -103.3919
  },
  "46": {
    "name": "Tlaquepaque / Tonalá, Jal.",
    "lat": 20.6409,
    "lng": -103.3125
  },
  "47": {
    "name": "Tlajomulco / Los Altos, Jal.",
    "lat": 20.4739,
    "lng": -103.4447
  },
  "48": {
    "name": "Puerto Vallarta, Jal.",
    "lat": 20.6534,
    "lng": -105.2253
  },
  "50": {
    "name": "Toluca / Metepec, Edo. Méx.",
    "lat": 19.2826,
    "lng": -99.6557
  },
  "51": {
    "name": "Ixtapan de la Sal / Valle de Bravo, Edo. Méx.",
    "lat": 18.8436,
    "lng": -99.6766
  },
  "52": {
    "name": "Huixquilucan / Atizapán, Edo. Méx.",
    "lat": 19.4015,
    "lng": -99.2785
  },
  "53": {
    "name": "Naucalpan de Juárez, Edo. Méx.",
    "lat": 19.4784,
    "lng": -99.24
  },
  "54": {
    "name": "Tlalnepantla / Cuautitlán, Edo. Méx.",
    "lat": 19.5381,
    "lng": -99.1996
  },
  "55": {
    "name": "Ecatepec de Morelos, Edo. Méx.",
    "lat": 19.6097,
    "lng": -99.0599
  },
  "56": {
    "name": "Texcoco / Los Reyes / Chalco, Edo. Méx.",
    "lat": 19.45,
    "lng": -98.92
  },
  "57": {
    "name": "Nezahualcóyotl, Edo. Méx.",
    "lat": 19.4006,
    "lng": -98.9884
  },
  "58": {
    "name": "Morelia, Mich.",
    "lat": 19.706,
    "lng": -101.195
  },
  "59": {
    "name": "Zamora / Jacona, Mich.",
    "lat": 19.9862,
    "lng": -102.2833
  },
  "60": {
    "name": "Los Reyes / Uruapan, Mich.",
    "lat": 19.5849,
    "lng": -102.4762
  },
  "61": {
    "name": "Lázaro Cárdenas / Zitácuaro, Mich.",
    "lat": 17.9583,
    "lng": -102.203
  },
  "62": {
    "name": "Cuautla / Cuernavaca, Mor.",
    "lat": 18.8107,
    "lng": -98.9543
  },
  "63": {
    "name": "Tepic, Nay.",
    "lat": 21.5049,
    "lng": -104.8946
  },
  "64": {
    "name": "Monterrey Centro / Sur, N.L.",
    "lat": 25.6866,
    "lng": -100.3161
  },
  "65": {
    "name": "Monterrey Norte / Poniente, N.L.",
    "lat": 25.72,
    "lng": -100.31
  },
  "66": {
    "name": "San Pedro Garza García / San Nicolás, N.L.",
    "lat": 25.6577,
    "lng": -100.4031
  },
  "67": {
    "name": "Guadalupe / Apodaca / Escobedo, N.L.",
    "lat": 25.6768,
    "lng": -100.256
  },
  "68": {
    "name": "Oaxaca de Juárez, Oax.",
    "lat": 17.0732,
    "lng": -96.7266
  },
  "70": {
    "name": "Salina Cruz / Tehuantepec, Oax.",
    "lat": 16.1833,
    "lng": -95.2
  },
  "71": {
    "name": "Tuxtepec, Oax.",
    "lat": 18.0877,
    "lng": -96.1265
  },
  "72": {
    "name": "Puebla / Cholula, Pue.",
    "lat": 19.0414,
    "lng": -98.2063
  },
  "73": {
    "name": "San Martín Texmelucan, Pue.",
    "lat": 19.2842,
    "lng": -98.4357
  },
  "74": {
    "name": "Atlixco, Pue.",
    "lat": 18.908,
    "lng": -98.4325
  },
  "75": {
    "name": "Tehuacán, Pue.",
    "lat": 18.4633,
    "lng": -97.3917
  },
  "76": {
    "name": "Santiago de Querétaro / San Juan del Río, Qro.",
    "lat": 20.5888,
    "lng": -100.3899
  },
  "77": {
    "name": "Cancún / Playa del Carmen / Chetumal, Q.R.",
    "lat": 21.1619,
    "lng": -86.8515
  },
  "78": {
    "name": "San Luis Potosí Centro / Soledad, S.L.P.",
    "lat": 22.1565,
    "lng": -100.9855
  },
  "79": {
    "name": "Ciudad Valles / Matehuala, S.L.P.",
    "lat": 21.9867,
    "lng": -99.0147
  },
  "80": {
    "name": "Culiacán Rosales, Sin.",
    "lat": 24.8091,
    "lng": -107.394
  },
  "81": {
    "name": "Mazatlán, Sin.",
    "lat": 23.2494,
    "lng": -106.4111
  },
  "82": {
    "name": "Los Mochis, Sin.",
    "lat": 25.7905,
    "lng": -108.9959
  },
  "83": {
    "name": "Hermosillo, Son.",
    "lat": 29.0729,
    "lng": -110.9559
  },
  "84": {
    "name": "Ciudad Obregón / Navojoa, Son.",
    "lat": 27.4864,
    "lng": -109.9408
  },
  "85": {
    "name": "Nogales / San Luis Río Colorado, Son.",
    "lat": 31.3086,
    "lng": -110.9422
  },
  "86": {
    "name": "Villahermosa, Tab.",
    "lat": 17.9892,
    "lng": -92.9281
  },
  "87": {
    "name": "Ciudad Victoria, Tamps.",
    "lat": 23.7369,
    "lng": -99.1411
  },
  "88": {
    "name": "Nuevo Laredo / Reynosa / Matamoros, Tamps.",
    "lat": 27.4763,
    "lng": -99.5066
  },
  "89": {
    "name": "Tampico / Ciudad Madero, Tamps.",
    "lat": 22.2556,
    "lng": -97.8686
  },
  "90": {
    "name": "Tlaxcala de Xicohténcatl / Apizaco, Tlax.",
    "lat": 19.3182,
    "lng": -98.2375
  },
  "91": {
    "name": "Xalapa-Enríquez, Ver.",
    "lat": 19.5438,
    "lng": -96.9102
  },
  "92": {
    "name": "Poza Rica / Tuxpan, Ver.",
    "lat": 20.5332,
    "lng": -97.4595
  },
  "93": {
    "name": "Veracruz Puerto / Boca del Río, Ver.",
    "lat": 19.1738,
    "lng": -96.1342
  },
  "94": {
    "name": "Córdoba / Orizaba, Ver.",
    "lat": 18.8942,
    "lng": -96.9353
  },
  "96": {
    "name": "Coatzacoalcos / Minatitlán, Ver.",
    "lat": 18.1344,
    "lng": -94.4578
  },
  "97": {
    "name": "Mérida, Yuc.",
    "lat": 20.9674,
    "lng": -89.5926
  },
  "98": {
    "name": "Zacatecas / Guadalupe, Zac.",
    "lat": 22.7709,
    "lng": -102.5832
  },
  "99": {
    "name": "Fresnillo, Zac.",
    "lat": 23.1758,
    "lng": -102.8711
  },
  "01": {
    "name": "Álvaro Obregón, CDMX",
    "lat": 19.3588,
    "lng": -99.2122
  },
  "02": {
    "name": "Azcapotzalco, CDMX",
    "lat": 19.4913,
    "lng": -99.1823
  },
  "03": {
    "name": "Benito Juárez, CDMX",
    "lat": 19.3718,
    "lng": -99.1571
  },
  "04": {
    "name": "Coyoacán, CDMX",
    "lat": 19.3437,
    "lng": -99.1562
  },
  "05": {
    "name": "Cuajimalpa de Morelos, CDMX",
    "lat": 19.359,
    "lng": -99.292
  },
  "06": {
    "name": "Cuauhtémoc, CDMX",
    "lat": 19.4285,
    "lng": -99.155
  },
  "07": {
    "name": "Gustavo A. Madero, CDMX",
    "lat": 19.4917,
    "lng": -99.1168
  },
  "08": {
    "name": "Iztacalco, CDMX",
    "lat": 19.3961,
    "lng": -99.1004
  },
  "09": {
    "name": "Iztapalapa, CDMX",
    "lat": 19.3548,
    "lng": -99.0728
  }
};

// Specific exact postal codes for all 71 Jasman branches + high-density colonies
export const specificPostalCodes = {
  "11000": {
    "name": "Col. Lomas de Chapultepec, Miguel Hidalgo, CDMX",
    "lat": 19.421,
    "lng": -99.213
  },
  "11400": {
    "name": "Col. Popotla Miguel Hidalgo, Miguel Hidalgo, CDMX",
    "lat": 19.4525,
    "lng": -99.1795,
    "branchId": "mariano-escobedo",
    "branchName": "Jasman Automotriz - Suc. Mariano Escobedo"
  },
  "11580": {
    "name": "Col. Rincón Del Bosque Miguel Hidalgo, Miguel Hidalgo, CDMX",
    "lat": 19.431,
    "lng": -99.1835,
    "branchId": "polanco",
    "branchName": "Jasman Automotriz - Suc. Polanco"
  },
  "11800": {
    "name": "Col. San Miguel Chapultepec, Miguel Hidalgo, CDMX",
    "lat": 19.411,
    "lng": -99.189
  },
  "14000": {
    "name": "Col. Tlalpan Centro, Tlalpan, CDMX",
    "lat": 19.288,
    "lng": -99.168
  },
  "14200": {
    "name": "Col. Héroes De Padierna Tlalpan, Tlalpan, CDMX",
    "lat": 19.289,
    "lng": -99.217,
    "branchId": "ajusco",
    "branchName": "Jasman Automotriz - Suc. Ajusco"
  },
  "15530": {
    "name": "Col. Moctezuma 2A. Sección Venustiano Carranza, Venustiano Carranza, CDMX",
    "lat": 19.432,
    "lng": -99.091,
    "branchId": "aeropuerto",
    "branchName": "Jasman Automotriz - Suc. Aeropuerto"
  },
  "36250": {
    "name": "Col. Marfil Guanajuato, Guanajuato, Guanajuato",
    "lat": 21.011,
    "lng": -101.265,
    "branchId": "guanajuato",
    "branchName": "Jasman Automotriz - Suc. Guanajuato"
  },
  "36500": {
    "name": "Col. Centro Irapuato, Irapuato, Guanajuato",
    "lat": 20.678,
    "lng": -101.352,
    "branchId": "irapuato",
    "branchName": "Jasman Automotriz - Suc. Irapuato"
  },
  "36730": {
    "name": "Col. Las Granjas  Salamanca, Salamanca, Guanajuato",
    "lat": 20.572,
    "lng": -101.196,
    "branchId": "salamanca",
    "branchName": "Jasman Automotriz - Suc. Salamanca"
  },
  "37220": {
    "name": "Col. Fracc. Hidalgo  León de los Aldama, León de los Aldama, Guanajuato",
    "lat": 21.139,
    "lng": -101.685,
    "branchId": "hidalgo",
    "branchName": "Jasman Automotriz - Suc. Hidalgo"
  },
  "37290": {
    "name": "Col. Industrial Santa Julia De Jerez León de los Aldama, León de los Aldama, Guanajuato",
    "lat": 21.116,
    "lng": -101.642,
    "branchId": "morelos",
    "branchName": "Jasman Automotriz - Suc. Morelos"
  },
  "37440": {
    "name": "Col. Granjas Campestres León de los Aldama, León de los Aldama, Guanajuato",
    "lat": 21.109,
    "lng": -101.691,
    "branchId": "torres-landa",
    "branchName": "Jasman Automotriz - Suc. Torres Landa"
  },
  "38048": {
    "name": "Alameda, Celaya, Guanajuato",
    "lat": 20.528,
    "lng": -100.812,
    "branchId": "celaya",
    "branchName": "Jasman Automotriz - Suc. Celaya"
  },
  "42080": {
    "name": "Col. Santa Julia Pachuca De Soto, Pachuca de Soto, Hidaglo",
    "lat": 20.1085,
    "lng": -98.756,
    "branchId": "pachuca",
    "branchName": "Jasman Automotriz - Suc. Pachuca"
  },
  "44160": {
    "name": "Americana, Guadalajara, Jalisco",
    "lat": 20.672,
    "lng": -103.361,
    "branchId": "la-paz",
    "branchName": "Jasman Automotriz - Suc. La Paz"
  },
  "44600": {
    "name": "Col. Ladrón De Guevara Guadalajara, Guadalajara, Jalisco",
    "lat": 20.687,
    "lng": -103.374,
    "branchId": "americas",
    "branchName": "Jasman Automotriz - Suc. Américas"
  },
  "44610": {
    "name": "Lomas Del Country, Guadalajara, Jalisco",
    "lat": 20.702,
    "lng": -103.368,
    "branchId": "country-guadalajara",
    "branchName": "Jasman Automotriz - Suc. Country Guadalajara"
  },
  "44630": {
    "name": "4A Sección, Guadalajara, Jalisco",
    "lat": 20.698,
    "lng": -103.385,
    "branchId": "providencia",
    "branchName": "Jasman Automotriz - Suc. Providencia"
  },
  "44730": {
    "name": "La Penal, Guadalajara, Jalisco",
    "lat": 20.6695,
    "lng": -103.321,
    "branchId": "javier-mina",
    "branchName": "Jasman Automotriz - Suc. Javier Mina"
  },
  "44860": {
    "name": "Col. Jardines De La Paz Guadalajara, Guadalajara, Jalisco",
    "lat": 20.648,
    "lng": -103.309,
    "branchId": "revolucion-guadalajara",
    "branchName": "Jasman Automotriz - Suc. Revolución Guadalajara"
  },
  "44870": {
    "name": "Atlas, Guadalajara, Jalisco",
    "lat": 20.651,
    "lng": -103.332,
    "branchId": "gonzalez-gallo",
    "branchName": "Jasman Automotriz - Suc. Gonzalez Gallo"
  },
  "45030": {
    "name": "Col. Jardines De Guadalupe Zapopan, Zapopan, Jalisco",
    "lat": 20.669,
    "lng": -103.421,
    "branchId": "patria",
    "branchName": "Jasman Automotriz - Suc. Patria"
  },
  "50010": {
    "name": "Col. Guadalupe Club Jardín Toluca, Toluca, Edo. Méx.",
    "lat": 19.309,
    "lng": -99.645,
    "branchId": "toluca-1",
    "branchName": "Jasman Automotriz - Suc. Toluca 1"
  },
  "50130": {
    "name": "Col. Cuauhtemoc Toluca, Toluca, Edo. Méx.",
    "lat": 19.2815,
    "lng": -99.654,
    "branchId": "toluca-centro",
    "branchName": "Jasman Automotriz - Suc. Toluca Centro"
  },
  "52760": {
    "name": "Col. Centro Urbano San Fernando Huixquilucan, Naucalpan de Juárez, Edo. Méx.",
    "lat": 19.4015,
    "lng": -99.2785,
    "branchId": "interlomas",
    "branchName": "Jasman Automotriz - Suc. Interlomas"
  },
  "52970": {
    "name": "Col. Fracc. Las Alamedas Atizapán De Zaragoza, Atizapán de Zaragoza, Edo. Méx.",
    "lat": 19.5512,
    "lng": -99.2435,
    "branchId": "alamedas",
    "branchName": "Jasman Automotriz - Suc. Alamedas"
  },
  "52978": {
    "name": "Jardínez De Atizapan, Atizapán de Zaragoza, Edo. Méx.",
    "lat": 19.558,
    "lng": -99.249,
    "branchId": "alamedas-2",
    "branchName": "Jasman Automotriz - Suc. Alamedas 2"
  },
  "53120": {
    "name": "Col. Lomas Verdes Naucalpan De Juárez, Naucalpan de Juárez, Edo. Méx.",
    "lat": 19.5085,
    "lng": -99.2555,
    "branchId": "lomas-verdes",
    "branchName": "Jasman Automotriz - Suc. Lomas Verdes"
  },
  "53279": {
    "name": "Bosques De Moctezuma, Naucalpan de Juárez, Edo. Méx.",
    "lat": 19.476,
    "lng": -99.239,
    "branchId": "naucalpan",
    "branchName": "Jasman Automotriz - Suc. Naucalpan"
  },
  "54060": {
    "name": "Víveros Del Valle, Tlalnepantla De Baz, Edo. Méx.",
    "lat": 19.5385,
    "lng": -99.2135,
    "branchId": "tlalnepantla",
    "branchName": "Jasman Automotriz - Suc. Tlalnepantla"
  },
  "54800": {
    "name": "Col. Lázaro Cárdenas Cuautitlán Izcalli, Cuautitlán Izcalli, Edo. Méx.",
    "lat": 19.669,
    "lng": -99.187,
    "branchId": "cuautitlan",
    "branchName": "Jasman Automotriz - Suc. Cuautitlán"
  },
  "56110": {
    "name": "Col. San Mateo Texcoco, Texcoco, Edo. Méx.",
    "lat": 19.509,
    "lng": -98.879,
    "branchId": "texcoco",
    "branchName": "Jasman Automotriz - Suc. Texcoco"
  },
  "56120": {
    "name": "Col. San Juan De Dios Texcoco, Texcoco, Edo. Méx.",
    "lat": 19.514,
    "lng": -98.882,
    "branchId": "texcoco-allende",
    "branchName": "Jasman Automotriz - Suc. Texcoco Allende"
  },
  "56400": {
    "name": "Col. Floresta Los Reyes La Paz, Los Reyes La Paz, Edo. Méx.",
    "lat": 19.3615,
    "lng": -98.976,
    "branchId": "los-reyes",
    "branchName": "Jasman Automotriz - Suc. Los Reyes"
  },
  "56600": {
    "name": "Col. San Miguel Jacalones Chalco, Chalco, Edo. Méx.",
    "lat": 19.261,
    "lng": -98.898,
    "branchId": "chalco",
    "branchName": "Jasman Automotriz - Suc. Chalco"
  },
  "57170": {
    "name": "Col. Bosques De Aragón Nezahualcóyotl, Nezahualcóyotl, Edo. Méx.",
    "lat": 19.475,
    "lng": -99.052,
    "branchId": "aragon",
    "branchName": "Jasman Automotriz - Suc. Aragón"
  },
  "57700": {
    "name": "Col. Nueva Evolución Nezahualcóyotl, Nezahualcóyotl, Edo. Méx.",
    "lat": 19.401,
    "lng": -99.018,
    "branchId": "nezahualcoyotl",
    "branchName": "Jasman Automotriz - Suc. Nezahualcóyotl"
  },
  "58049": {
    "name": "Esquina Con Avenida Rector Hidalgo, Morelia, Michoacán",
    "lat": 19.691,
    "lng": -101.218,
    "branchId": "huertas",
    "branchName": "Jasman Automotriz - Suc. Huertas"
  },
  "58270": {
    "name": "Poblado Ocolusen, Morelia, Michoacán",
    "lat": 19.682,
    "lng": -101.162,
    "branchId": "camelinas",
    "branchName": "Jasman Automotriz - Suc. Camelinas"
  },
  "59600": {
    "name": "Col. Centro Zamora, Zamora, Michoacán",
    "lat": 19.985,
    "lng": -102.281,
    "branchId": "zamora-juarez",
    "branchName": "Jasman Automotriz - Suc. Zamora Juárez"
  },
  "60330": {
    "name": "Col. Santa Cecilia Los Reyes, Los Reyes, Michoacán",
    "lat": 19.587,
    "lng": -102.472,
    "branchId": "los-reyes-michoacan",
    "branchName": "Jasman Automotriz - Suc. Los Reyes Michoacán"
  },
  "62740": {
    "name": "Col. Centro Cuautla, Cuautla, Morelos",
    "lat": 18.815,
    "lng": -98.956,
    "branchId": "cuautla",
    "branchName": "Jasman Automotriz - Suc. Cuautla"
  },
  "63158": {
    "name": "Col. Caja De Agua Tepic, Tepic, Nayarit",
    "lat": 21.492,
    "lng": -104.897,
    "branchId": "tepic",
    "branchName": "Jasman Automotriz - Suc. Tepic"
  },
  "64108": {
    "name": "Col. Plutarco Elías Calles Monterrey, Monterrey, Nuevo León",
    "lat": 25.731,
    "lng": -100.379,
    "branchId": "lincoln",
    "branchName": "Jasman Automotriz - Suc. Lincoln"
  },
  "64290": {
    "name": "Col. Regina Monterrey, Monterrey, Nuevo León",
    "lat": 25.725,
    "lng": -100.315,
    "branchId": "universidad",
    "branchName": "Jasman Automotriz - Suc. Universidad"
  },
  "64800": {
    "name": "Col. Buenos Aires Monterrey, Monterrey, Nuevo León",
    "lat": 25.662,
    "lng": -100.285,
    "branchId": "chapultepec",
    "branchName": "Jasman Automotriz - Suc. Chapultepec"
  },
  "65410": {
    "name": "Col. Mariano Escobedo Monterrey, Monterrey, Nuevo León",
    "lat": 25.719,
    "lng": -100.301,
    "branchId": "abastos",
    "branchName": "Jasman Automotriz - Suc. Abastos"
  },
  "66220": {
    "name": "Col. Del Valle San Pedro Garza García, San Pedro Garza García, Nuevo León",
    "lat": 25.656,
    "lng": -100.375,
    "branchId": "valle",
    "branchName": "Jasman Automotriz - Suc. Valle"
  },
  "66420": {
    "name": "Col. Roble Norte San Nicolás De Los Garza, San Nicolás de los Garza, Nuevo León",
    "lat": 25.748,
    "lng": -100.292,
    "branchId": "san-nicolas",
    "branchName": "Jasman Automotriz - Suc. San Nicolás"
  },
  "67123": {
    "name": "Col. Linda Vista Guadalupe, Guadalupe, Nuevo León",
    "lat": 25.698,
    "lng": -100.262,
    "branchId": "linda-vista",
    "branchName": "Jasman Automotriz - Suc. Linda Vista"
  },
  "67190": {
    "name": "Col. 3 Caminos Guadalupe, Guadalupe, Nuevo León",
    "lat": 25.671,
    "lng": -100.241,
    "branchId": "primavera",
    "branchName": "Jasman Automotriz - Suc. Primavera"
  },
  "76000": {
    "name": "Casa Blanca, Santiago de Querétaro, Querétaro",
    "lat": 20.581,
    "lng": -100.395,
    "branchId": "constituyentes",
    "branchName": "Jasman Automotriz - Suc. Constituyentes"
  },
  "76030": {
    "name": "Col. El Carrizal Santiago de Querétaro, Santiago de Querétaro, Querétaro",
    "lat": 20.589,
    "lng": -100.405,
    "branchId": "queretaro",
    "branchName": "Jasman Automotriz - Suc. Querétaro"
  },
  "76047": {
    "name": "El Marques, Santiago de Querétaro, Querétaro",
    "lat": 20.591,
    "lng": -100.372,
    "branchId": "americas-qro",
    "branchName": "Jasman Automotriz - Suc. Américas Qro"
  },
  "76090": {
    "name": "Plazas Del Sol 2Da Secc, Santiago de Querétaro, Querétaro",
    "lat": 20.575,
    "lng": -100.365,
    "branchId": "mega-estadio",
    "branchName": "Jasman Automotriz - Suc. Mega Estadio"
  },
  "76127": {
    "name": "Centro, Santiago de Querétaro, Querétaro",
    "lat": 20.689,
    "lng": -100.441,
    "branchId": "juriquilla",
    "branchName": "Jasman Automotriz - Suc. Juriquilla"
  },
  "76800": {
    "name": "Ramos Millan, San Juan del Río, Querétaro",
    "lat": 20.387,
    "lng": -99.992,
    "branchId": "san-juan-del-rio",
    "branchName": "Jasman Automotriz - Suc. San Juan del Río"
  },
  "88000": {
    "name": "Col. Centro Nuevo Laredo, Nuevo Laredo, Tamaulipas",
    "lat": 27.489,
    "lng": -99.512,
    "branchId": "nuevo-laredo",
    "branchName": "Jasman Automotriz - Suc. Nuevo Laredo"
  },
  "03100": {
    "name": "Col. Del Valle Norte, Benito Juárez, CDMX",
    "lat": 19.386,
    "lng": -99.167
  },
  "03200": {
    "name": "Col. Del Valle Sur, Benito Juárez, CDMX",
    "lat": 19.369,
    "lng": -99.172
  },
  "03300": {
    "name": "Portales, Benito Juárez, CDMX",
    "lat": 19.371,
    "lng": -99.1455,
    "branchId": "portales",
    "branchName": "Jasman Automotriz - Suc. Portales"
  },
  "03600": {
    "name": "Col. Narvarte Benito Juárez, Benito Juárez, CDMX",
    "lat": 19.384,
    "lng": -99.1535,
    "branchId": "vertiz",
    "branchName": "Jasman Automotriz - Suc. Vertiz"
  },
  "03810": {
    "name": "Col. Nápoles, Benito Juárez, CDMX",
    "lat": 19.392,
    "lng": -99.177
  },
  "06000": {
    "name": "Col. Centro, Cuauhtémoc, CDMX",
    "lat": 19.4326,
    "lng": -99.1332
  },
  "06700": {
    "name": "Col. Roma Norte, Cuauhtémoc, CDMX",
    "lat": 19.418,
    "lng": -99.162
  },
  "06720": {
    "name": "Col. Roma Norte Cuauhtémoc, Cuauhtémoc, CDMX",
    "lat": 19.4165,
    "lng": -99.1635,
    "branchId": "yucatan",
    "branchName": "Jasman Automotriz - Suc. Yucatán"
  },
  "06100": {
    "name": "Col. Condesa, Cuauhtémoc, CDMX",
    "lat": 19.412,
    "lng": -99.173
  },
  "06850": {
    "name": "Col. Asturias Cuauhtémoc, Tlalpan, CDMX",
    "lat": 19.4075,
    "lng": -99.1345,
    "branchId": "chabacano",
    "branchName": "Jasman Automotriz - Suc. Chabacano"
  },
  "02710": {
    "name": "Col. San Pedro Xalpa  Azcapotzalco, Azcapotzalco, CDMX",
    "lat": 19.4913,
    "lng": -99.1985,
    "branchId": "azcapotzalco",
    "branchName": "Jasman Automotriz - Suc. Azcapotzalco"
  },
  "02460": {
    "name": "La Preciosa, Azcapotzalco, CDMX",
    "lat": 19.4795,
    "lng": -99.1912,
    "branchId": "azcapotzalco-2",
    "branchName": "Jasman Automotriz - Suc. Azcapotzalco 2"
  },
  "02000": {
    "name": "Col. Azcapotzalco Centro, Azcapotzalco, CDMX",
    "lat": 19.483,
    "lng": -99.185
  },
  "01000": {
    "name": "Col. San Ángel Inn Álvaro Obregón, Álvaro Obregón, CDMX",
    "lat": 19.3515,
    "lng": -99.191,
    "branchId": "revolucion",
    "branchName": "Jasman Automotriz - Suc. Revolución"
  },
  "01090": {
    "name": "Col. La Otra Banda Álvaro Obregón, Álvaro Obregón, CDMX",
    "lat": 19.3295,
    "lng": -99.2105,
    "branchId": "san-jeronimo",
    "branchName": "Jasman Automotriz - Suc. San Jerónimo"
  },
  "01330": {
    "name": "Col. Paseo De Las Lomas Álvaro Obregón, Álvaro Obregón, CDMX",
    "lat": 19.378,
    "lng": -99.2515,
    "branchId": "santa-fe",
    "branchName": "Jasman Automotriz - Suc. Santa Fe"
  },
  "01780": {
    "name": "Olivar de los Padres, Alvaro Obregon, CDMX",
    "lat": 19.3365,
    "lng": -99.227,
    "branchId": "av-toluca",
    "branchName": "Jasman Automotriz - Suc. Av Toluca"
  },
  "04000": {
    "name": "Col. Coyoacán Centro, Coyoacán, CDMX",
    "lat": 19.349,
    "lng": -99.162
  },
  "04890": {
    "name": "Col. Jardines De Coyoacán Coyoacán, Coyoacán, CDMX",
    "lat": 19.314,
    "lng": -99.1305,
    "branchId": "miramontes",
    "branchName": "Jasman Automotriz - Suc. Miramontes"
  },
  "04700": {
    "name": "Col. Insurgentes Cuicuilco, Coyoacán, CDMX",
    "lat": 19.305,
    "lng": -99.182
  },
  "02600": {
    "name": "Col. Defensores De La Republica Gustavo A. Madero, Gustavo A. Madero, CDMX",
    "lat": 19.4715,
    "lng": -99.147,
    "branchId": "vallejo",
    "branchName": "Jasman Automotriz - Suc. Vallejo"
  },
  "07000": {
    "name": "Col. Villa Gustavo A. Madero, GAM, CDMX",
    "lat": 19.488,
    "lng": -99.115
  },
  "07300": {
    "name": "Col. Lindavista, GAM, CDMX",
    "lat": 19.489,
    "lng": -99.129
  },
  "08400": {
    "name": "Col. Granjas México Iztacalco, Iztacalco, CDMX",
    "lat": 19.398,
    "lng": -99.1025,
    "branchId": "iztacalco",
    "branchName": "Jasman Automotriz - Suc. Iztacalco"
  },
  "09310": {
    "name": "Col. Central De Abastos Iztapalapa, Iztapalapa, CDMX",
    "lat": 19.3725,
    "lng": -99.0915,
    "branchId": "central-de-abastos",
    "branchName": "Jasman Automotriz - Suc. Central De Abastos"
  },
  "09700": {
    "name": "Col. Santa Cruz Meyehualco Iztapalapa, Iztapalapa, CDMX",
    "lat": 19.353,
    "lng": -99.062,
    "branchId": "iztapalapa",
    "branchName": "Jasman Automotriz - Suc. Iztapalapa"
  }
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
 * 1. Checks specific exact table (all 71 Jasman branch CPs + high density colonies)
 * 2. Checks 2-digit prefix centroid (covers all 16 CDMX alcaldías + 32 states nationwide)
 * 3. Asynchronously attempts OpenStreetMap Nominatim for nationwide coverage
 */
export async function resolvePostalCodeCoords(postalCode) {
  const clean = String(postalCode || '').trim().padStart(5, '0');

  // 1. Direct specific hit (exact branch location or colony)
  if (specificPostalCodes[clean]) {
    return {
      cp: clean,
      ...specificPostalCodes[clean],
      isExact: true,
    };
  }

  // 2. Centroid prefix hit (SEPOMEX state / alcaldía range)
  const prefix2 = clean.slice(0, 2);
  if (postalCodeCentroids[prefix2]) {
    const centroid = postalCodeCentroids[prefix2];
    // Slightly interpolate by 3rd and 4th digits for micro-differentiation
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
    name: `C.P. ${clean} (México)`,
    lat: 19.4326,
    lng: -99.1332,
    isExact: false,
  };
}

/**
 * Find closest branches to given coordinates
 */
export function getClosestBranches(lat, lng, limit = 4, customList = null) {
  const source = (customList && customList.length > 0) ? customList : sucursalesWithCoords;
  const list = source.map(branch => {
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
