import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '../store';
import { setToken } from '../store/slices/authSlice';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    const message = params.get('message');

    if (token) {
      dispatch(setToken(token));
      toast.success('Authentication successful!');
      navigate('/dashboard');
    } else if (error) {
      // Display the error message from the backend if available
      const errorMessage = message 
        ? decodeURIComponent(message)
        : 'Authentication failed. Please try again.';
      
      toast.error(errorMessage);
      navigate('/login');
    } else {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
    }
  }, [dispatch, location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallbackPage;
