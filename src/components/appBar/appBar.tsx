import * as React from 'react';
import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Home, MapPin, UserCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/languageSwitcher/languageSwitcher';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Logo } from '@/components/logo/logo';
import { Context } from '@/context/AppContext';

function ResponsiveAppBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = useContext(Context);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const userInfo = appContext?.state.userInfo;
  const isAuthenticated = Boolean(userInfo?.id);

  const handleLogoutClick = () => {
    appContext?.actions.clearAuth();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: t('common.home'), icon: Home },
    { path: '/tour', label: t('common.tours'), icon: MapPin },
    { path: '/tour/nearby', label: t('tours.nearbyTours'), icon: MapPin },
    { path: '/tour/create', label: t('tours.createTour'), icon: MapPin },
    { path: '/mytour', label: t('common.myTours'), icon: MapPin },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo showText={true} size="md" />

        {/* Desktop Navigation - Only when authenticated */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side: Auth buttons / User menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Login/Signup - Always visible in header when NOT authenticated (like Airbnb, TripAdvisor) */}
          {!isAuthenticated && (
            <>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/login" state={{ from: location }}>{t('common.login')}</Link>
              </Button>
              <Button asChild className="hidden md:flex">
                <Link to="/register">{t('common.signup')}</Link>
              </Button>
            </>
          )}

          {/* User Avatar Menu - When authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center">
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>{t('common.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Burger Menu - For mobile navigation and when authenticated on mobile */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">{t('common.menu')}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-1 flex-1 px-4 py-4 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive(item.path)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Section - Mobile */}
                {isAuthenticated && (
                  <div className="border-t px-4 py-4 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{userInfo?.name || t('common.user')}</p>
                        <p className="text-xs text-muted-foreground">{t('common.viewProfile')}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span>{t('common.profile')}</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}

                {/* Login/Signup - Mobile only (when not authenticated) */}
                {!isAuthenticated && (
                  <div className="border-t px-4 py-4 space-y-2">
                    <Button asChild className="w-full" variant="default">
                      <Link
                        to="/login"
                        state={{ from: location }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('common.login')}
                      </Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        {t('common.signup')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default ResponsiveAppBar;
