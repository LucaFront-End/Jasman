/**
 * legalPoliciesData.js
 * Configuración e información oficial de políticas legales para Jasman Automotriz y Jasman TIRES,
 * conectadas dinámicamente a Wix CMS con respaldo local completo conforme a la legislación mexicana.
 */

export const LEGAL_POLICIES_CONFIG = {
  privacy: {
    key: 'privacy',
    collection: 'AvisoDePrivacidad',
    path: '/aviso-de-privacidad',
    aliasPaths: [
      '/politica-de-privacidad',
      '/privacidad',
      '/avisodeprivacidad',
      '/legal/privacidad',
      '/politicas/privacidad',
    ],
    label: 'Aviso de Privacidad',
    tag: 'PROTECCIÓN DE DATOS PERSONALES (LFPDPPP)',
    metaTitle: 'Aviso de Privacidad Integral | JASMAN Automotriz',
    metaDesc:
      'Consulta el Aviso de Privacidad Integral de JASMAN Automotriz conforme a la LFPDPPP. Conoce cómo protegemos tus datos personales y cómo ejercer tus derechos ARCO.',
    lastUpdated: '2026-11-27',
  },
  terms: {
    key: 'terms',
    collection: 'TerminosYCondiciones',
    path: '/terminos-y-condiciones',
    aliasPaths: [
      '/terminos',
      '/terminosycondiciones',
      '/terminosycondciones',
      '/términosycondciones',
      '/legal/terminos',
      '/politicas/terminos',
    ],
    label: 'Términos y Condiciones',
    tag: 'CONDICIONES DE SERVICIO, TALLER & TIENDA EN LÍNEA',
    metaTitle: 'Términos y Condiciones de Uso y Compra | JASMAN Automotriz',
    metaDesc:
      'Términos y Condiciones generales de uso, compra de llantas en línea, citas de taller mecánico, promociones y facturación CFDI en JASMAN Automotriz.',
    lastUpdated: '2026-11-27',
  },
  refund: {
    key: 'refund',
    collection: 'PoliticaDeReembolsos',
    path: '/politica-de-reembolso',
    aliasPaths: [
      '/politica-de-reembolsos',
      '/politica-de-devoluciones',
      '/reembolsos',
      '/devoluciones',
      '/garantias',
      '/legal/reembolsos',
      '/politicas/reembolsos',
    ],
    label: 'Política de Devoluciones y Garantías',
    tag: 'GARANTÍA JASMAN, CAMBIOS & REEMBOLSOS',
    metaTitle: 'Política de Devoluciones, Reembolsos y Garantías | JASMAN',
    metaDesc:
      'Conoce la Política de Devoluciones, Reembolsos y Garantías por escrito en llantas y servicios automotrices de JASMAN Automotriz en México.',
    lastUpdated: '2026-11-27',
  },
  shipping: {
    key: 'shipping',
    collection: 'PoliticaDeEnvios',
    path: '/politica-de-envios',
    aliasPaths: [
      '/politica-de-envio',
      '/envios',
      '/legal/envios',
      '/politicas/envios',
    ],
    label: 'Política de Envíos',
    tag: 'COBERTURA NACIONAL DE LLANTAS EN MÉXICO',
    metaTitle: 'Política de Envíos y Entregas a Todo México | JASMAN TIRES',
    metaDesc:
      'Consulta cobertura nacional, tiempos de entrega de 3 a 5 días hábiles, rastreo de guías y opciones de instalación en las +80 sucursales JASMAN.',
    lastUpdated: '2026-11-27',
  },
};

export const DEFAULT_LEGAL_SUBTITLE =
  'Jasman Automotriz · Más de 60 años y +80 sucursales en México brindando transparencia, seguridad y garantía por escrito.';

