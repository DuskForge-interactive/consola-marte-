import { Rocket } from 'lucide-react';

export const Header = () => {
  return (
    <header className="glass-strong border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-mars">
                Mars Cargo Control
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                ORBITAL STATION • SECTOR-7
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Mission Time</p>
              <p className="text-sm font-bold text-foreground font-mono">
                SOL {Math.floor(Date.now() / 86400000)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full glass flex items-center justify-center border border-accent/30">
              <span className="text-lg">🧑‍🚀</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
