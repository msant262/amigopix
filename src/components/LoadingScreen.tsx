import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gradient">CyberFlix Empréstimos</h2>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </div>
  );
};
