import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../store';
import { fetchUrlById, updateUrl, deleteUrl } from '../store/slices/urlSlice';

const UrlDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUrl, loading, error } = useSelector((state: RootState) => state.url);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      dispatch(fetchUrlById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentUrl) {
      setSlug(currentUrl.slug);
    }
  }, [currentUrl]);

  const handleUpdateSlug = async () => {
    if (!id || !slug) return;

    try {
      await dispatch(updateUrl({ id, slug })).unwrap();
      setIsEditing(false);
      toast.success('URL updated successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to update URL');
    }
  };

  const handleDeleteUrl = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await dispatch(deleteUrl(id)).unwrap();
        toast.success('URL deleted successfully!');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error || 'Failed to delete URL');
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">URL not found</h2>
        <p className="text-gray-500 mb-6">The URL you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-cyan-600 text-white py-2 px-6 rounded-md hover:bg-cyan-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">URL Details</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Original URL</h2>
          <div className="flex items-center">
            <a
              href={currentUrl.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:underline break-all mr-2"
            >
              {currentUrl.originalUrl}
            </a>
            <button
              onClick={() => copyToClipboard(currentUrl.originalUrl)}
              className="text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Short URL</h2>
          <div className="flex items-center">
            <a
              href={currentUrl.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:underline mr-2"
            >
              {currentUrl.shortUrl}
            </a>
            <button
              onClick={() => copyToClipboard(currentUrl.shortUrl)}
              className="text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Slug</h2>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleUpdateSlug}
                disabled={loading}
                className="bg-cyan-600 text-white px-4 py-2 rounded-r-md hover:bg-cyan-700 focus:outline-none disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSlug(currentUrl.slug);
                }}
                className="ml-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">{currentUrl.slug}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600"
                title="Edit slug"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Visits</h3>
            <p className="text-2xl font-bold text-cyan-600">{currentUrl.visits}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p className="text-lg font-medium text-gray-700">
              {new Date(currentUrl.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-lg font-medium text-gray-700">
              {new Date(currentUrl.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={handleDeleteUrl}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlDetailsPage;
