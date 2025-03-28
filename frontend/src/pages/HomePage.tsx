import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createUrl, clearCurrentUrl } from '../store/slices/urlSlice';
import { toast } from 'react-toastify';
import { LightningIcon, ShieldIcon, ChartIcon } from '../components/icons'; // Import the icon components

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { currentUrl, loading } = useSelector((state: RootState) => state.url);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Clear currentUrl when component mounts
  useEffect(() => {
    dispatch(clearCurrentUrl());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Reset form after successful URL creation
  useEffect(() => {
    if (currentUrl && !loading) {
      setUrl('');
      setCustomSlug('');
    }
  }, [currentUrl, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const urlData = {
      originalUrl: url,
      ...(showCustomSlug && customSlug ? { customSlug } : {})
    };

    dispatch(createUrl(urlData));
  };

  const handleTooltipShow = () => {
    if (!isAuthenticated) {
      setShowTooltip(true);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    }
  };

  const handleTooltipHide = () => {
    if (!isAuthenticated) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 300);
    }
  };

  const copyToClipboard = () => {
    if (!currentUrl) return;
    
    navigator.clipboard.writeText(currentUrl.shortUrl)
      .then(() => {
        toast.success('URL copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy URL');
      });
  };

  return (
    <div className="container mx-auto px-4 py-12" data-testid="homepage-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4" data-testid="homepage-title">
          Shortr &bull; URL Shortener
        </h1>
        <p className="text-xl text-slate-600" data-testid="homepage-subtitle">
          Create short, easy-to-share links in seconds.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md" data-testid="url-shortener-form-container">
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="url-shortener-form">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
              Enter your long URL
            </label>
            <input
              type="url"
              id="url"
              data-testid="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex items-center relative">
            <input
              type="checkbox"
              id="customSlug"
              data-testid="custom-slug-checkbox"
              checked={showCustomSlug}
              onChange={() => isAuthenticated && setShowCustomSlug(!showCustomSlug)}
              disabled={!isAuthenticated}
              className={`h-4 w-4 focus:ring-cyan-500 border-slate-300 rounded ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'text-cyan-600'}`}
              onMouseEnter={handleTooltipShow}
              onMouseLeave={handleTooltipHide}
            />
            <label 
              htmlFor="customSlug" 
              className={`ml-2 block text-sm ${!isAuthenticated ? 'text-slate-500' : 'text-slate-700'}`}
              onMouseEnter={handleTooltipShow}
              onMouseLeave={handleTooltipHide}
            >
              Use custom slug
            </label>
            {showTooltip && !isAuthenticated && (
              <div 
                className="absolute left-0 bottom-8 bg-slate-800 text-white text-xs rounded py-1 px-2 w-64 z-10"
                onMouseEnter={handleTooltipShow}
                onMouseLeave={handleTooltipHide}
                data-testid="custom-slug-tooltip"
              >
                <div className="absolute left-2 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
                Custom slugs are only available for registered users. 
                <Link to="/register" className="text-cyan-300 hover:text-cyan-200 ml-1">
                  Sign up now
                </Link>
              </div>
            )}
          </div>

          {showCustomSlug && (
            <div data-testid="custom-slug-container">
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
                Custom slug (optional)
              </label>
              <input
                type="text"
                id="slug"
                data-testid="custom-slug-input"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-slug"
                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="mt-1 text-sm text-slate-500">
                Leave empty for a randomly generated slug.
              </p>
            </div>
          )}

          <button
            type="submit"
            data-testid="shorten-button"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-3 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {currentUrl && (
          <div className="mt-8 p-4 bg-slate-50 rounded-md" data-testid="shortened-url-container">
            <h3 className="text-lg font-medium text-slate-800 mb-2">Your shortened URL:</h3>
            <div className="flex items-center">
              <input
                type="text"
                data-testid="shortened-url-output"
                value={currentUrl.shortUrl}
                readOnly
                className="flex-grow px-4 py-2 border border-slate-300 rounded-l-md focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                data-testid="copy-url-button"
                className="bg-cyan-600 text-white px-4 py-2 rounded-r-md hover:bg-cyan-700 focus:outline-none"
              >
                Copy
              </button>
            </div>
            <div className="mt-2 text-sm text-slate-600">
              <p data-testid="original-url-display">Original URL: {currentUrl.originalUrl}</p>
              <p data-testid="creation-date-display">Created: {new Date(currentUrl.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16" data-testid="features-section">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-cyan-600 text-4xl mb-4">
            <LightningIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Lightning Fast</h3>
          <p className="text-slate-600">Create shortened URLs in seconds with our optimized service.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-cyan-600 text-4xl mb-4">
            <ShieldIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Secure Links</h3>
          <p className="text-slate-600">All links are securely generated and tracked to protect your data.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-cyan-600 text-4xl mb-4">
            <ChartIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Detailed Analytics</h3>
          <p className="text-slate-600">Track clicks and visitor information for your shortened URLs.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
