import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../store';
import { fetchUrls, deleteUrl, createUrl, fetchStats } from '../store/slices/urlSlice';

const DashboardPage = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const { urls, loading, stats } = useSelector((state: RootState) => state.url);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUrls());
    dispatch(fetchStats());
  }, [dispatch]);

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
    } catch (error: any) {
      toast.error(error || 'Failed to shorten URL');
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await dispatch(deleteUrl(id)).unwrap();
        toast.success('URL deleted successfully!');
      } catch (error: any) {
        toast.error(error || 'Failed to delete URL');
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.email}!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total URLs</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.totalUrls}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Visits</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.totalVisits}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Average Visits</h3>
            <p className="text-3xl font-bold text-cyan-600">
              {stats.totalUrls > 0 ? Math.round(stats.totalVisits / stats.totalUrls) : 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your URLs</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : urls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't created any URLs yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    {urls.map((url) => (
                      <tr key={url.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[200px]">
                          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600">
                            {url.originalUrl}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline mr-2">
                              {url.slug}
                            </a>
                            <button
                              onClick={() => copyToClipboard(url.shortUrl)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy to clipboard"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {url.visits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/urls/${url.id}`} className="text-cyan-600 hover:text-cyan-900 mr-3">
                            Details
                          </Link>
                          <button
                            onClick={() => handleDeleteUrl(url.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New URL</h2>
            <form onSubmit={handleCreateUrl} className="space-y-4">
              <div>
                <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL to shorten
                </label>
                <input
                  type="url"
                  id="originalUrl"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/long/url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="customSlugToggle"
                  checked={showCustomSlug}
                  onChange={() => setShowCustomSlug(!showCustomSlug)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label htmlFor="customSlugToggle" className="ml-2 block text-sm text-gray-700">
                  Use custom slug
                </label>
              </div>

              {showCustomSlug && (
                <div>
                  <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom slug
                  </label>
                  <input
                    type="text"
                    id="customSlug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-custom-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for a randomly generated slug.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Short URL'}
              </button>
            </form>
          </div>

          {stats && stats.topUrls && stats.topUrls.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-4">Top Performing URLs</h2>
              <ul className="space-y-3">
                {stats.topUrls.map((url) => (
                  <li key={url.id} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <div className="truncate max-w-[180px]">
                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">
                          {url.slug}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">
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
