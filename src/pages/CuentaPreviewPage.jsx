import { useNavigate } from 'react-router-dom';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaUserSection from '../components/tienda/TiendaUserSection';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';

export default function CuentaPreviewPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal
        forceOpen={true}
        onCloseForce={() => navigate('/landing-tienda-preview')}
      />
      <FirstPurchasePopup />
      <TiendaLiveChatWidget />
      <TiendaUserSection isStandalonePage />
    </div>
  );
}

