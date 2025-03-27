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

    if (token) {
      dispatch(setToken(token));
      toast.success('Authentication successful!');
      navigate('/dashboard');
    } else {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
    }
  }, [dispatch, location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallbackPage;
