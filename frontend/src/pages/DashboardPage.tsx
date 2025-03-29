import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { createUrl, deleteUrl, fetchUrls, fetchStats, incrementUrlVisits, clearCurrentUrl } from '../store/slices/urlSlice';
import { toast } from 'react-toastify';
import { IUrl } from '../types/url.types';
import Tooltip from '../components/Tooltip';
import { ClipboardIcon, EyeIcon, TrashIcon } from '../components/icons';
import { useTabVisibility } from '../hooks/useTabVisibility';
import { handleUrlShorteningError } from '../utils/error-handler';

const DashboardPage = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const { urls, loading, stats } = useSelector((state: RootState) => state.url);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Function to refresh dashboard data
  const refreshData = useCallback(() => {
    dispatch(fetchUrls());
    dispatch(fetchStats());
  }, [dispatch]);

  // Initial data load
  useEffect(() => {
    refreshData();
    dispatch(clearCurrentUrl());
  }, [refreshData, dispatch]);

  // Use the tab visibility hook to refresh data when tab becomes visible
  useTabVisibility(refreshData);

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      toast.error('Please enter a URL');
      return;
    }
    
    try {
      await dispatch(createUrl({ 
        originalUrl,
        customSlug: customSlug || undefined
      })).unwrap();
      
      setOriginalUrl('');
      setCustomSlug('');
      toast.success('URL shortened successfully!');
      
      // Refresh data after creating a new URL to update stats and topUrls
      refreshData();
    } catch (error) {
      handleUrlShorteningError(error);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await dispatch(deleteUrl(id)).unwrap();
        toast.success('URL deleted successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete URL';
        toast.error(errorMessage);
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleUrlClick = (url: IUrl, event: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default to handle the click manually
    event.preventDefault();
    
    // Dispatch action to increment visit count in the store
    dispatch(incrementUrlVisits(url.id));
    
    // Open the URL in a new tab
    window.open(url.shortUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="dashboard-container">
      <div className="mb-8" data-testid="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600" data-testid="user-greeting">
          Welcome back, {user?.firstName || user?.email}!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="stats-container">
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="total-urls-stat">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total URLs</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.totalUrls}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="total-visits-stat">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Visits</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.totalVisits}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="avg-visits-stat">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Average Visits</h3>
            <p className="text-3xl font-bold text-cyan-600">
              {stats.totalUrls > 0 ? Math.round(stats.totalVisits / stats.totalUrls) : 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="url-list-container">
            <h2 className="text-xl font-semibold mb-4">Your URLs</h2>
            
            {loading ? (
              <div className="flex justify-center py-8" data-testid="url-list-loading">
                <div className="rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 animate-spin"></div>
              </div>
            ) : urls.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="url-list-empty">
                <p>You haven't created any URLs yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" data-testid="url-table-container">
                <table className="w-full divide-y divide-gray-200" data-testid="url-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Short URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visits
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {urls.map((url: IUrl) => (
                      <tr key={url.id} className="hover:bg-gray-50" data-testid={`url-item-${url.id}`}>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="truncate max-w-[200px] text-left">
                            <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="black-link hover:underline" data-testid={`original-url-${url.id}`}>
                              {url.originalUrl}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center justify-end">
                            <a 
                              href={url.shortUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => handleUrlClick(url, e)} 
                              className="text-cyan-600 hover:underline mr-2 truncate"
                              data-testid={`short-url-${url.id}`}
                            >
                              {url.slug}
                            </a>
                            <Tooltip content="Copy to clipboard" position="top">
                              <button
                                onClick={() => copyToClipboard(url.shortUrl)}
                                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                data-testid={`copy-button-${url.id}`}
                              >
                                <ClipboardIcon className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" data-testid={`visits-${url.id}`}>
                          {url.visits}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" data-testid={`created-date-${url.id}`}>
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right">
                          <div className="flex justify-end items-center space-x-3 h-full">
                            <Tooltip content="View details" position="top">
                              <Link 
                                to={`/urls/${url.id}`} 
                                className="text-cyan-600 hover:text-cyan-900"
                                data-testid={`details-button-${url.id}`}
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                            </Tooltip>
                            <Tooltip content="Delete URL" position="top">
                              <button
                                onClick={() => handleDeleteUrl(url.id)}
                                className="text-red-600 hover:text-red-900"
                                data-testid={`delete-button-${url.id}`}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="url-form-container">
            <h2 className="text-xl font-semibold mb-4">Shorten New URL</h2>
            <form onSubmit={handleCreateUrl} className="space-y-4" data-testid="url-creation-form">
              <div>
                <label htmlFor="original-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your long URL
                </label>
                <input
                  type="url"
                  id="original-url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  data-testid="url-input"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-custom-slug"
                  checked={showCustomSlug}
                  onChange={() => setShowCustomSlug(!showCustomSlug)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  data-testid="custom-slug-checkbox"
                />
                <label htmlFor="show-custom-slug" className="ml-2 block text-sm text-gray-700">
                  Use custom slug
                </label>
              </div>

              {showCustomSlug && (
                <div data-testid="custom-slug-container">
                  <label htmlFor="custom-slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom slug (optional)
                  </label>
                  <input
                    type="text"
                    id="custom-slug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-custom-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    data-testid="custom-slug-input"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for a randomly generated slug.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
                data-testid="shorten-button"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>
          </div>
          
          {stats && stats.topUrls && stats.topUrls.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-6" data-testid="top-urls-container">
              <h2 className="text-xl font-semibold mb-4">Top Performing URLs</h2>
              <ul className="space-y-3">
                {stats.topUrls.map((url: IUrl) => (
                  <li key={url.id} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <div className="truncate max-w-[180px]">
                        <a 
                          href={url.shortUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-cyan-600 hover:underline"
                          onClick={(e) => handleUrlClick(url, e)}
                          data-testid={`top-url-${url.id}`}
                        >
                          {url.slug}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500" data-testid={`top-url-visits-${url.id}`}>
                        {url.visits} visits
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
