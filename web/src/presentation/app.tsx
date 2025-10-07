import AppLayout from './layout/layout';
import Modals from './components/internal/modals/modals';
import { Toaster } from './components/ui/toaster';
import { DrawerProvider } from './components';
import { PWAUpdatePrompt } from '../components/pwa-update-prompt';
import { OfflineIndicator } from '../components/offline-indicator';

function App() {
  return (
    <main>
      <AppLayout />
      <Modals />
      <DrawerProvider />
      <Toaster />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </main>
  );
}

export default App;
