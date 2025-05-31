import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'react-router-dom';

// Simple Footer component
const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-border">
      <div className="container flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Swasthya Sathi. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-6">
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 