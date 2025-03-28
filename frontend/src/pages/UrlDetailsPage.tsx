import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchUrlById, incrementUrlVisits } from '../store/slices/urlSlice';
import { toast } from 'react-toastify';
import Tooltip from '../components/Tooltip';
import { ArrowLeftIcon, ClipboardIcon } from '../components/icons';
import { useTabVisibility } from '../hooks/useTabVisibility';

// Get the base URL from environment or use default
const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const UrlDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUrl, loading, error } = useSelector((state: RootState) => state.url);
  const [visitCount, setVisitCount] = useState(0);

  // Function to refresh URL data
  const refreshData = useCallback(() => {
    if (id) {
      dispatch(fetchUrlById(id));
    }
  }, [dispatch, id]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Use the tab visibility hook to refresh data when tab becomes visible
  useTabVisibility(refreshData);

  useEffect(() => {
    if (currentUrl) {
      setVisitCount(currentUrl.visits);
    }
  }, [currentUrl]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'));
  };

  if (loading && !currentUrl) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !currentUrl) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load URL details. Please try again later.</span>
      </div>
    );
  }

  // Use the backend URL for the short URL
  const shortUrl = `${baseURL}/${currentUrl.slug}`;

  const handleUrlClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default to handle the click manually
    event.preventDefault();
    
    if (currentUrl) {
      // Dispatch action to increment visit count in the store
      dispatch(incrementUrlVisits(currentUrl.id));
      
      // Open the URL in a new tab
      window.open(shortUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          to="/dashboard" 
          className="text-cyan-600 hover:text-cyan-800 flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">URL Details</h1>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Original URL</h2>
            <p className="text-gray-600 break-all">{currentUrl.originalUrl}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Short URL</h2>
            <div className="flex items-center justify-center">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-800 mr-2"
                onClick={handleUrlClick}
              >
                {shortUrl}
              </a>

              <Tooltip content="Copy to clipboard" position="top">
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Visits</h3>
              <p className="text-2xl font-bold text-gray-800 visit-count">{visitCount}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created On</h3>
              <p className="text-gray-800">{new Date(currentUrl.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Visited</h3>
              <p className="text-gray-800">
                {new Date(currentUrl.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Visit Statistics</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            No tracking data available for this URL yet.
          </div>
        </div>
      </div>


      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">QR Code</h2>
        </div>
        <div className="p-6 flex justify-center">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`} 
            alt="QR Code"
            className="h-48 w-48"
          />
        </div>
      </div>
    </div>
  );
};

export default UrlDetailsPage;
