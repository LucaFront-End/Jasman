import { useState } from 'react';

/**
 * Renders the 3/4 tire view with multi-plane 3D depth (preserve-3d),
 * a perspective platform, floor reflection, and dynamic specular rim lighting.
 */
export default function Tire3DStudioStage({
  product,
  rx = 0,
  ry = 0,
  spotX = 50,
  spotY = 50,
  scrollScale = 1,
  scrollFloatY = 0,
  ringRotation = 0,
  size = 'clamp(250px, 31vw, 390px)',
}) {
  const [prevProdId, setPrevProdId] = useState(product.id);
  const [isSwitching, setIsSwitching] = useState(false);

  if (product.id !== prevProdId) {
    setPrevProdId(product.id);
    setIsSwitching(true);
    setTimeout(() => setIsSwitching(false), 600);
  }

  // Always use the 3/4 view (HD transparent PNG cutout when available, otherwise primary 3/4 image)
  const activeImgSrc = product.hasPngCutout
    ? product.cutoutImage
    : product.cutoutImage || product.primaryImage;

  const isCutoutPng = Boolean(product.hasPngCutout);

  // Smooth 3D gimbal tilt
  const gimbalRx = rx * 0.85;
  const gimbalRy = ry * 1.15;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1200,
        userSelect: 'none',
      }}
    >
      {/* 3D Gimbal Rig */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `scale(${scrollScale}) translateY(${scrollFloatY}px) rotateX(${gimbalRx}deg) rotateY(${gimbalRy}deg)`,
          transition: isSwitching
            ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.16s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* PLANE -1 (translateZ -45px): Perspective Turntable Base */}
        <div
          style={{
            position: 'absolute',
            bottom: '-8%',
            width: '112%',
            height: '112%',
            borderRadius: '50%',
            transform: `translateZ(-45px) rotateX(75deg) rotateZ(${ringRotation}deg)`,
            border: '1.5px dashed rgba(196, 30, 36, 0.32)',
            boxShadow:
              '0 0 50px rgba(196, 30, 36, 0.08), inset 0 0 40px rgba(26, 31, 54, 0.05)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '14%',
              borderRadius: '50%',
              border: '1px solid rgba(26, 31, 54, 0.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '28%',
              borderRadius: '50%',
              border: '1px dashed rgba(26, 31, 54, 0.10)',
            }}
          />
        </div>

        {/* Contact Shadow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4%',
            left: '14%',
            right: '14%',
            height: 34,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(26, 31, 54, 0.34) 0%, rgba(26, 31, 54, 0.12) 48%, rgba(26, 31, 54, 0) 76%)',
            filter: 'blur(7px)',
            transform: 'translateZ(-20px)',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle Mirror Floor Reflection of the 3/4 Tire */}
        <img
          src={activeImgSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-24%',
            width: '82%',
            height: '82%',
            objectFit: 'contain',
            transform: 'translateZ(-25px) scaleY(-0.26)',
            opacity: 0.13,
            filter: 'blur(5px)',
            mixBlendMode: 'multiply',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 65%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* PLANE 0 (translateZ +22px): High-Definition Sculpted 3/4 Tire Cutout */}
        <div
          style={{
            position: 'relative',
            width: '92%',
            height: '92%',
            transform: 'translateZ(22px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            key={product.id}
            src={activeImgSrc}
            alt={product.cleanTitle}
            onError={(e) => {
              e.currentTarget.src = product.primaryImage;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: isCutoutPng ? 'normal' : 'multiply',
              filter: isCutoutPng
                ? 'drop-shadow(0 28px 36px rgba(26, 31, 54, 0.25)) contrast(1.04)'
                : 'brightness(1.03) contrast(1.08)',
              transform: isSwitching ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Dynamic Specular Rim-Light Glint tracking cursor */}
          <div
            style={{
              position: 'absolute',
              inset: '6%',
              borderRadius: '50%',
              background: `radial-gradient(circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 52%)`,
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
            }}
          />

          {/* Subtle transition sweep when switching models */}
          {isSwitching && (
            <div
              style={{
                position: 'absolute',
                left: '8%',
                right: '8%',
                height: 2,
                background:
                  'linear-gradient(90deg, transparent 0%, #C41E24 20%, #FF6B70 50%, #C41E24 80%, transparent 100%)',
                boxShadow: '0 0 18px 4px rgba(196, 30, 36, 0.45)',
                animation: 'tireLaserScan 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes tireLaserScan {
          0% { top: 8%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
