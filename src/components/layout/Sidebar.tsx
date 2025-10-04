import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { NavigationItem } from '@/types';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['administrador', 'cliente'],
    },
    {
      label: 'Empréstimos',
      href: '/emprestimos',
      icon: 'CreditCard',
      roles: ['administrador', 'cliente'],
    },
    {
      label: 'Clientes',
      href: '/clientes',
      icon: 'Users',
      roles: ['administrador'],
    },
    {
      label: 'Relatórios',
      href: '/relatorios',
      icon: 'BarChart3',
      roles: ['administrador'],
    },
    {
      label: 'Conteúdos',
      href: '/conteudos',
      icon: 'FileText',
      roles: ['administrador', 'cliente'],
    },
    {
      label: 'Perfil',
      href: '/perfil',
      icon: 'User',
      roles: ['administrador', 'cliente'],
    },
    {
      label: 'Componentes Demo',
      href: '/demo',
      icon: 'Sparkles',
      roles: ['administrador'],
    },
    {
      label: 'Seed Data',
      href: '/admin/seed',
      icon: 'Database',
      roles: ['administrador'],
    },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      LayoutDashboard,
      CreditCard,
      Users,
      FileText,
      User,
      Database,
      BarChart3,
      Sparkles,
    };
    return icons[iconName as keyof typeof icons] || LayoutDashboard;
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (onClose) {
      onClose();
    }
  };

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'cliente')
  );

  return (
    <div className={cn(
      "flex h-full flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Logo and Collapse Button */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-gradient leading-none">
                CyberFlix
              </h2>
              <p className="text-xs text-muted-foreground">
                Empréstimos
              </p>
            </div>
          </div>
        )}
        
        {/* Mobile Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Desktop Collapse Button */}
        {onToggleCollapse && !onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredItems.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <Button
              key={item.href}
              variant={isActive(item.href) ? 'secondary' : 'ghost'}
              className={cn(
                'w-full transition-all duration-200',
                isCollapsed 
                  ? 'justify-center px-2 h-10' 
                  : 'justify-start px-3 h-10',
                isActive(item.href) && 'bg-secondary/20 shadow-sm'
              )}
              onClick={() => handleNavigation(item.href)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn(
                "h-4 w-4",
                !isCollapsed && "mr-3"
              )} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-2">
        <div className={cn(
          "flex items-center transition-all duration-200",
          isCollapsed ? "justify-center" : "space-x-2"
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {user?.displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
