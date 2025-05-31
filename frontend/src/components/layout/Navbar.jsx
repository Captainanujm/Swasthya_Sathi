import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [];
    }

    const commonLinks = [
      { text: 'Home', href: '/' },
      { text: 'Lookup Patient', href: '/lookup-patient' },
    ];

    const roleLinks = {
      doctor: [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Posts', href: '/doctor/posts' },
        { text: 'Chat', href: '/chat' },
      ],
      patient: [
        { text: 'SnapMed', href: '/medical-summary' },
        { text: 'Swasthya Card', href: '/swasthya-card' },
        { text: 'Medical Reports', href: '/medical-reports' },
        // { text: 'Disease Detection', href: '/disease-detection' },
        { text: 'CareRing', href: '/care' },
        { text: 'Doctors', href: '/doctors' },
        { text: 'Posts', href: '/posts' },
        { text: 'Consultance', href: '/chat' },
      ],
      admin: [
        { text: 'Dashboard', href: '/admin/dashboard' },
        { text: 'Doctor Requests', href: '/admin/doctor-requests' },
      ],
    };

    return [...commonLinks, ...(user ? roleLinks[user.role] || [] : [])];
  };

  // Role-specific styling
  const getRoleStyling = () => {
    if (!user) return {};
    
    const styles = {
      doctor: {
        bgColor: 'bg-doctor',
        textColor: 'text-doctor',
        hoverBg: 'hover:bg-doctor/10',
        borderColor: 'border-doctor',
      },
      patient: {
        bgColor: 'bg-patient',
        textColor: 'text-patient',
        hoverBg: 'hover:bg-patient/10',
        borderColor: 'border-patient',
      },
      admin: {
        bgColor: 'bg-admin',
        textColor: 'text-admin',
        hoverBg: 'hover:bg-admin/10',
        borderColor: 'border-admin',
      },
    };

    return styles[user.role] || styles.patient;
  };

  const navLinks = getNavLinks();
  const roleStyle = getRoleStyling();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-16 items-center">
        <div className="flex w-full justify-between">
          {/* Logo and site name */}
          <Link 
            to="/" 
            className="flex items-center space-x-2" 
            onClick={closeMenus}
          >
            <img src="/images/logo.png" alt="Swasthya Sathi Logo" className="h-14 w-auto" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Swasthya Sathi</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-2 lg:space-x-3">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-sm font-medium transition-colors hover:text-blue-600 px-3 py-2 rounded-md"
                onClick={closeMenus}
              >
                {link.text}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-colors"
                  onClick={toggleProfile}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name || 'User profile'} 
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r ${
                      user?.role === 'doctor' ? 'from-indigo-500 to-indigo-700' : 
                      user?.role === 'admin' ? 'from-red-500 to-red-700' : 
                      'from-blue-500 to-blue-700'} text-white font-medium`}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </Button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-3 text-sm font-medium border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <p className="font-bold">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.role || 'User'}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                        onClick={closeMenus}
                      >
                        <User size={16} className="mr-2 text-blue-600" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                      >
                        <LogOut size={16} className="mr-2 text-blue-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} 
                  className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md transition-all">
                  Register
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="flex items-center md:hidden text-blue-600"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="container pb-4 md:hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-lg shadow-inner">
          <nav className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/60"
                onClick={closeMenus}
              >
                {link.text}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-3 py-2 space-x-2 border-t border-blue-200 mt-2 pt-3">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name || 'User profile'} 
                      className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${
                      user?.role === 'doctor' ? 'from-indigo-500 to-indigo-700' : 
                      user?.role === 'admin' ? 'from-red-500 to-red-700' : 
                      'from-blue-500 to-blue-700'} text-white font-medium border-2 border-white shadow-sm`}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-medium">{user?.name || 'User'}</span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-white/60"
                  onClick={closeMenus}
                >
                  <User size={16} className="mr-2 text-blue-600" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-white/60 text-left w-full"
                >
                  <LogOut size={16} className="mr-2 text-blue-600" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 px-3 pb-2">
                <Button variant="outline" onClick={() => { navigate('/login'); closeMenus(); }}
                  className="border-2 border-blue-500 text-blue-700 hover:bg-white transition-colors w-full justify-center">
                  Login
                </Button>
                <Button onClick={() => { navigate('/register'); closeMenus(); }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md transition-all w-full justify-center">
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar; 