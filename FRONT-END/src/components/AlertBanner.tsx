import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AlertBannerProps {
  message: string;
  resourceName: string;
}

export const AlertBanner = ({ message, resourceName }: AlertBannerProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert className="glass-strong border-critical/50 glow-critical animate-in slide-in-from-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-critical animate-pulse" />
          <div>
            <AlertDescription className="text-foreground font-semibold">
              ⚠️ ALERTA CRÍTICA: {resourceName}
            </AlertDescription>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVisible(false)}
          className="hover:bg-critical/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
