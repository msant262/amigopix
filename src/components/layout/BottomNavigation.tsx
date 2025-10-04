import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  User,
} from 'lucide-react';
import { NavigationItem } from '@/types';

export const BottomNavigation: React.FC = () => {
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
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      LayoutDashboard,
      CreditCard,
      Users,
      FileText,
      User,
    };
    return icons[iconName as keyof typeof icons] || LayoutDashboard;
  };

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'cliente')
  );

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-t border-border/50 shadow-lg"
    >
      {/* Safe area for devices with home indicator */}
      <div className="pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredItems.map((item, index) => {
            const Icon = getIcon(item.icon);
            const active = isActive(item.href);
            
            return (
              <motion.button
                key={item.href}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 min-h-[48px] min-w-[48px] rounded-xl transition-all duration-300 ease-out group',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => navigate(item.href)}
              >
                {/* Background highlight for active item */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl border border-primary-200/50"
                    initial={false}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                  active 
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25" 
                    : "group-hover:bg-primary-50 dark:group-hover:bg-primary-950/20"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active ? "text-white scale-110" : "group-hover:text-primary-600 group-hover:scale-105"
                  )} />
                </div>
                
                {/* Label */}
                <motion.span 
                  className={cn(
                    "relative z-10 text-xs font-medium mt-1 transition-all duration-300",
                    active ? "text-primary font-semibold" : "group-hover:text-foreground"
                  )}
                  animate={{ 
                    scale: active ? 1.05 : 1,
                    fontWeight: active ? 600 : 500
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
                
                {/* Active indicator */}
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
