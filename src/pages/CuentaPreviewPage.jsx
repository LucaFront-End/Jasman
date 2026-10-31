import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaUserSection from '../components/tienda/TiendaUserSection';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';

export default function CuentaPreviewPage() {
  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <FirstPurchasePopup />
      <TiendaUserSection isStandalonePage />
    </div>
  );
}

