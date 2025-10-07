import { usePWA } from '../hooks/use-pwa';
import { Badge } from '../presentation/components/ui/badge';

export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="destructive" className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Modo Offline
      </Badge>
    </div>
  );
}
