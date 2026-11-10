import { Link } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import { useWixCatalogProducts } from '../data/productosMasterData';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCatalogSection from '../components/tienda/TiendaCatalogSection';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';
import {
  ArrowLeft,
  Sparkles,
  Truck,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function CatalogoPreviewPage() {
  const { products: catalogProducts } = useWixCatalogProducts();
  const totalStock = catalogProducts.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', color: C.navy }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal />
      <FirstPurchasePopup />
      <TiendaLiveChatWidget />

      {/* Minimalist Architectural Top Header for the Full Catalog Page */}
      <div
        className="jasman-catalogo-top-header"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
          padding: '126px 24px 12px',
          borderBottom: '1px solid rgba(26, 31, 54, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Left: Back to Store Landing + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/landing-tienda-preview"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 9999,
                background: '#FFFFFF',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} color={C.red} /> Inicio Tienda
            </Link>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 9999,
                background: 'rgba(196, 30, 36, 0.08)',
                color: C.red,
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={12} /> Catálogo General · {catalogProducts.length} Modelos ({totalStock} uds.)
            </div>
          </div>

          {/* Right: Store Value Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: Truck, label: 'Entrega a Domicilio Gratis' },
              { icon: MapPin, label: '+80 Sucursales Jasman' },
              { icon: ShieldCheck, label: 'Hasta −10% OFF por Volumen' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 13px',
                    borderRadius: 9999,
                    background: '#FFFFFF',
                    border: '1px solid rgba(26, 31, 54, 0.07)',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: C.navy,
                  }}
                >
                  <IconComp size={13} color={C.red} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Interactive Catalog with All Tires & Filters */}
      <TiendaCatalogSection
        id="catalogo-tienda"
        isFullCatalogPage={true}
      />
      <style>{`
        @media (max-width: 640px) {
          .jasman-catalogo-top-header {
            padding: 102px 16px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

