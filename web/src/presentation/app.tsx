import React from 'react';
import AppLayout from './layout/layout';
import Modals from './components/internal/modals/modals';
import { Toaster } from './components/ui/toaster';
import { DrawerProvider } from './components';

function App() {
  return (
    <main>
      <AppLayout />
      <Modals />
      <DrawerProvider />
      <Toaster />
    </main>
  );
}

export default App;
