import { Link } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCatalogSection from '../components/tienda/TiendaCatalogSection';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';
import {
  ArrowLeft,
  Truck,
  MapPin,
} from 'lucide-react';

export default function CatalogoPreviewPage() {
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
          background: '#F5F5F7',
          padding: '106px 24px 6px',
        }}
      >
        <div
          className="jasman-catalogo-top-inner"
          style={{
            maxWidth: 1260,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          {/* Left: Back to Store Landing */}
          <div
            className="jasman-catalogo-back-wrap"
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
          >
            <Link
              to="/llantas"
              className="jasman-catalogo-back-pill"
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
          </div>

          {/* Right: Store Value Pills */}
          <div
            className="jasman-catalogo-perks-wrap"
            style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
          >
            {[
              { icon: Truck, label: 'Entrega a Domicilio Gratis', short: 'Envío Gratis' },
              { icon: MapPin, label: '+80 Sucursales Jasman', short: '+80 Sucursales' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.label}
                  className="jasman-catalogo-perk-pill"
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
                  <IconComp size={13} color={C.red} style={{ flexShrink: 0 }} />
                  <span className="jasman-perk-full">{item.label}</span>
                  <span className="jasman-perk-short" style={{ display: 'none' }}>
                    {item.short}
                  </span>
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
            padding: 90px 14px 2px !important;
          }
          .jasman-catalogo-top-inner {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            gap: 8px !important;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .jasman-catalogo-top-inner::-webkit-scrollbar {
            display: none;
          }
          .jasman-catalogo-back-wrap,
          .jasman-catalogo-perks-wrap {
            flex-wrap: nowrap !important;
            gap: 6px !important;
            flex-shrink: 0 !important;
          }
          .jasman-catalogo-back-pill {
            padding: 6px 12px !important;
            font-size: 10px !important;
            gap: 5px !important;
            white-space: nowrap !important;
          }
          .jasman-catalogo-perk-pill {
            padding: 6px 10px !important;
            font-size: 10px !important;
            gap: 5px !important;
            white-space: nowrap !important;
          }
          .jasman-perk-full {
            display: none !important;
          }
          .jasman-perk-short {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}

