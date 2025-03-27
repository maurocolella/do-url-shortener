import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchUrlById } from '../store/slices/urlSlice';
import { toast } from 'react-toastify';

// Mock data for stats since we don't have fetchUrlStats
const mockStats = [
  { date: 'Mon', visits: 5 },
  { date: 'Tue', visits: 8 },
  { date: 'Wed', visits: 12 },
  { date: 'Thu', visits: 7 },
  { date: 'Fri', visits: 10 },
  { date: 'Sat', visits: 4 },
  { date: 'Sun', visits: 6 }
];

const UrlDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUrl, loading, error } = useSelector((state: RootState) => state.url);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    if (id) {
      dispatch(fetchUrlById(id));
      // Update mock stats based on timeRange
      // In a real app, you would dispatch fetchUrlStats here
      if (timeRange === 'day') {
        setStats(mockStats.slice(0, 3));
      } else if (timeRange === 'month') {
        setStats([...mockStats, { date: 'Next Mon', visits: 9 }, { date: 'Next Tue', visits: 11 }]);
      } else if (timeRange === 'year') {
        setStats([
          { date: 'Jan', visits: 45 },
          { date: 'Feb', visits: 58 },
          { date: 'Mar', visits: 62 },
          { date: 'Apr', visits: 37 },
          { date: 'May', visits: 50 },
          { date: 'Jun', visits: 44 }
        ]);
      } else {
        setStats(mockStats);
      }
    }
  }, [dispatch, id, timeRange]);

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

  const shortUrl = `${window.location.origin}/${currentUrl.shortCode}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          to="/dashboard" 
          className="text-cyan-600 hover:text-cyan-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
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
            <div className="flex items-center">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-800 mr-2"
              >
                {shortUrl}
              </a>
              <button
                onClick={() => copyToClipboard(shortUrl)}
                className="text-gray-400 hover:text-gray-600"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Visits</h3>
              <p className="text-2xl font-bold text-gray-800">{currentUrl.visits}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created On</h3>
              <p className="text-gray-800">{new Date(currentUrl.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Visited</h3>
              <p className="text-gray-800">
                {currentUrl.lastVisitedAt 
                  ? new Date(currentUrl.lastVisitedAt).toLocaleDateString() 
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Visit Statistics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'day' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'year' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Year
            </button>
          </div>
        </div>
        <div className="p-6">
          {stats && stats.length > 0 ? (
            <div className="h-64">
              {/* Chart would go here - using placeholder */}
              <div className="flex h-full items-end justify-between">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-cyan-500 w-8 rounded-t-sm" 
                      style={{ 
                        height: `${Math.max(10, (stat.visits / Math.max(...stats.map(s => s.visits))) * 200)}px` 
                      }}
                    ></div>
                    <span className="text-xs mt-1 text-gray-600">{stat.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No visit data available for the selected time range.
            </div>
          )}
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
