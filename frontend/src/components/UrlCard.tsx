import { motion } from "motion/react";
import { Link } from 'react-router-dom';
import { ClipboardIcon } from './icons';

// Define the Url type
interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  visits: number;
  createdAt: string;
  lastVisitedAt?: string;
}

interface UrlCardProps {
  url: Url;
  isPreview?: boolean;
  handleDeleteUrl?: (id: string) => void;
  copyToClipboard?: (url: string) => void;
}

const UrlCard = ({ url, isPreview = false, handleDeleteUrl, copyToClipboard }: UrlCardProps) => {
  const shortUrl = `${window.location.origin}/${url.shortCode}`;

  return (
    <motion.div 
      className="bg-white shadow overflow-hidden sm:rounded-lg mb-4"
      layoutId={`url-card-${url.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <motion.h3 
          className="text-lg leading-6 font-medium text-gray-900"
          layoutId={`url-title-${url.id}`}
        >
          {url.originalUrl.length > 50 
            ? `${url.originalUrl.substring(0, 50)}...` 
            : url.originalUrl}
        </motion.h3>
        {!isPreview && (
          <div className="flex space-x-2">
            <Link 
              to={`/urls/${url.id}`}
              className="text-cyan-600 hover:text-cyan-900"
            >
              Details
            </Link>
            {handleDeleteUrl && (
              <button
                onClick={() => handleDeleteUrl(url.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <motion.dt 
              className="text-sm font-medium text-gray-500"
              layoutId={`url-shortcode-label-${url.id}`}
            >
              Short URL
            </motion.dt>
            <motion.dd 
              className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center"
              layoutId={`url-shortcode-${url.id}`}
            >
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-900 mr-2"
              >
                {shortUrl}
              </a>
              {copyToClipboard && (
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              )}
            </motion.dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <motion.dt 
              className="text-sm font-medium text-gray-500"
              layoutId={`url-visits-label-${url.id}`}
            >
              Visits
            </motion.dt>
            <motion.dd 
              className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
              layoutId={`url-visits-${url.id}`}
            >
              {url.visits}
            </motion.dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <motion.dt 
              className="text-sm font-medium text-gray-500"
              layoutId={`url-created-label-${url.id}`}
            >
              Created At
            </motion.dt>
            <motion.dd 
              className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
              layoutId={`url-created-${url.id}`}
            >
              {new Date(url.createdAt).toLocaleString()}
            </motion.dd>
          </div>
          {isPreview && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                QR Code
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}`} 
                  alt="QR Code"
                  className="h-32 w-32"
                />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </motion.div>
  );
};

export default UrlCard;
