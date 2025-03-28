import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { LinkIcon, MenuIcon } from './icons';
import Container from './Container';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <Container>
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-xl font-bold text-cyan-600 hover:text-cyan-800">
              <LinkIcon className="h-6 w-6 mr-2" />
              URL Shortener
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                {isOnDashboard ? (
                  <span
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 bg-slate-100 cursor-default"
                    aria-current="page"
                  >
                    Dashboard
                  </span>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                >
                  Logout
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-500">
                  {user?.firstName || user?.email}
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            >
              <MenuIcon className="h-6 w-6" isOpen={isMenuOpen} />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <Container>
            <div className="pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated ? (
                <>
                  {isOnDashboard ? (
                    <span
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 bg-slate-100 cursor-default"
                      aria-current="page"
                    >
                      Dashboard
                    </span>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                  <span className="block px-3 py-2 text-base font-medium text-gray-500">
                    {user?.firstName || user?.email}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