export const DEFAULT_LEGAL_CONTENT = {
  // ─── 1. AVISO DE PRIVACIDAD ──────────────────────────────────────────────
  privacy: `
    <h2>1. Identidad y Domicilio del Responsable</h2>
    <p>
      <strong>Talleres Automotrices Jasman</strong> (en lo sucesivo <strong>"Jasman Automotriz"</strong>), con presencia nacional en la República Mexicana y portal web oficial <a href="https://www.jasman.com.mx">www.jasman.com.mx</a>, es responsable del uso, tratamiento y protección de sus datos personales, en estricto cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, su Reglamento y los Lineamientos del Aviso de Privacidad vigentes en México.
    </p>

    <h2>2. Datos Personales que Recabamos</h2>
    <p>
      Para cumplir con las finalidades descritas en el presente Aviso de Privacidad, recabamos de forma directa a través de nuestro sitio web, tienda en línea de llantas, chat en vivo, WhatsApp oficial, centro de atención telefónica y sucursales los siguientes datos:
    </p>
    <ul>
      <li><strong>Datos de identificación y contacto:</strong> Nombre completo, número telefónico o celular (WhatsApp), correo electrónico, código postal, ciudad/estado y domicilio completo de entrega.</li>
      <li><strong>Datos del vehículo para servicio o cotización:</strong> Marca, submarca/modelo, año, kilometraje aproximado, placas de circulación (en órdenes de servicio en sucursal) y medida de neumáticos.</li>
      <li><strong>Datos fiscales y de facturación:</strong> Razón social o nombre fiscal, Registro Federal de Contribuyentes (RFC), régimen fiscal, código postal fiscal, uso de CFDI y Constancia de Situación Fiscal.</li>
      <li><strong>Datos transaccionales:</strong> Historial de pedidos, folios de citas y método de pago seleccionado. <em>Importante: Los datos sensibles de tarjetas bancarias y códigos de seguridad (CVV) son procesados directamente mediante pasarelas de pago certificadas bajo el estándar internacional PCI-DSS en <strong>checkout.jasman.com.mx</strong>; Jasman Automotriz no almacena números completos de tarjetas ni códigos CVV en sus bases de datos.</em></li>
    </ul>

    <h2>3. Finalidades del Tratamiento de sus Datos</h2>
    <p>
      Sus datos personales serán tratados para las siguientes finalidades:
    </p>
    <ul>
      <li><strong>Finalidades Primarias (necesarias para la relación comercial y de servicio):</strong>
        <ul>
          <li>Procesar, surtir, facturar y enviar a domicilio las órdenes de compra de llantas realizadas en nuestra tienda en línea.</li>
          <li>Registrar, confirmar y dar seguimiento a sus citas de servicio mecánico automotriz en cualquiera de nuestras +80 sucursales.</li>
          <li>Elaborar presupuestos, diagnósticos técnicos, pólizas de garantía por escrito y bitácoras de mantenimiento vehicular.</li>
          <li>Brindar asesoría técnica personalizada mediante nuestro Chat en Vivo, WhatsApp oficial, teléfono <strong>800 8010 290</strong> y correo electrónico.</li>
          <li>Atender solicitudes de cambios, devoluciones, garantías o aclaraciones, así como emitir comprobantes fiscales digitales (CFDI 4.0).</li>
        </ul>
      </li>
      <li><strong>Finalidades Secundarias (opcionales):</strong>
        <ul>
          <li>Enviarle promociones vigentes, cupones de descuento, lanzamientos de marcas de neumáticos y recordatorios preventivos de mantenimiento (alineación, balanceo, afinación o frenos).</li>
          <li>Realizar encuestas de satisfacción y mejora continua del servicio a través del programa <em>Jasman Te Escucha</em>.</li>
        </ul>
      </li>
    </ul>
    <p>
      Si usted no desea que sus datos personales sean tratados para las finalidades secundarias, puede manifestarlo en cualquier momento enviando un correo a <a href="mailto:jasmanonline@jasman.com.mx">jasmanonline@jasman.com.mx</a>.
    </p>

    <h2>4. Transferencia de Datos Personales</h2>
    <p>
      Jasman Automotriz no vende, alquila ni cede sus datos personales a terceros ajenos. Únicamente compartimos la información estrictamente indispensable con:
    </p>
    <ul>
      <li><strong>Empresas de paquetería y logística nacional:</strong> Para efectuar la entrega física de sus llantas en el domicilio indicado y generar guías de rastreo.</li>
      <li><strong>Instituciones financieras y procesadores de pago certificados:</strong> Para validar y liquidar las transacciones realizadas en línea.</li>
      <li><strong>Fabricantes de neumáticos o autopartes (solo en trámites de garantía):</strong> Cuando resulte necesario dictaminar técnicamente una garantía de fábrica.</li>
      <li><strong>Autoridades competentes y fiscales (SAT):</strong> En cumplimiento de obligaciones legales y tributarias aplicables.</li>
    </ul>

    <h2>5. Ejercicio de Derechos ARCO y Revocación del Consentimiento</h2>
    <p>
      Usted tiene derecho en todo momento a conocer qué datos personales tenemos de usted (<strong>Acceso</strong>), solicitar su corrección o actualización (<strong>Rectificación</strong>), pedir su eliminación cuando considere que no se utilizan conforme a la ley (<strong>Cancelación</strong>) u oponerse a su tratamiento para fines específicos (<strong>Oposición</strong>).
    </p>
    <p>
      Para ejercer sus Derechos ARCO o revocar su consentimiento, envíe su solicitud a <a href="mailto:jasmanonline@jasman.com.mx">jasmanonline@jasman.com.mx</a> indicando: (1) nombre completo del titular y medio para recibir respuesta, (2) copia de una identificación oficial vigente, y (3) descripción clara de los datos y del derecho que desea ejercer. Daremos respuesta en un plazo máximo de <strong>20 días hábiles</strong> conforme a la LFPDPPP.
    </p>

    <h2>6. Uso de Cookies y Tecnologías de Análisis</h2>
    <p>
      Nuestro sitio utiliza cookies técnicas, almacenamiento local y herramientas analíticas para conservar los artículos en su carrito de llantas, mantener activa su sesión de cliente, ubicar su sucursal Jasman más cercana y medir el desempeño de nuestras campañas digitales. Usted puede deshabilitar o borrar las cookies desde la configuración de su navegador en cualquier momento.
    </p>

    <h2>7. Cambios al Aviso de Privacidad</h2>
    <p>
      Cualquier actualización o modificación al presente Aviso de Privacidad derivada de reformas legales o mejoras en nuestros servicios será publicada de manera permanente en <a href="https://www.jasman.com.mx/aviso-de-privacidad">www.jasman.com.mx/aviso-de-privacidad</a> indicando la fecha de su última actualización.
    </p>
  `,

  // ─── 2. TÉRMINOS Y CONDICIONES ───────────────────────────────────────────
  terms: `
    <h2>1. Aceptación y Disposiciones Generales</h2>
    <p>
      Los presentes Términos y Condiciones regulan el acceso y uso del portal <a href="https://www.jasman.com.mx">www.jasman.com.mx</a>, su tienda en línea de llantas (<strong>Jasman TIRES</strong>) y su plataforma segura de pago (<strong>checkout.jasman.com.mx</strong>), así como la reservación de citas en línea para servicios automotrices en la red de sucursales de <strong>Jasman Automotriz</strong> en la República Mexicana.
    </p>
    <p>
      Al navegar en el sitio, agendar una cita o confirmar una orden de compra, el usuario declara ser mayor de edad, contar con capacidad legal para contratar y aceptar íntegramente estos Términos y Condiciones.
    </p>

    <h2>2. Catálogo de Llantas, Especificaciones e Imágenes</h2>
    <ul>
      <li>Antes de confirmar su compra, es responsabilidad del cliente verificar la <strong>medida exacta requerida por su vehículo</strong> (ancho, serie/perfil, diámetro de rin, índice de carga y código de velocidad), revisando el costado de su llanta actual o el manual del fabricante.</li>
      <li>Las fotografías de neumáticos mostradas en el catálogo son de carácter ilustrativo respecto al diseño de piso/banda de rodamiento. <strong>La venta de neumáticos no incluye rines, tapones ni sensores TPMS</strong>, salvo que se especifique expresamente lo contrario en la descripción del producto.</li>
      <li>Todas las órdenes están sujetas a confirmación de inventario disponible. En el supuesto excepcional de agotamiento simultáneo de stock tras el pago, nuestro equipo contactará de inmediato al cliente para ofrecer un modelo equivalente/superior o el reembolso íntegro del 100% sin penalización.</li>
    </ul>

    <h2>3. Precios, Moneda, Promociones y Cupones</h2>
    <ul>
      <li>Todos los precios publicados están expresados en <strong>Pesos Mexicanos (MXN)</strong> e incluyen el Impuesto al Valor Agregado (<strong>IVA 16%</strong>).</li>
      <li>Los precios, descuentos y paquetes publicados en la tienda en línea o en landings promocionales pueden ser exclusivos del canal digital y diferir de las listas vigentes directamente en mostrador de sucursal, salvo cuando se indique expresamente su validez en sucursales participantes mediante folio web.</li>
      <li>Los códigos promocionales (incluyendo el cupón de primera compra en tienda en línea) son personales, limitados a un uso por cliente, sujetos a vigencia y no acumulables con otras promociones o convenios de flotillas salvo indicación expresa.</li>
    </ul>

    <h2>4. Medios de Pago y Validación Antifraude</h2>
    <p>
      Las compras en línea se procesan a través de nuestra pasarela cifrada <strong>checkout.jasman.com.mx</strong>, aceptando tarjetas de crédito y débito participantes (Visa, Mastercard, American Express) y los métodos de pago habilitados al momento de la compra. Por seguridad del tarjetahabiente, las instituciones bancarias o el procesador de pagos pueden realizar validaciones automáticas antes de liberar la orden para embarque.
    </p>

    <h2>5. Citas Web y Servicios Mecánicos en Sucursal</h2>
    <ul>
      <li>El registro de una cita o folio promocional en línea otorga atención prioritaria en la sucursal seleccionada, sujeto a horarios de operación de cada centro de servicio.</li>
      <li>En todo servicio mecánico (alineación y balanceo, frenos, suspensión, afinación, cambio de aceite, baterías, amortiguadores o enfriamiento), nuestros técnicos realizan una inspección previa e informan al cliente el presupuesto detallado antes de ejecutar cualquier reparación o reemplazo adicional.</li>
    </ul>

    <h2>6. Facturación Electrónica (CFDI 4.0)</h2>
    <p>
      Si requiere factura fiscal, deberá solicitarla dentro del <strong>mismo mes calendario en que se realizó su compra o servicio</strong>, ingresando a nuestro portal de facturación o enviando su número de pedido/ticket junto con su Constancia de Situación Fiscal actualizada (no mayor a 3 meses), uso de CFDI y correo electrónico a <a href="mailto:jasmanonline@jasman.com.mx">jasmanonline@jasman.com.mx</a>.
    </p>

    <h2>7. Propiedad Intelectual, Ley Aplicable y Jurisdicción</h2>
    <p>
      Los logotipos, nombres comerciales y contenidos de <strong>Jasman Automotriz</strong> y <strong>Jasman TIRES</strong>, así como las marcas de fabricantes distribuidos oficialmente (Michelin, BFGoodrich, Bridgestone, Firestone, Goodyear, Kelly, Continental, Euzkadi, General Tire, Hankook, Laufenn, Pirelli, entre otras), pertenecen a sus respectivos titulares y están protegidos por las leyes de propiedad industrial e intelectual.
    </p>
    <p>
      Para la interpretación y cumplimiento de los presentes Términos y Condiciones, las partes se someten a la legislación federal vigente en los Estados Unidos Mexicanos, a la competencia de la Procuraduría Federal del Consumidor (PROFECO) en la vía administrativa y a los tribunales competentes de la Ciudad de México.
    </p>
  `,

  // ─── 3. POLÍTICA DE DEVOLUCIONES, REEMBOLSOS Y GARANTÍAS ─────────────────
  refund: `
    <h2>1. Respaldo y Garantía Jasman Automotriz</h2>
    <p>
      En <strong>Jasman Automotriz</strong> respaldamos cada compra de neumáticos y cada servicio automotriz con más de 60 años de experiencia y más de 80 sucursales propias en México. Todas nuestras llantas son <strong>100% nuevas, originales y cuentan con garantía contra defectos de fabricación</strong>.
    </p>

    <h2>2. Plazo para Cambios o Devoluciones en Tienda en Línea</h2>
    <p>
      Usted cuenta con un plazo de hasta <strong>30 días naturales</strong> contados a partir de la fecha de entrega de su pedido en domicilio para solicitar una devolución o cambio de medida de llantas adquiridas a través de nuestra tienda en línea.
    </p>

    <h2>3. Condiciones Indispensables para Devolución de Llantas</h2>
    <p>
      Para que una solicitud de devolución o cambio por medida sea procedente, los neumáticos deberán cumplir estrictamente con lo siguiente:
    </p>
    <ul>
      <li>Encontrarse <strong>100% nuevos, sin rodar y sin haber sido montados en ningún rin</strong> (las cejas/talones del neumático no deben presentar marcas de desmontadora ni grasa de montaje).</li>
      <li>Conservar adheridas sus etiquetas originales de fabricante, código de barras y número de serie DOT íntegro.</li>
      <li>No presentar cortes, reparaciones, parches, pintura alterada ni exposición a solventes o agentes químicos.</li>
    </ul>
    <p>
      <em>En devoluciones voluntarias por error en la elección de medida imputable al comprador, los gastos logísticos de recolección o retorno al almacén correrán por cuenta del cliente; en caso de error de surtido o daño de origen imputable a Jasman o a la paquetería, Jasman cubrirá el 100% del costo de guía de retorno y reenvío.</em>
    </p>

    <h2>4. Reporte de Daños en Traslado o Producto Incorrecto</h2>
    <p>
      Si al recibir su pedido detecta daño visible ocasionado durante el transporte o una medida distinta a la solicitada en su orden:
    </p>
    <ol>
      <li>Conserve las etiquetas originales y tome fotografías claras del neumático completo, de la medida en el costado y de la guía de paquetería adherida.</li>
      <li>Repórtelo dentro de las primeras <strong>48 horas posteriores a la entrega</strong> escribiendo a <a href="mailto:jasmanonline@jasman.com.mx">jasmanonline@jasman.com.mx</a>, vía WhatsApp al <strong>55 1002 4945</strong> o al teléfono sin costo <strong>800 8010 290</strong> indicando su número de orden.</li>
      <li>Nuestro equipo validará la incidencia y coordinará la recolección y reposición sin costo adicional para usted.</li>
    </ol>

    <h2>5. Garantía contra Defectos de Fabricación y Servicios en Sucursal</h2>
    <ul>
      <li><strong>Garantía de fábrica en llantas:</strong> Cubre defectos atribuibles a materiales o manufactura conforme a los criterios técnicos del fabricante. No aplica en daños fortuitos por impacto en baches, banquetazos, objetos punzocortantes, rodaje con baja presión de aire, sobrecarga o desgaste irregular por falta de alineación, balanceo o componentes de suspensión en mal estado.</li>
      <li><strong>Garantía en servicios mecánicos:</strong> Todos los servicios realizados en talleres Jasman cuentan con garantía por escrito en mano de obra y refacciones, conforme a los plazos y kilometrajes estipulados en su orden de servicio o factura entregada en sucursal.</li>
    </ul>

    <h2>6. Proceso y Tiempos de Reembolso</h2>
    <ul>
      <li>Una vez recibido el producto en nuestro centro de distribución y verificado físicamente el cumplimiento de las condiciones anteriores, notificaremos por correo electrónico la liberación del reembolso en un lapso de <strong>48 a 72 horas hábiles</strong>.</li>
      <li>El reembolso se aplica siempre al <strong>mismo método de pago original</strong> utilizado en la compra en un plazo operativo de <strong>3 a 5 días hábiles</strong>.</li>
      <li>El tiempo en que el saldo se vea reflejado finalmente en su estado de cuenta depende de su banco emisor (habitualmente de 5 a 15 días hábiles en tarjetas de crédito o débito).</li>
    </ul>

    <h2>7. Cancelación de Pedidos antes del Envío</h2>
    <p>
      Puede solicitar la cancelación sin costo y el reembolso total de su pedido siempre que la orden aún no haya sido entregada a la empresa de paquetería. Una vez generada la recolección en tránsito, aplicará el procedimiento ordinario de devolución.
    </p>
  `,

  // ─── 4. POLÍTICA DE ENVÍOS ───────────────────────────────────────────────
  shipping: `
    <h2>1. Cobertura Nacional en la República Mexicana</h2>
    <p>
      A través de <strong>Jasman TIRES</strong> enviamos neumáticos nuevos a domicilio en los <strong>32 estados de la República Mexicana</strong>, cubriendo Ciudad de México, Estado de México, Monterrey, Guadalajara, Querétaro, Puebla, León, Bajío, Michoacán, Morelos, Hidalgo y el resto de ciudades y municipios del país con cobertura de mensajería especializada.
    </p>

    <h2>2. Tiempos de Preparación y Entrega</h2>
    <p>
      El proceso logístico de cada pedido se compone de dos etapas claras:
    </p>
    <ul>
      <li><strong>Validación y preparación en almacén:</strong> De <strong>24 a 48 horas hábiles</strong> contadas a partir de la confirmación y acreditación del pago (en días hábiles de lunes a viernes).</li>
      <li><strong>Tránsito estándar en ciudades principales y áreas metropolitanas:</strong> De <strong>3 a 5 días hábiles</strong> posteriores a la recolección por parte de la paquetería.</li>
      <li><strong>Zonas extendidas o localidades con frecuencia programada:</strong> De <strong>5 a 8 días hábiles</strong>, dependiendo de la ruta semanal del operador logístico hacia el código postal de destino.</li>
    </ul>

    <h2>3. Operadores Logísticos y Rastreo de Guía</h2>
    <p>
      Trabajamos con paqueterías líderes a nivel nacional con infraestructura apta para el traslado seguro de neumáticos. En cuanto su orden salga de almacén, recibirá en su correo electrónico registrado (y/o vía WhatsApp cuando lo solicite) su <strong>número de guía y enlace de rastreo</strong> para consultar el avance de su entrega en tiempo real.
    </p>

    <h2>4. Costos de Envío</h2>
    <p>
      El costo de envío aplicable (o el beneficio de <strong>envío sin costo</strong> en promociones vigentes o volúmenes participantes) se calcula y desglosa de forma 100% transparente en el resumen de su carrito y en la pantalla de pago en <strong>checkout.jasman.com.mx</strong> antes de finalizar su compra, sin cargos ocultos posteriores.
    </p>

    <h2>5. Recomendaciones al Recibir su Pedido</h2>
    <ul>
      <li>Las empresas de mensajería realizan hasta <strong>2 intentos de entrega</strong> en el domicilio registrado. Asegúrese de capturar calle, número exterior e interior, colonia, código postal de 5 dígitos y teléfono de contacto correcto.</li>
      <li>Al recibir sus llantas, verifique que la <strong>cantidad de piezas y la medida impresa en el costado/etiqueta</strong> correspondan con su pedido antes de firmar de conformidad al operador.</li>
      <li>En compras de 2 o 4 llantas, en ocasiones las paqueterías pueden transportar los neumáticos con folios de guía individuales vinculados a una guía maestra, por lo que podrían arribar con diferencia de horas dentro del mismo rango estimado.</li>
    </ul>

    <h2>6. Montaje e Instalación Profesional en Sucursales Jasman</h2>
    <p>
      Una vez que reciba sus llantas en casa u oficina, puede acudir a cualquiera de nuestras <strong>+80 sucursales Jasman Automotriz</strong> para realizar el montaje profesional con equipo especializado, cambio de válvulas, inflado con nitrógeno, balanceo computarizado y alineación 3D. Ubique su taller más cercano en <a href="/sucursales">www.jasman.com.mx/sucursales</a>.
    </p>
  `,
};
