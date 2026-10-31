import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaUserSection from '../components/tienda/TiendaUserSection';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';

export default function CuentaPreviewPage() {
  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal forceOpen={true} />
      <FirstPurchasePopup />
      <TiendaLiveChatWidget />
      <TiendaUserSection isStandalonePage />
    </div>
  );
}

