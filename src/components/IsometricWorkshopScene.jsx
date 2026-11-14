import { useId } from 'react';
import { C, F } from '../hooks/useAnimations';
import { Check, ShieldCheck, Truck, Sparkles, ArrowUpRight } from 'lucide-react';

// True 2:1 isometric projection anchored cleanly in a framed 840x480 stage
const ORIGIN_X = 430;
const ORIGIN_Y = 215;

function iso(x, y, z = 0) {
  return [ORIGIN_X + (x - y), ORIGIN_Y + (x + y) * 0.5 - z];
}

function pts(coords) {
  return coords.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
}

function isoFace(corners) {
  return pts(corners.map(([x, y, z = 0]) => iso(x, y, z)));
}

function IsoBox({ x, y, z = 0, w, d, h, topFill, rightFill, leftFill, stroke = 'none', opacity = 1 }) {
  const top = isoFace([
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ]);
  const right = isoFace([
    [x + w, y, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x + w, y, z + h],
  ]);
  const left = isoFace([
    [x, y + d, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ]);

  return (
    <g opacity={opacity}>
      <polygon points={left} fill={leftFill} stroke={stroke} strokeWidth="0.6" />
      <polygon points={right} fill={rightFill} stroke={stroke} strokeWidth="0.6" />
      <polygon points={top} fill={topFill} stroke={stroke} strokeWidth="0.6" />
    </g>
  );
}

/**
 * Multi-plane isometric vehicle (pointing toward +x exit direction).
 * Supports 'van', 'sedan', 'suv', and 'pickup' silhouettes with metallic gradients,
 * tinted glass reflections, wheels, headlights & ambient cast shadow.
 */
function IsoVehicle({
  type = 'sedan',
  bodyColors = { top: '#F8FAFC', side: '#CBD5E1', front: '#E2E8F0', accent: '#C41E24' },
  x = 0,
  y = 0,
  z = 0,
  withHeadlights = true,
  isJasmanFleet = false,
  className = '',
}) {
  const dims =
    type === 'van'
      ? { len: 78, wid: 34, lowerH: 15, cabinStart: 12, cabinEnd: 74, cabinH: 20, hoodSlope: 6 }
      : type === 'suv'
        ? { len: 74, wid: 34, lowerH: 14, cabinStart: 18, cabinEnd: 68, cabinH: 15, hoodSlope: 3 }
        : { len: 72, wid: 32, lowerH: 12, cabinStart: 20, cabinEnd: 60, cabinH: 12, hoodSlope: 2 };

  const { len, wid, lowerH, cabinStart, cabinEnd, cabinH } = dims;
  const wheelYLeft = y + wid + 0.5;
  const [rearWheelX, rearWheelY] = iso(x + 15, wheelYLeft, z + 5);
  const [frontWheelX, frontWheelY] = iso(x + len - 15, wheelYLeft, z + 5);

  const [hlStartX, hlStartY] = iso(x + len + 1, y + 6, z + 8);
  const [hlFarTopX, hlFarTopY] = iso(x + len + 72, y - 10, z + 1);
  const [hlFarBotX, hlFarBotY] = iso(x + len + 72, y + wid + 10, z + 1);
  const [hlStart2X, hlStart2Y] = iso(x + len + 1, y + wid - 6, z + 8);

  const [decalX, decalY] = iso(x + len * 0.44, y + wid + 0.8, z + lowerH * 0.72);

  return (
    <g className={className}>
      {/* Soft ground shadow */}
      <polygon
        points={isoFace([
          [x - 6, y - 3, z + 0.2],
          [x + len + 8, y - 3, z + 0.2],
          [x + len + 8, y + wid + 5, z + 0.2],
          [x - 6, y + wid + 5, z + 0.2],
        ])}
        fill="rgba(4, 7, 18, 0.58)"
      />

      {/* Headlight volumetric beams on asphalt */}
      {withHeadlights && (
        <polygon
          points={`${hlStartX},${hlStartY} ${hlFarTopX},${hlFarTopY} ${hlFarBotX},${hlFarBotY} ${hlStart2X},${hlStart2Y}`}
          fill="url(#isoHeadlightGrad)"
          opacity="0.72"
        />
      )}

      {/* Undercarriage / shadow skirt */}
      <IsoBox
        x={x + 2}
        y={y + 1}
        z={z + 3}
        w={len - 4}
        d={wid - 2}
        h={3}
        topFill="#0F172A"
        rightFill="#0F172A"
        leftFill="#090D16"
      />

      {/* Main lower chassis */}
      <IsoBox
        x={x}
        y={y}
        z={z + 5}
        w={len}
        d={wid}
        h={lowerH}
        topFill={bodyColors.top}
        rightFill={bodyColors.front}
        leftFill={bodyColors.side}
        stroke="rgba(15,23,42,0.22)"
      />

      {/* Crimson Jasman fleet stripe along side for van/fleet */}
      {isJasmanFleet && (
        <polygon
          points={isoFace([
            [x + 6, y + wid + 0.3, z + 9],
            [x + len - 6, y + wid + 0.3, z + 9],
            [x + len - 4, y + wid + 0.3, z + 13],
            [x + 6, y + wid + 0.3, z + 13],
          ])}
          fill={bodyColors.accent}
        />
      )}

      {/* Sculpted Cabin / Greenhouse */}
      <polygon
        points={isoFace([
          [x + cabinStart, y + 2, z + 5 + lowerH],
          [x + cabinEnd - 6, y + 2, z + 5 + lowerH],
          [x + cabinEnd - 6, y + wid - 2, z + 5 + lowerH],
          [x + cabinStart, y + wid - 2, z + 5 + lowerH],
        ])}
        fill="#0F172A"
      />
      {/* Roof */}
      <polygon
        points={isoFace([
          [x + cabinStart + 4, y + 3, z + 5 + lowerH + cabinH],
          [x + cabinEnd - 8, y + 3, z + 5 + lowerH + cabinH],
          [x + cabinEnd - 8, y + wid - 3, z + 5 + lowerH + cabinH],
          [x + cabinStart + 4, y + wid - 3, z + 5 + lowerH + cabinH],
        ])}
        fill={bodyColors.top}
        stroke="rgba(15,23,42,0.18)"
        strokeWidth="0.6"
      />
      {/* Side glass band (+y face) */}
      <polygon
        points={isoFace([
          [x + cabinStart + 1, y + wid - 1.5, z + 5 + lowerH + 1],
          [x + cabinEnd - 4, y + wid - 1.5, z + 5 + lowerH + 1],
          [x + cabinEnd - 8, y + wid - 3, z + 5 + lowerH + cabinH - 1],
          [x + cabinStart + 4, y + wid - 3, z + 5 + lowerH + cabinH - 1],
        ])}
        fill="url(#isoGlassGrad)"
        stroke="rgba(15,23,42,0.45)"
        strokeWidth="0.6"
      />
      {/* Front windshield (+x sloped face) */}
      <polygon
        points={isoFace([
          [x + cabinEnd - 3, y + 2.5, z + 5 + lowerH],
          [x + cabinEnd - 3, y + wid - 2.5, z + 5 + lowerH],
          [x + cabinEnd - 8, y + wid - 3, z + 5 + lowerH + cabinH],
          [x + cabinEnd - 8, y + 3, z + 5 + lowerH + cabinH],
        ])}
        fill="url(#isoWindshieldGrad)"
        stroke="rgba(15,23,42,0.5)"
        strokeWidth="0.7"
      />

      {/* Front grille & twin LED headlights on +x nose */}
      <polygon
        points={isoFace([
          [x + len + 0.3, y + 8, z + 7],
          [x + len + 0.3, y + wid - 8, z + 7],
          [x + len + 0.3, y + wid - 8, z + 13],
          [x + len + 0.3, y + 8, z + 13],
        ])}
        fill="#0F172A"
      />
      <polygon
        points={isoFace([
          [x + len + 0.4, y + 2.5, z + 11],
          [x + len + 0.4, y + 7.5, z + 11],
          [x + len + 0.4, y + 7.5, z + 14.5],
          [x + len + 0.4, y + 2.5, z + 14.5],
        ])}
        fill="#FEF08A"
      />
      <polygon
        points={isoFace([
          [x + len + 0.4, y + wid - 7.5, z + 11],
          [x + len + 0.4, y + wid - 2.5, z + 11],
          [x + len + 0.4, y + wid - 2.5, z + 14.5],
          [x + len + 0.4, y + wid - 7.5, z + 14.5],
        ])}
        fill="#FEF08A"
      />

      {/* Side Jasman mini emblem on fleet vans */}
      {isJasmanFleet && (
        <text
          x={decalX}
          y={decalY}
          transform={`skewY(-26.5)`}
          fill="#1A1F36"
          fontSize="6.5"
          fontWeight="900"
          fontFamily="Montserrat, sans-serif"
          textAnchor="middle"
          opacity="0.88"
        >
          JASMAN
        </text>
      )}

      {/* Isometric rotating wheels on visible +y flank */}
      {[
        [rearWheelX, rearWheelY],
        [frontWheelX, frontWheelY],
      ].map(([wx, wy], idx) => (
        <g key={idx} transform={`translate(${wx.toFixed(1)}, ${wy.toFixed(1)})`}>
          <ellipse cx="0" cy="0" rx="8.2" ry="9.4" transform="rotate(-14) scale(0.86, 1)" fill="#090D16" stroke="#1E293B" strokeWidth="1" />
          <ellipse cx="0.6" cy="0" rx="5.1" ry="5.9" transform="rotate(-14) scale(0.86, 1)" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="0.7" />
          <g className="iso-wheel-spokes">
            <line x1="-3.2" y1="0" x2="3.2" y2="0" stroke="#1E293B" strokeWidth="1.1" />
            <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#1E293B" strokeWidth="1.1" />
            <circle cx="0" cy="0" r="1.5" fill="#C41E24" />
          </g>
        </g>
      ))}
    </g>
  );
}

/**
 * Ultra-realistic Isometric Taller Automotriz Jasman & Dispatch Scene.
 * Shared across FlotillasPage ('full') and Cart/Checkout dispatch ('compact').
 */
export default function IsometricWorkshopScene({
  variant = 'full',
  bayPhase = 'servicing',
  showCheck = false,
  dispatchedCount = 148,
  lastDispatch = null,
  activeVehicle = null,
  onTriggerDispatch = null,
}) {
  const uid = useId().replace(/:/g, '');
  const isCompact = variant === 'compact';
  const isExiting = bayPhase === 'exiting' || showCheck;

  const [gatePivotX, gatePivotY] = iso(92, 165, 16);
  const [checkX, checkY] = iso(155, -8, 62);
  const [signX, signY] = iso(28, 0, 84);

  return (
    <div
      className={`jasman-iso-scene-shell jasman-iso-scene-${variant}`}
      style={{
        position: 'relative',
        borderRadius: isCompact ? 18 : 26,
        overflow: 'hidden',
        background: 'linear-gradient(155deg, #0D1224 0%, #151C36 52%, #0F152A 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: isCompact
          ? '0 14px 36px rgba(13, 18, 36, 0.28)'
          : '0 28px 80px rgba(10, 14, 30, 0.45)',
      }}
    >
      {/* Top Telemetry Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: isCompact ? '10px 14px' : '14px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.025)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: isExiting ? '#22C55E' : '#F59E0B',
              boxShadow: isExiting
                ? '0 0 12px rgba(34, 197, 94, 0.9)'
                : '0 0 10px rgba(245, 158, 11, 0.8)',
              transition: 'background 0.3s ease',
            }}
          />
          <span
            style={{
              fontFamily: F.heading,
              fontSize: isCompact ? 10.5 : 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.white,
            }}
          >
            {isExiting
              ? 'Unidad Despachada · Salida Libre'
              : bayPhase === 'entering'
                ? 'Ingreso a Bahía Jasman'
                : 'Diagnóstico & Servicio en Bahía'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isCompact && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.86)',
              }}
            >
              <Truck size={13} color={C.redLight} />
              Despachadas hoy: <strong style={{ color: '#FFFFFF' }}>{dispatchedCount}</strong>
            </span>
          )}

          {onTriggerDispatch && (
            <button
              type="button"
              onClick={onTriggerDispatch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: isCompact ? '6px 11px' : '7px 14px',
                borderRadius: 9999,
                border: '1px solid rgba(34, 197, 94, 0.35)',
                background: 'rgba(34, 197, 94, 0.14)',
                color: '#86EFAC',
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <Check size={13} strokeWidth={3} />
              Despachar Unidad
            </button>
          )}
        </div>
      </div>

      {/* Isometric 2.5D SVG Workshop Diorama */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: isCompact ? '16 / 9' : '16 / 8.8' }}>
        <svg
          viewBox="60 -52 840 500"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}
          role="img"
          aria-label="Animación isométrica de taller Jasman con vehículos saliendo y confirmación de despacho"
        >
          <defs>
            <linearGradient id={`isoAsphalt_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1B2238" />
              <stop offset="100%" stopColor="#0E1322" />
            </linearGradient>
            <linearGradient id={`isoShopFloor_${uid}`} x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0%" stopColor="#26314E" />
              <stop offset="100%" stopColor="#1A2238" />
            </linearGradient>
            <linearGradient id={`isoRoofGlass_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(148, 163, 184, 0.26)" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.14)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0.42)" />
            </linearGradient>
            <linearGradient id="isoGlassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="isoWindshieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.72" />
              <stop offset="55%" stopColor="#0F172A" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="isoHeadlightGrad" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`isoBayGlow_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`isoAmberGlow_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Exit Avenue & Ground Campus */}
          <polygon
            points={isoFace([
              [-280, -230, 0],
              [390, -230, 0],
              [390, 260, 0],
              [-280, 260, 0],
            ])}
            fill={`url(#isoAsphalt_${uid})`}
          />

          {/* Isometric Campus Sidewalk & Exit Road Lanes */}
          <polygon
            points={isoFace([
              [-220, -180, 0.5],
              [360, -180, 0.5],
              [360, 175, 0.5],
              [-220, 175, 0.5],
            ])}
            fill="#141A2E"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />

          {/* Main Departure Avenue (+x lane in front of taller) */}
          <polygon
            points={isoFace([
              [42, -175, 0.8],
              [370, -175, 0.8],
              [370, 170, 0.8],
              [42, 170, 0.8],
            ])}
            fill="#182036"
          />
          {/* Dedicated Express Exit Highway along lower-right curb */}
          <polygon
            points={isoFace([
              [-240, 170, 1],
              [380, 170, 1],
              [380, 232, 1],
              [-240, 232, 1],
            ])}
            fill="#101627"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />
          {/* Dashed Isometric Avenue Centerline */}
          {[-170, -100, -30, 40, 110, 180, 250, 320].map((lx) => (
            <polygon
              key={lx}
              points={isoFace([
                [lx, 199, 1.3],
                [lx + 38, 199, 1.3],
                [lx + 38, 202, 1.3],
                [lx, 202, 1.3],
              ])}
              fill="rgba(255,255,255,0.34)"
            />
          ))}

          {/* Exit Arrows painted on apron exiting Bays 01, 02, 03 */}
          {[-86, 0, 86].map((by) => (
            <g key={by}>
              <polygon
                points={isoFace([
                  [56, by - 2, 1.2],
                  [102, by - 2, 1.2],
                  [102, by + 2, 1.2],
                  [56, by + 2, 1.2],
                ])}
                fill="rgba(255,255,255,0.22)"
              />
              <polygon
                points={isoFace([
                  [102, by - 7, 1.2],
                  [118, by, 1.2],
                  [102, by + 7, 1.2],
                ])}
                fill="rgba(34, 197, 94, 0.55)"
              />
            </g>
          ))}

          {/* Concrete Sidewalk Slab under Taller */}
          <IsoBox
            x={-205}
            y={-155}
            z={0}
            w={248}
            d={312}
            h={5}
            topFill={`url(#isoShopFloor_${uid})`}
            rightFill="#334155"
            leftFill="#1E293B"
          />

          {/* Three Workshop Service Bays inside Taller Floor */}
          {[
            { y: -122, num: '01', active: !isExiting },
            { y: -36, num: '02', active: isExiting },
            { y: 50, num: '03', active: false },
          ].map((bay) => (
            <g key={bay.num}>
              <polygon
                points={isoFace([
                  [-168, bay.y, 5.4],
                  [16, bay.y, 5.4],
                  [16, bay.y + 70, 5.4],
                  [-168, bay.y + 70, 5.4],
                ])}
                fill="#18213A"
                stroke={bay.active ? 'rgba(34,197,94,0.48)' : 'rgba(255,255,255,0.12)'}
                strokeWidth="1.2"
              />
              {/* Yellow safety pit frame inside each bay */}
              <polygon
                points={isoFace([
                  [-136, bay.y + 12, 5.6],
                  [-18, bay.y + 12, 5.6],
                  [-18, bay.y + 58, 5.6],
                  [-136, bay.y + 58, 5.6],
                ])}
                fill="#11182C"
                stroke="rgba(245,158,11,0.35)"
                strokeWidth="0.9"
              />
              {/* Ambient floor light pool */}
              <ellipse
                cx={iso(-76, bay.y + 35, 5.8)[0]}
                cy={iso(-76, bay.y + 35, 5.8)[1]}
                rx="78"
                ry="42"
                fill={bay.active ? `url(#isoBayGlow_${uid})` : `url(#isoAmberGlow_${uid})`}
              />
              {/* Hydraulic two-post lift columns */}
              <IsoBox x={-82} y={bay.y + 6} z={5.5} w={8} d={8} h={52} topFill="#EF4444" rightFill="#B91C1C" leftFill="#7F1D1D" />
              <IsoBox x={-82} y={bay.y + 58} z={5.5} w={8} d={8} h={52} topFill="#EF4444" rightFill="#B91C1C" leftFill="#7F1D1D" />
            </g>
          ))}

          {/* Back Structural Wall (-x wall) */}
          <IsoBox
            x={-196}
            y={-150}
            z={5}
            w={12}
            d={302}
            h={78}
            topFill="#475569"
            rightFill="#1E293B"
            leftFill="#0F172A"
          />

          {/* Side Structural Wall (-y back-right flank) */}
          <IsoBox
            x={-184}
            y={-150}
            z={5}
            w={220}
            d={10}
            h={78}
            topFill="#475569"
            rightFill="#334155"
            leftFill="#1E293B"
          />

          {/* Crimson Tool Cabinets & Stacked Tires inside Taller */}
          <IsoBox x={-178} y={-110} z={5.5} w={16} d={34} h={22} topFill="#EF4444" rightFill="#C41E24" leftFill="#991B1B" />
          <IsoBox x={-178} y={-25} z={5.5} w={16} d={34} h={22} topFill="#EF4444" rightFill="#C41E24" leftFill="#991B1B" />
          <IsoBox x={-178} y={62} z={5.5} w={16} d={34} h={22} topFill="#334155" rightFill="#1E293B" leftFill="#0F172A" />

          {/* Vehicle 1 INSIDE Bay 01 undergoing tire/alignment inspection */}
          <g className="iso-car-bay1">
            <IsoVehicle
              type="suv"
              x={-118}
              y={-103}
              z={6}
              withHeadlights={false}
              bodyColors={{ top: '#94A3B8', side: '#475569', front: '#64748B', accent: '#C41E24' }}
            />
            {/* Animated alignment scan laser across Bay 01 */}
            <polygon
              className="iso-laser-sweep"
              points={isoFace([
                [-122, -110, 8],
                [-114, -110, 8],
                [-114, -66, 8],
                [-122, -66, 8],
              ])}
              fill="rgba(56, 189, 248, 0.35)"
              stroke="#38BDF8"
              strokeWidth="0.8"
            />
          </g>

          {/* Vehicle 2: EXITING OUT OF BAY 02 ("carros saliendo en un taller") */}
          <g className={isExiting ? 'iso-car-exit-boost' : 'iso-car-exit-loop'}>
            <IsoVehicle
              type="van"
              x={-36}
              y={-18}
              z={6}
              isJasmanFleet
              withHeadlights
              bodyColors={{ top: '#FFFFFF', side: '#CBD5E1', front: '#E2E8F0', accent: '#C41E24' }}
            />
          </g>

          {/* Vehicle 3 INSIDE Bay 03 prepping for exit */}
          <g className="iso-car-bay3">
            <IsoVehicle
              type="sedan"
              x={-105}
              y={68}
              z={6}
              withHeadlights
              bodyColors={{ top: '#EF4444', side: '#991B1B', front: '#C41E24', accent: '#FFFFFF' }}
            />
          </g>

          {/* Front Portal Columns between Exit Bays (+x facade) */}
          {[-146, -50, 36, 134].map((py) => (
            <IsoBox
              key={py}
              x={22}
              y={py}
              z={5}
              w={14}
              d={14}
              h={82}
              topFill="#64748B"
              rightFill="#334155"
              leftFill="#1E293B"
            />
          ))}

          {/* Overhead JASMAN Crimson Portal Fascia above Exit Bays */}
          <IsoBox
            x={20}
            y={-148}
            z={72}
            w={18}
            d={298}
            h={22}
            topFill="#EF4444"
            rightFill="#C41E24"
            leftFill="#8B1217"
          />

          {/* Bay LED Status Pillars (turn bright green on dispatch) */}
          {[-106, -18, 70].map((py, idx) => (
            <IsoBox
              key={py}
              x={38}
              y={py}
              z={78}
              w={3}
              d={38}
              h={6}
              topFill={idx === 1 && isExiting ? '#4ADE80' : '#22C55E'}
              rightFill={idx === 1 && isExiting ? '#22C55E' : '#16A34A'}
              leftFill="#15803D"
            />
          ))}

          {/* Isometric Rooftop Skylight Cutaway Canopy */}
          <polygon
            points={isoFace([
              [-194, -148, 86],
              [30, -148, 86],
              [30, 148, 86],
              [-194, 148, 86],
            ])}
            fill={`url(#isoRoofGlass_${uid})`}
            stroke="rgba(226, 232, 240, 0.25)"
            strokeWidth="1.2"
          />
          {/* Steel roof ribs */}
          {[-140, -82, -24, 34, 92].map((ry) => (
            <polyline
              key={ry}
              points={isoFace([
                [-192, ry, 86.5],
                [28, ry, 86.5],
              ])}
              stroke="rgba(148,163,184,0.3)"
              strokeWidth="2"
              fill="none"
            />
          ))}

          {/* Illuminated JASMAN Signage on Isometric Portal (+y face slanted -26.5deg) */}
          <g transform={`translate(${signX.toFixed(1)}, ${signY.toFixed(1)}) skewY(-26.5)`}>
            <rect x="-66" y="-10" width="132" height="19" rx="4" fill="#0F172A" opacity="0.82" />
            <text
              x="0"
              y="3"
              fill="#FFFFFF"
              fontSize="10.2"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              letterSpacing="1.8"
              textAnchor="middle"
            >
              JASMAN FLOTILLAS
            </text>
          </g>

          {/* Automated Exit Barrier Gate ("Pluma de Salida") */}
          <IsoBox x={86} y={160} z={1} w={12} d={12} h={22} topFill="#F59E0B" rightFill="#D97706" leftFill="#92400E" />
          <g
            transform={`translate(${gatePivotX.toFixed(1)}, ${gatePivotY.toFixed(1)}) rotate(${isExiting ? -52 : 0})`}
            style={{ transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <rect x="0" y="-3" width="66" height="5" rx="2.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.6" />
            <rect x="10" y="-3" width="12" height="5" fill="#C41E24" />
            <rect x="34" y="-3" width="12" height="5" fill="#C41E24" />
          </g>

          {/* Vehicle 4 cruising along the bottom Exit Highway ("y carros saliendo") */}
          <g className="iso-car-avenue-cruise">
            <IsoVehicle
              type="pickup"
              x={-110}
              y={184}
              z={2}
              isJasmanFleet
              withHeadlights
              bodyColors={{ top: '#E2E8F0', side: '#94A3B8', front: '#CBD5E1', accent: '#C41E24' }}
            />
          </g>

          {/* Roadside Safety Bollards + Illuminated Trees */}
          {[140, 210, 280].map((bx) => (
            <g key={bx}>
              <IsoBox x={bx} y={165} z={1} w={4} d={4} h={11} topFill="#FDE047" rightFill="#EAB308" leftFill="#CA8A04" />
              <IsoBox x={bx + 26} y={240} z={1} w={6} d={6} h={20} topFill="#16A34A" rightFill="#15803D" leftFill="#166534" />
            </g>
          ))}

          {/* Floating Animated Check Badge directly inside isometric sky when dispatched */}
          {showCheck && (
            <g transform={`translate(${checkX.toFixed(1)}, ${checkY.toFixed(1)})`} className="iso-dispatch-check-pop">
              <circle cx="0" cy="0" r="36" fill="rgba(34, 197, 94, 0.16)" className="iso-check-ripple" />
              <circle cx="0" cy="0" r="24" fill="#16A34A" stroke="#86EFAC" strokeWidth="2.5" />
              <path
                d="M-10 0 L-3 7 L11 -8"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="iso-check-stroke"
              />
            </g>
          )}
        </svg>

        {/* Glassmorphic Toast Check Banner on Cart / Fleet Dispatch */}
        {showCheck && (
          <div
            role="status"
            style={{
              position: 'absolute',
              right: isCompact ? 12 : 20,
              bottom: isCompact ? 12 : 20,
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: isCompact ? '9px 14px' : '12px 18px',
              borderRadius: 16,
              background: 'rgba(13, 18, 36, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(34, 197, 94, 0.45)',
              boxShadow: '0 16px 38px rgba(0, 0, 0, 0.42)',
              animation: 'isoToastIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              maxWidth: 'calc(100% - 24px)',
            }}
          >
            <div
              style={{
                width: isCompact ? 30 : 36,
                height: isCompact ? 30 : 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
                boxShadow: '0 0 18px rgba(34, 197, 94, 0.5)',
              }}
            >
              <Check size={isCompact ? 16 : 19} strokeWidth={3} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: isCompact ? 11 : 12.5,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {lastDispatch?.source === 'cart'
                  ? '¡Carrito Despachado con Éxito!'
                  : '¡Unidad Despachada del Taller!'}
              </div>
              <div
                style={{
                  fontSize: isCompact ? 10 : 11,
                  color: '#86EFAC',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {lastDispatch?.label || activeVehicle?.label || 'Flotilla Jasman'}
                {lastDispatch?.id ? ` · ${lastDispatch.id}` : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Workshop Strip (Full Showcase only) */}
      {!isCompact && (
        <div
          className="jasman-iso-footer-strip"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            padding: '14px 22px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(10, 14, 28, 0.72)',
          }}
        >
          {[
            {
              icon: Sparkles,
              title: 'Bahía Activa',
              desc: activeVehicle?.bay || 'Bahía 01 · Llantas & Balanceo',
              accent: '#38BDF8',
            },
            {
              icon: Truck,
              title: 'Flujo Continuo',
              desc: `${activeVehicle?.label || 'Unidades'} saliendo en ruta`,
              accent: C.redLight,
            },
            {
              icon: ShieldCheck,
              title: 'Checklist Certificado',
              desc: '72 puntos + Garantía Jasman por escrito',
              accent: '#22C55E',
            },
          ].map((stat) => (
            <div
              key={stat.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <stat.icon size={16} color={stat.accent} style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  {stat.title}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'rgba(255,255,255,0.58)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stat.desc}
                </div>
              </div>
              <ArrowUpRight size={13} color="rgba(255,255,255,0.28)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .iso-car-exit-loop {
          animation: isoBayExitLoop 5.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        .iso-car-exit-boost {
          animation: isoBayExitBoost 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .iso-car-avenue-cruise {
          animation: isoAvenueCruise 6.4s linear infinite;
        }
        .iso-car-bay1 {
          animation: isoBayMicroHover 2.6s ease-in-out infinite;
        }
        .iso-car-bay3 {
          animation: isoBayPrep 4.8s ease-in-out infinite;
        }
        .iso-laser-sweep {
          animation: isoLaserScan 2.2s ease-in-out infinite alternate;
        }
        .iso-wheel-spokes {
          animation: isoWheelSpin 0.9s linear infinite;
          transform-origin: 0px 0px;
        }
        .iso-dispatch-check-pop {
          animation: isoCheckPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .iso-check-ripple {
          animation: isoRipple 1.6s ease-out infinite;
        }
        .iso-check-stroke {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: isoDrawCheck 0.45s 0.12s ease-out forwards;
        }

        @keyframes isoBayExitLoop {
          0% { transform: translate(-72px, -36px); opacity: 0.25; }
          14% { transform: translate(0px, 0px); opacity: 1; }
          32% { transform: translate(12px, 6px); opacity: 1; }
          88% { transform: translate(310px, 155px); opacity: 1; }
          100% { transform: translate(365px, 182.5px); opacity: 0; }
        }
        @keyframes isoBayExitBoost {
          0% { transform: translate(0px, 0px); opacity: 1; }
          100% { transform: translate(340px, 170px); opacity: 0.95; }
        }
        @keyframes isoAvenueCruise {
          0% { transform: translate(-150px, -75px); opacity: 0; }
          12% { opacity: 1; }
          86% { opacity: 1; }
          100% { transform: translate(390px, 195px); opacity: 0; }
        }
        @keyframes isoBayMicroHover {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(0px, -2.5px); }
        }
        @keyframes isoBayPrep {
          0%, 100% { transform: translate(-12px, -6px); }
          50% { transform: translate(24px, 12px); }
        }
        @keyframes isoLaserScan {
          0% { transform: translate(0px, 0px); opacity: 0.85; }
          100% { transform: translate(56px, 28px); opacity: 0.45; }
        }
        @keyframes isoWheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes isoCheckPop {
          0% { opacity: 0; transform: scale(0.4); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes isoRipple {
          0% { transform: scale(0.8); opacity: 0.85; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes isoDrawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes isoToastIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 760px) {
          .jasman-iso-footer-strip {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 12px 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

