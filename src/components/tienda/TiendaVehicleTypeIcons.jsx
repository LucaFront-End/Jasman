import { C } from '../../hooks/useAnimations';

/**
 * Minimalist architectural side-profile vector SVGs for all 8 Jasman Vehicle Types:
 * Auto, Turismo, Deportivo, Camioneta, SUV, Light Truck, Van, Comercial Ligero
 */
export default function TiendaVehicleSvg({
  type = 'Auto',
  active = false,
  width = 92,
  height = 34,
}) {
  const stroke = active ? C.red : C.navy;
  const bodyFill = active ? 'rgba(196, 30, 36, 0.09)' : 'rgba(26, 31, 54, 0.045)';
  const glassFill = active ? 'rgba(196, 30, 36, 0.16)' : 'rgba(26, 31, 54, 0.10)';
  const hubFill = active ? C.red : '#64748B';
  const shadowFill = active ? 'rgba(196, 30, 36, 0.12)' : 'rgba(26, 31, 54, 0.09)';

  switch (type) {
    case 'Auto':
      // Compact Hatchback / City Car
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43" rx="52" ry="2.8" fill={shadowFill} />
          <path
            d="M18 33C18 29 21 25 29 23L44 13C50 10.5 59 9.5 74 9.5C87 9.5 96 12 104 20L118 23C122 24 124 27.5 124 32V35.5C124 37.2 122.5 38 120 38H110C110 31.2 104.8 26.8 98.5 26.8C92.2 26.8 87 31.2 87 38H51C51 31.2 45.8 26.8 39.5 26.8C33.2 26.8 28 31.2 28 38H21C19 38 18 36.5 18 33Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M46 21.5L56 13.5H71V21.5H46ZM75 21.5V13.5H89L98 21.5H75Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M118 26.5L123 28" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M19 27.5H23" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="39.5" cy="37.5" r="8.2" fill="#FFFFFF" stroke={stroke} strokeWidth="2.1" />
          <circle cx="39.5" cy="37.5" r="3.6" fill={hubFill} />
          <circle cx="98.5" cy="37.5" r="8.2" fill="#FFFFFF" stroke={stroke} strokeWidth="2.1" />
          <circle cx="98.5" cy="37.5" r="3.6" fill={hubFill} />
        </svg>
      );

    case 'Turismo':
      // Elongated Executive Gran Turismo Fastback Sedan
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43" rx="58" ry="2.8" fill={shadowFill} />
          <path
            d="M11 33.5C11 30 14 27 23 25.5L43 14C51 11 63 10.5 79 11.5C91 12.2 100 16.5 108 22L123 24.5C127 25.5 128.5 28.5 128.5 32.5V35.5C128.5 37.2 127 38 124 38H113C113 31.2 107.8 26.8 101.5 26.8C95.2 26.8 90 31.2 90 38H48C48 31.2 42.8 26.8 36.5 26.8C30.2 26.8 25 31.2 25 38H15C12.5 38 11 36.5 11 33.5Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M44 22L56 14.2H73V22H44ZM77 22V14.5C85 15 92 17.5 99 22H77Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <line x1="50" y1="27.5" x2="88" y2="27.5" stroke={stroke} strokeWidth="1.1" strokeOpacity="0.32" />
          <path d="M122 27.5L127.5 29" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M12 29H17" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="36.5" cy="37.5" r="8.4" fill="#FFFFFF" stroke={stroke} strokeWidth="2.1" />
          <circle cx="36.5" cy="37.5" r="3.8" fill={hubFill} />
          <circle cx="101.5" cy="37.5" r="8.4" fill="#FFFFFF" stroke={stroke} strokeWidth="2.1" />
          <circle cx="101.5" cy="37.5" r="3.8" fill={hubFill} />
        </svg>
      );

    case 'Deportivo':
      // Sleek Low-Slung Sports Coupé with Rear Spoiler & Crimson Calipers
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43" rx="59" ry="2.6" fill={shadowFill} />
          {/* Rear Aero Lip Spoiler */}
          <path d="M12 23.5L18 25.5" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M11 34C11 30 15 26.5 24 25L47 14.5C56 11.8 68 11.8 79 14.5L99 22.5L122 25.5C127 26.5 129 29.5 129 33.5V36C129 37.4 127.5 38 124.5 38H113.5C113.5 30.8 108 26 101.5 26C95 26 89.5 30.8 89.5 38H48.5C48.5 30.8 43 26 36.5 26C30 26 24.5 30.8 24.5 38H15C12.5 38 11 36.6 11 34Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M49 22L60 15.2C68 14.8 76 16 88 22H49Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Side Air Intake Vent */}
          <path d="M58 32L66 28.5" stroke={C.red} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M122 28.5L128 30.5" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="36.5" cy="37.5" r="8.8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="36.5" cy="37.5" r="4.1" fill={C.red} />
          <circle cx="101.5" cy="37.5" r="8.8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="101.5" cy="37.5" r="4.1" fill={C.red} />
        </svg>
      );

    case 'Camioneta':
      // Modern Urban Crossover / CUV
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43.5" rx="56" ry="2.9" fill={shadowFill} />
          <path d="M34 9.2H88" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M15 34V23C15 20 17 18 21 16.5L30 11.5C35 10.5 44 10.5 78 10.5C86 10.5 92 12.5 99 20L119 23C123.5 24 125.5 27.5 125.5 32V36C125.5 37.5 124 38 121 38H111.5C111.5 30.5 105.8 25.5 99 25.5C92.2 25.5 86.5 30.5 86.5 38H50.5C50.5 30.5 44.8 25.5 38 25.5C31.2 25.5 25.5 30.5 25.5 38H18.5C16.2 38 15 36.6 15 34Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M29 20.5L34 13.5H54V20.5H29ZM58 20.5V13.5H76V20.5H58ZM80 20.5V13.5H88L94 20.5H80Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M119.5 26.5L124.5 28" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M16 24.5H20" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="38" cy="37.5" r="8.8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="38" cy="37.5" r="4" fill={hubFill} />
          <circle cx="99" cy="37.5" r="8.8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="99" cy="37.5" r="4" fill={hubFill} />
        </svg>
      );

    case 'SUV':
      // Commanding Full-Size 3-Row SUV
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43.5" rx="58" ry="3" fill={shadowFill} />
          <path d="M24 7.8H92" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M13 34.5V17C13 13 15.5 10 20 9.5H89C94 9.5 97.5 12 102 19.5L122 21.5C125.5 22 127 25 127 29.5V36C127 37.5 125.5 38 122.5 38H113C113 30 107 24.8 99.8 24.8C92.6 24.8 86.5 30 86.5 38H49.5C49.5 30 43.4 24.8 36.2 24.8C29 24.8 23 30 23 38H16.5C14.2 38 13 36.8 13 34.5Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M20 19.5V12.5H43V19.5H20ZM47 19.5V12.5H69V19.5H47ZM73 19.5V12.5H90L96 19.5H73Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M122 25V29" stroke={C.red} strokeWidth="2.3" strokeLinecap="round" />
          <path d="M14 22V27" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="36.2" cy="37.5" r="9.2" fill="#FFFFFF" stroke={stroke} strokeWidth="2.3" />
          <circle cx="36.2" cy="37.5" r="4.2" fill={hubFill} />
          <circle cx="99.8" cy="37.5" r="9.2" fill="#FFFFFF" stroke={stroke} strokeWidth="2.3" />
          <circle cx="99.8" cy="37.5" r="4.2" fill={hubFill} />
        </svg>
      );

    case 'Light Truck':
      // Double-Cab 4x4 Pick-Up Truck with Sport Bar
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43.5" rx="59" ry="3" fill={shadowFill} />
          {/* Sport Rollbar on Pickup Bed */}
          <path d="M48 21L56 11.5H60" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M11 33.5V22.5C11 21.2 12 20.5 13.5 20.5H54V12C54 10.5 55.5 9.5 58 9.5H86C91 9.5 95 12 100 19.5L121 22C125 22.5 127 25.5 127 30V35.5C127 37.2 125.5 37.8 122.5 37.8H113C113 29.8 107 24.5 99.8 24.5C92.6 24.5 86.5 29.8 86.5 37.8H49.5C49.5 29.8 43.4 24.5 36.2 24.5C29 24.5 23 29.8 23 37.8H15C12.5 37.8 11 36.2 11 33.5Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M58 19.5V12.5H72V19.5H58ZM76 19.5V12.5H87L94 19.5H76Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M122 25.5V29.5" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 24V28.5" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="36.2" cy="37.5" r="9.3" fill="#FFFFFF" stroke={stroke} strokeWidth="2.4" />
          <circle cx="36.2" cy="37.5" r="4.2" fill={hubFill} />
          <circle cx="99.8" cy="37.5" r="9.3" fill="#FFFFFF" stroke={stroke} strokeWidth="2.4" />
          <circle cx="99.8" cy="37.5" r="4.2" fill={hubFill} />
        </svg>
      );

    case 'Van':
      // Sleek Passenger Van (Urvan / Hiace / Starex style)
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43.5" rx="57" ry="2.9" fill={shadowFill} />
          <path
            d="M14 35V13.5C14 10.5 16.5 8.5 20 8.5H95C101 8.5 106 11.5 111 19.5L122 23.5C124.5 24.5 126 27 126 31V36C126 37.4 124.8 38 122 38H111C111 31 105.5 26.2 99 26.2C92.5 26.2 87 31 87 38H48C48 31 42.5 26.2 36 26.2C29.5 26.2 24 31 24 38H17.5C15.2 38 14 36.8 14 35Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M20 20V12H45V20H20ZM49 20V12H76V20H49ZM80 20V12H96L104 20H80Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Sliding Door Track Accent */}
          <line x1="46" y1="24.5" x2="78" y2="24.5" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.38" />
          <path d="M121 26.5L125 28" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M15 24V29" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="36" cy="37.5" r="8.5" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="36" cy="37.5" r="3.8" fill={hubFill} />
          <circle cx="99" cy="37.5" r="8.5" fill="#FFFFFF" stroke={stroke} strokeWidth="2.2" />
          <circle cx="99" cy="37.5" r="3.8" fill={hubFill} />
        </svg>
      );

    case 'Comercial Ligero':
    case 'Camión':
    default:
      // High-Roof Light Commercial Cargo Van / Sprinter / Box Chassis
      return (
        <svg width={width} height={height} viewBox="0 0 136 48" fill="none" aria-hidden="true">
          <ellipse cx="68" cy="43.5" rx="59" ry="3" fill={shadowFill} />
          <path
            d="M12 35.5V10.5C12 8.2 14 6.5 17 6.5H88C94 6.5 98.5 9.5 104 18L121 22.5C124.5 23.5 126 26.5 126 30.5V36C126 37.5 124.5 38 121.5 38H111C111 31 105.5 26.2 99 26.2C92.5 26.2 87 31 87 38H48C48 31 42.5 26.2 36 26.2C29.5 26.2 24 31 24 38H15.5C13.2 38 12 37 12 35.5Z"
            fill={bodyFill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Cargo Panel Structural Ribs */}
          <line x1="36" y1="11" x2="36" y2="23" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.28" />
          <line x1="58" y1="11" x2="58" y2="23" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.28" />
          <line x1="78" y1="11" x2="78" y2="34" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.32" />
          {/* Cab Front Window */}
          <path
            d="M83 20V11H94L101 20H83Z"
            fill={glassFill}
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M121 26L125 27.8" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M13 22V28" stroke={C.red} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="36" cy="37.5" r="8.6" fill="#FFFFFF" stroke={stroke} strokeWidth="2.3" />
          <circle cx="36" cy="37.5" r="4" fill={hubFill} />
          <circle cx="99" cy="37.5" r="8.6" fill="#FFFFFF" stroke={stroke} strokeWidth="2.3" />
          <circle cx="99" cy="37.5" r="4" fill={hubFill} />
        </svg>
      );
  }
}

