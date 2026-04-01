/* ═══ Real Jasman branches from corporate spreadsheet ═══ */

const buildWhatsApp = (phone, branchName) => {
  if (!phone) return null;
  const clean = phone.replace(/[\s\-()]/g, '');
  const num = clean.startsWith('52') ? clean : (clean.startsWith('+52') ? clean.slice(1) : `52${clean}`);
  const msg = encodeURIComponent(`SW -Hola quisiera más información de sus servicios automotrices en su sucursal "${branchName}"`);
  return `https://api.whatsapp.com/send/?phone=${num}&text=${msg}`;
};

const raw = [
  { region:'Norte', name:'Alamedas 2', state:'Edo. Méx.', city:'Atizapán de Zaragoza', address:'Blvd. Adolfo López Mateos No.96, Jardines De Atizapán, Atizapán De Zaragoza, Edo. Mex. 52978', cp:'52978', phone:'55 4761 1468' },
  { region:'Norte', name:'Alamedas', state:'Edo. Méx.', city:'Atizapán de Zaragoza', address:'Blvd. Adolfo Ruiz Cortines #26, Fracc. Las Alamedas, Atizapán De Zaragoza, Edo. Méx. 52970', cp:'52970', phone:'5554538961' },
  { region:'Norte', name:'Azcapotzalco', state:'CDMX', city:'Azcapotzalco', address:'San Isidro #260 Esq. Santiago Ahuizotla, Col. San Pedro Xalpa, Azcapotzalco, CDMX 02710', cp:'02710', phone:'5591087168' },
  { region:'Norte', name:'Azcapotzalco 2', state:'CDMX', city:'Azcapotzalco', address:'Aquiles Serdan No. 282, La Preciosa, Azcapotzalco, CDMX, 02460', cp:'02460', phone:'5547615234' },
  { region:'Norte', name:'Cuautitlán', state:'Edo. Méx.', city:'Cuautitlán Izcalli', address:'Carr. Cuautitlán-Melchor Ocampo #10, Col. Lázaro Cárdenas, Cuautitlán Izcalli, Edo. Méx. 54800', cp:'54800', phone:'5543511367' },
  { region:'Norte', name:'Lomas Verdes', state:'Edo. Méx.', city:'Naucalpan de Juárez', address:'Av. Lomas Verdes #407, Col. Lomas Verdes, Naucalpan De Juárez, Edo. Méx. 53120', cp:'53120', phone:'5554539017' },
  { region:'Norte', name:'Naucalpan', state:'Edo. Méx.', city:'Naucalpan de Juárez', address:'Av. Adolfo Lopez Mateos No.15, Bosques De Moctezuma, Naucalpan De Juárez, Edo. Mex. 53279', cp:'53279', phone:'5562948747' },
  { region:'Norte', name:'Pachuca', state:'Hidalgo', city:'Pachuca de Soto', address:'Av. Alta Tensión #109, Col. Santa Julia, Pachuca De Soto, Hidalgo 42080', cp:'42080', phone:'5543754384' },
  { region:'Norte', name:'Tlalnepantla', state:'Edo. Méx.', city:'Tlalnepantla De Baz', address:'Viveros De La Hacienda No.12, Víveros Del Valle, Tlalnepantla, Edo. Mex. 54060', cp:'54060', phone:'5525882028' },
  { region:'Norte', name:'Vallejo', state:'CDMX', city:'Gustavo A. Madero', address:'Calz. Vallejo #497, Col. Defensores De La Republica, Gustavo A. Madero, CDMX 02600', cp:'02600', phone:'55 4822 1319' },
  { region:'Poniente', name:'Santa Fe', state:'CDMX', city:'Álvaro Obregón', address:'Prolongación Paseo De La Reforma #71, Col. Paseo De Las Lomas, Álvaro Obregón, CDMX 01330', cp:'01330', phone:'5580226602' },
  { region:'Poniente', name:'Mariano Escobedo', state:'CDMX', city:'Miguel Hidalgo', address:'Mariano Escobedo #18, Col. Popotla, Miguel Hidalgo, CDMX 11400', cp:'11400', phone:'5543931885' },
  { region:'Poniente', name:'Interlomas', state:'Edo. Méx.', city:'Naucalpan de Juárez', address:'Circuito Empresarial #4, Col. Centro Urbano San Fernando, Huixquilucan, Edo. Méx. 52760', cp:'52760', phone:'5580401611' },
  { region:'Poniente', name:'Yucatán', state:'CDMX', city:'Cuauhtémoc', address:'Av. Yucatán #42, Col. Roma Norte, Cuauhtémoc, CDMX 06720', cp:'06720', phone:'5539612500' },
  { region:'Poniente', name:'Polanco', state:'CDMX', city:'Miguel Hidalgo', address:'Av. Mariano Escobedo #551, Col. Rincón Del Bosque, Miguel Hidalgo, CDMX 11580', cp:'11580', phone:'5548006110' },
  { region:'Poniente', name:'Toluca 1', state:'Edo. Méx.', city:'Toluca', address:'Filiberto Gómez #601, Col. Guadalupe Club Jardín, Toluca, Edo. Méx. 50010', cp:'50010', phone:'5560918271' },
  { region:'Poniente', name:'Toluca Centro', state:'Edo. Méx.', city:'Toluca', address:'Av. Pino Suarez #800, Col. Cuauhtémoc, Toluca, Edo. Méx. 50130', cp:'50130', phone:'5591096025' },
  { region:'Sur', name:'Chabacano', state:'CDMX', city:'Cuauhtémoc', address:'Oriente 67-A #2803 Esq. Eje 3 Sur, Col. Asturias, Cuauhtémoc, CDMX 06850', cp:'06850', phone:'55 4350 0820' },
  { region:'Sur', name:'Revolución', state:'CDMX', city:'Álvaro Obregón', address:'María Luisa #5 Esq. Revolución, Col. San Ángel Inn, Álvaro Obregón, CDMX 01000', cp:'01000', phone:'5554539521' },
  { region:'Sur', name:'Ajusco', state:'CDMX', city:'Tlalpan', address:'Carr. Picacho Ajusco #732, Col. Héroes De Padierna, Tlalpan, CDMX 14200', cp:'14200', phone:'5543778228' },
  { region:'Sur', name:'Vertiz', state:'CDMX', city:'Benito Juárez', address:'Dr. José María Vertiz #1195, Col. Narvarte, Benito Juárez, CDMX 03600', cp:'03600', phone:'55 4808 6066' },
  { region:'Sur', name:'San Jerónimo', state:'CDMX', city:'Álvaro Obregón', address:'Av. San Jerónimo #630, Col. La Otra Banda, Álvaro Obregón, CDMX 01090', cp:'01090', phone:'5517988763' },
  { region:'Sur', name:'Portales', state:'CDMX', city:'Benito Juárez', address:'Eje Central Lazaro Cardenas No.309, Portales, Benito Juárez, CDMX 03300', cp:'03300', phone:'5546093880' },
  { region:'Sur', name:'Miramontes', state:'CDMX', city:'Coyoacán', address:'Agave #2 Esq. Canal De Miramontes, Col. Jardines De Coyoacán, Coyoacán, CDMX 04890', cp:'04890', phone:'5543508755' },
  { region:'Sur', name:'Av Toluca', state:'CDMX', city:'Álvaro Obregón', address:'Av Toluca 223, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX', cp:'01780', phone:'55 7961 8368' },
  { region:'Oriente', name:'Cuautla', state:'Morelos', city:'Cuautla', address:'San Martin #45, Col. Centro, Cuautla, Morelos 62740', cp:'62740', phone:'' },
  { region:'Oriente', name:'Aeropuerto', state:'CDMX', city:'Venustiano Carranza', address:'Oriente 138 #139 Esq. Norte 1, Col. Moctezuma 2A. Sección, Venustiano Carranza, CDMX 15530', cp:'15530', phone:'55 2241 4093' },
  { region:'Oriente', name:'Texcoco Allende', state:'Edo. Méx.', city:'Texcoco', address:'Ignacio Allende #310, Col. San Juan De Dios, Texcoco, Edo. Méx. 56120', cp:'56120', phone:'55 4940 1859' },
  { region:'Oriente', name:'Texcoco', state:'Edo. Méx.', city:'Texcoco', address:'Fray Pedro De Gante #413, Col. San Mateo, Texcoco, Edo. Méx. 56110', cp:'56110', phone:'5548336141' },
  { region:'Oriente', name:'Central De Abastos', state:'CDMX', city:'Iztapalapa', address:'Embarcadero #19 Esq. Marcelino Buendía, Col. Central De Abastos, Iztapalapa, CDMX 09310', cp:'09310', phone:'55 4800 6195' },
  { region:'Oriente', name:'Iztapalapa', state:'CDMX', city:'Iztapalapa', address:'Calz. Ermita Iztapalapa #1613, Col. Santa Cruz Meyehualco, Iztapalapa, CDMX 09700', cp:'09700', phone:'5522430313' },
  { region:'Oriente', name:'Iztacalco', state:'CDMX', city:'Iztacalco', address:'Av. Te Esq. Trigo #61, Col. Granjas México, Iztacalco, CDMX 08400', cp:'08400', phone:'5547591996' },
  { region:'Oriente', name:'Nezahualcóyotl', state:'Edo. Méx.', city:'Nezahualcóyotl', address:'Av. Sor Juana Inés De La Cruz #283, Col. Nueva Evolución, Nezahualcóyotl, Edo. Méx. 57700', cp:'57700', phone:'5543511137' },
  { region:'Oriente', name:'Los Reyes', state:'Edo. Méx.', city:'Los Reyes La Paz', address:'Av. San Francisco #131, Col. Floresta, Los Reyes La Paz, Edo. Méx. 56400', cp:'56400', phone:'5543501609' },
  { region:'Oriente', name:'Chalco', state:'Edo. Méx.', city:'Chalco', address:'Av. Cuauhtémoc S/N, Col. San Miguel Jacalones, Chalco, Edo. Méx. 56600', cp:'56600', phone:'5543513079' },
  { region:'Oriente', name:'Aragón', state:'Edo. Méx.', city:'Nezahualcóyotl', address:'Av. Central #259, Col. Bosques De Aragón, Nezahualcóyotl, Edo. Méx. 57170', cp:'57170', phone:'5554579424' },
  { region:'Bajio', name:'Salamanca', state:'Guanajuato', city:'Salamanca', address:'Hortaliza #207, Col. Las Granjas, Salamanca, Guanajuato 36730', cp:'36730', phone:'464 640 3187' },
  { region:'Bajio', name:'Guanajuato', state:'Guanajuato', city:'Guanajuato', address:'Carr. Guanajuato-Juventino Rosas Km. 5, Col. Marfil, Guanajuato, Guanajuato 36250', cp:'36250', phone:'4773266372' },
  { region:'Bajio', name:'Torres Landa', state:'Guanajuato', city:'León de los Aldama', address:'Blvd. Juan José Torres Landa #3404 Poniente, Col. Granjas Campestres, León de los Aldama, Guanajuato 37440', cp:'37440', phone:'4731201847' },
  { region:'Bajio', name:'Morelos', state:'Guanajuato', city:'León de los Aldama', address:'Blvd. José María Morelos #3631-Bis, Col. Industrial Santa Julia De Jerez, León de los Aldama, Guanajuato 37290', cp:'37290', phone:'4731201838' },
  { region:'Bajio', name:'Hidalgo', state:'Guanajuato', city:'León de los Aldama', address:'Blvd. Hidalgo #1114, Col. Fracc. Hidalgo, León de los Aldama, Guanajuato 37220', cp:'37220', phone:'4731201905' },
  { region:'Bajio', name:'Irapuato', state:'Guanajuato', city:'Irapuato', address:'Blvd. Díaz Ordaz Esq. 16 De Septiembre, Col. Centro, Irapuato, Guanajuato 36500', cp:'36500', phone:'4621530279' },
  { region:'Guadalajara', name:'Country Guadalajara', state:'Jalisco', city:'Guadalajara', address:'Av. Circunvalación Jorge Álvarez Del Castillo 1406, Lomas Del Country, Guadalajara, Jalisco 44610', cp:'44610', phone:'3321845411' },
  { region:'Guadalajara', name:'Tepic', state:'Nayarit', city:'Tepic', address:'Blvd. Tepic-Xalisco Km. 1 #115, Col. Caja De Agua, Tepic, Nayarit 63158', cp:'63158', phone:'3313329749' },
  { region:'Guadalajara', name:'Revolución Guadalajara', state:'Jalisco', city:'Guadalajara', address:'Av. Revolución #2585, Col. Jardines De La Paz, Guadalajara, Jalisco 44860', cp:'44860', phone:'3313416363' },
  { region:'Guadalajara', name:'Patria', state:'Jalisco', city:'Zapopan', address:'Av. Patria #613, Col. Jardines De Guadalupe, Zapopan, Jalisco 45030', cp:'45030', phone:'3313297348' },
  { region:'Guadalajara', name:'Gonzalez Gallo', state:'Jalisco', city:'Guadalajara', address:'Calzada González Gallo No. 1991, Atlas, Guadalajara, Jalisco 44870', cp:'44870', phone:'3321727072' },
  { region:'Guadalajara', name:'Javier Mina', state:'Jalisco', city:'Guadalajara', address:'Av. Francisco Javier Mina N° 1395, La Penal, 44730 Guadalajara, Jal.', cp:'44730', phone:'3313378900' },
  { region:'Guadalajara', name:'Américas', state:'Jalisco', city:'Guadalajara', address:'Av. Américas #121, Col. Ladrón De Guevara, Guadalajara, Jalisco 44600', cp:'44600', phone:'3313369157' },
  { region:'Guadalajara', name:'La Paz', state:'Jalisco', city:'Guadalajara', address:'Av. De La Paz 1490, Americana, Guadalajara, Jalisco 44160', cp:'44160', phone:'3321848809' },
  { region:'Guadalajara', name:'Providencia', state:'Jalisco', city:'Guadalajara', address:'Av Pablo Neruda 3051, 4A Sección, Guadalajara, Jalisco 44630', cp:'44630', phone:'3321541777' },
  { region:'Monterrey', name:'Nuevo Laredo', state:'Tamaulipas', city:'Nuevo Laredo', address:'Héroe De Nacataz S/N, Col. Centro, Nuevo Laredo, Tamaulipas 88000', cp:'88000', phone:'8118151950' },
  { region:'Monterrey', name:'Valle', state:'Nuevo León', city:'San Pedro Garza García', address:'Av. Vasconcelos #401-A, Col. Del Valle, San Pedro Garza García, Nuevo León 66220', cp:'66220', phone:'8128613469' },
  { region:'Monterrey', name:'Primavera', state:'Nuevo León', city:'Guadalupe', address:'Av. Primavera No. 400, Col. 3 Caminos, Guadalupe, Nuevo León 67190', cp:'67190', phone:'8128613463' },
  { region:'Monterrey', name:'Linda Vista', state:'Nuevo León', city:'Guadalupe', address:'Av. Miguel Alemán #4418 Ote., Col. Linda Vista, Guadalupe, Nuevo León 67123', cp:'67123', phone:'8128612747' },
  { region:'Monterrey', name:'Abastos', state:'Nuevo León', city:'Monterrey', address:'Av. Los Ángeles #2200, Col. Mariano Escobedo, Monterrey, Nuevo León 65410', cp:'65410', phone:'8128613465' },
  { region:'Monterrey', name:'San Nicolás', state:'Nuevo León', city:'San Nicolás de los Garza', address:'Av. Fray Bartolomé De Las Casas #107, Col. Roble Norte, San Nicolás De Los Garza, Nuevo León 66420', cp:'66420', phone:'8128613441' },
  { region:'Monterrey', name:'Chapultepec', state:'Nuevo León', city:'Monterrey', address:'Av. Chapultepec #1707, Col. Buenos Aires, Monterrey, Nuevo León 64800', cp:'64800', phone:'8128612734' },
  { region:'Monterrey', name:'Universidad', state:'Nuevo León', city:'Monterrey', address:'Av. Alfonso Reyes #3339, Col. Regina, Monterrey, Nuevo León 64290', cp:'64290', phone:'8128613474' },
  { region:'Monterrey', name:'Lincoln', state:'Nuevo León', city:'Monterrey', address:'Av. Abraham Lincoln #7305, Col. Plutarco Elías Calles, Monterrey, Nuevo León 64108', cp:'64108', phone:'8128613458' },
  { region:'Queretaro', name:'Querétaro', state:'Querétaro', city:'Santiago de Querétaro', address:'Ezequiel Montes #164 Sur, Col. El Carrizal, Santiago de Querétaro, Querétaro 76030', cp:'76030', phone:'442 491 5515' },
  { region:'Queretaro', name:'Constituyentes', state:'Querétaro', city:'Santiago de Querétaro', address:'Av. Constituyentes 222 Pte, Casa Blanca, Santiago De Querétaro, Querétaro 76000', cp:'76000', phone:'4423945995' },
  { region:'Queretaro', name:'Américas Qro', state:'Querétaro', city:'Santiago de Querétaro', address:'Av Constituyentes Ote. 54, El Marques, Santiago De Querétaro, Querétaro 76047', cp:'76047', phone:'4421904829' },
  { region:'Queretaro', name:'Mega Estadio', state:'Querétaro', city:'Santiago de Querétaro', address:'Av. Luis Vega Monrroy 1300-Local 12, Plazas Del Sol 2Da Secc, Santiago De Querétaro, Querétaro 76090', cp:'76090', phone:'4423130977' },
  { region:'Queretaro', name:'Juriquilla', state:'Querétaro', city:'Santiago de Querétaro', address:'P.º De La República Km 10+400, Centro, Santiago De Querétaro, Querétaro 76127', cp:'76127', phone:'4424790735' },
  { region:'Queretaro', name:'San Juan del Río', state:'Querétaro', city:'San Juan del Río', address:'Panamericana 75, Ramos Millan, San Juan Del Río, Querétaro 76800', cp:'76800', phone:'4421904882' },
  { region:'Queretaro', name:'Celaya', state:'Guanajuato', city:'Celaya', address:'Aguilar Y Maya 110-Pte, Alameda, Celaya, Guanajuato 38048', cp:'38048', phone:'4424790761' },
  { region:'Michoacan', name:'Camelinas', state:'Michoacán', city:'Morelia', address:'Periferico Paseo De La Republica No. 3255, Poblado Ocolusen, Morelia, Michoacán 58270', cp:'58270', phone:'4433958945' },
  { region:'Michoacan', name:'Huertas', state:'Michoacán', city:'Morelia', address:'Calle Ganadería De Atenco No. 246 A, Esq. Con Av. Rector Hidalgo, Fracc. Jardínes Del Toreo, Morelia, Michoacán 58049', cp:'58049', phone:'443 471 9777' },
  { region:'Michoacan', name:'Los Reyes Michoacán', state:'Michoacán', city:'Los Reyes', address:'Av. San Juan S/N Esq. Uriel Bravo, Col. Santa Cecilia, Los Reyes, Michoacán 60330', cp:'60330', phone:'3541001708' },
  { region:'Michoacan', name:'Zamora Juárez', state:'Michoacán', city:'Zamora', address:'Av. Juárez #57 Oriente, Col. Centro, Zamora, Michoacán 59600', cp:'59600', phone:'3316130840' },
];

const toSlug = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const sucursales = raw.map(b => {
  const fullName = `Jasman Automotriz - Suc. ${b.name}`;
  return {
    id: toSlug(b.name),
    region: b.region,
    name: b.name,
    fullName,
    state: b.state,
    city: b.city,
    address: b.address,
    cp: b.cp,
    phone: b.phone,
    whatsappUrl: b.phone ? buildWhatsApp(b.phone, fullName) : null,
    mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(b.address)}`,
  };
});

export const regions = [...new Set(raw.map(b => b.region))];
export const states = [...new Set(raw.map(b => b.state))];
export const cities = [...new Set(raw.map(b => b.city))];

export default sucursales;
