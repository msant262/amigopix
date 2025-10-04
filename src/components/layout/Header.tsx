import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OriginButton, OriginBadge } from '@/components/origin';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (true) {
      case path.includes('/dashboard'):
        return 'Dashboard';
      case path.includes('/emprestimos'):
        return 'Empréstimos';
      case path.includes('/clientes'):
        return 'Clientes';
      case path.includes('/conteudos'):
        return 'Conteúdos';
      case path.includes('/perfil'):
        return 'Perfil';
      default:
        return 'CyberFlix Empréstimos';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      {/* Safe area for devices with notch */}
      <div className="pt-safe-area-inset-top">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 lg:hidden flex-1 min-w-0">
            <OriginButton
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-10 w-10 shrink-0 backdrop-blur-sm"
            >
              <Menu className="h-5 w-5" />
            </OriginButton>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent truncate">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {user?.displayName}
              </p>
            </div>
          </div>

        {/* Desktop Title - Simplified for collapsed sidebar */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.displayName} • {user?.role}
              </p>
            </div>
          </div>
        </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Notifications */}
            <OriginButton variant="ghost" size="icon" className="h-10 w-10 backdrop-blur-sm">
              <Bell className="h-5 w-5" />
            </OriginButton>

            {/* User Menu - Simplified for mobile */}
            <div className="flex items-center space-x-1">
              {/* Role badge - hidden on very small screens */}
              <OriginBadge 
                variant={user?.role === 'administrador' ? 'default' : 'secondary'}
                className="hidden xs:flex text-xs"
              >
                {user?.role}
              </OriginBadge>
              
              <OriginButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/perfil')}
                className="h-10 w-10 backdrop-blur-sm"
              >
                <User className="h-5 w-5" />
              </OriginButton>
              
              <OriginButton
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-10 w-10 text-destructive hover:text-destructive backdrop-blur-sm"
              >
                <LogOut className="h-5 w-5" />
              </OriginButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
