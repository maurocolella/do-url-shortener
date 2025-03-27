import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../store';
import { createUrl } from '../store/slices/urlSlice';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const { loading, currentUrl } = useSelector((state: RootState) => state.url);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      await dispatch(createUrl({ 
        originalUrl: url,
        customSlug: customSlug || undefined
      })).unwrap();
      
      toast.success('URL shortened successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to shorten URL');
    }
  };

  const copyToClipboard = () => {
    if (currentUrl?.shortUrl) {
      navigator.clipboard.writeText(currentUrl.shortUrl);
      toast.success('URL copied to clipboard!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">URL Shortener</h1>
        <p className="text-xl text-gray-600">
          Create short, easy-to-share links in seconds.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your long URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="customSlug"
              checked={showCustomSlug}
              onChange={() => setShowCustomSlug(!showCustomSlug)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="customSlug" className="ml-2 block text-sm text-gray-700">
              Use custom slug
            </label>
          </div>

          {showCustomSlug && (
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Custom slug (optional)
              </label>
              <input
                type="text"
                id="slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-slug"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for a randomly generated slug.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {currentUrl && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your shortened URL:</h3>
            <div className="flex items-center">
              <input
                type="text"
                value={currentUrl.shortUrl}
                readOnly
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none"
              >
                Copy
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Original URL: {currentUrl.originalUrl}</p>
              <p>Created: {new Date(currentUrl.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Fast & Easy</h3>
          <p className="text-gray-600">Create short links in seconds without any registration.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
          <p className="text-gray-600">All links are secured with HTTPS and available 24/7.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
          <p className="text-gray-600">Track clicks and analyze traffic with our dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
