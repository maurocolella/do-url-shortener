import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { UrlNormalizer } from '../../utils/url-normalizer';

interface IUrl {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  visits: number;
  createdAt: string;
  updatedAt: string;
}

interface IUrlState {
  urls: IUrl[];
  currentUrl: IUrl | null;
  loading: boolean;
  error: string | null;
  stats: {
    totalUrls: number;
    totalVisits: number;
    topUrls: IUrl[];
  } | null;
}

interface ICreateUrlPayload {
  originalUrl: string;
  customSlug?: string;
}

interface IUpdateUrlPayload {
  id: string;
  slug: string;
}

// Async thunks
export const createUrl = createAsyncThunk(
  'url/createUrl',
  async (urlData: ICreateUrlPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<IUrl>('/urls', urlData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create URL');
    }
  }
);

export const fetchUrls = createAsyncThunk(
  'url/fetchUrls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<IUrl[]>('/urls');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch URLs');
    }
  }
);

export const fetchUrlById = createAsyncThunk(
  'url/fetchUrlById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<IUrl>(`/urls/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch URL');
    }
  }
);

export const updateUrl = createAsyncThunk(
  'url/updateUrl',
  async ({ id, slug }: IUpdateUrlPayload, { rejectWithValue }) => {
    try {
      const response = await axios.put<IUrl>(`/urls/${id}`, { slug });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update URL');
    }
  }
);

export const deleteUrl = createAsyncThunk(
  'url/deleteUrl',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/urls/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete URL');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'url/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/urls/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Slice
const urlSlice = createSlice({
  name: 'url',
  initialState: {
    urls: [],
    currentUrl: null,
    loading: false,
    error: null,
    stats: null,
  } as IUrlState,
  reducers: {
    clearCurrentUrl: (state) => {
      state.currentUrl = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    incrementUrlVisits: (state, action: PayloadAction<string>) => {
      const urlId = action.payload;
      
      // Find the URL that was clicked
      const clickedUrl = state.urls.find(url => url.id === urlId);
      if (!clickedUrl) return;
      
      // Get the normalized original URL to find all related short URLs
      const normalizedOriginalUrl = UrlNormalizer.normalize(clickedUrl.originalUrl);
      
      // Update all URLs with the same normalized original URL
      state.urls.forEach(url => {
        if (UrlNormalizer.normalize(url.originalUrl) === normalizedOriginalUrl) {
          url.visits += 1;
        }
      });
      
      // Update in currentUrl if it points to the same normalized original URL
      if (state.currentUrl && UrlNormalizer.normalize(state.currentUrl.originalUrl) === normalizedOriginalUrl) {
        state.currentUrl.visits += 1;
      }
      
      // Update in topUrls if present
      if (state.stats && state.stats.topUrls) {
        state.stats.topUrls.forEach(url => {
          if (UrlNormalizer.normalize(url.originalUrl) === normalizedOriginalUrl) {
            url.visits += 1;
          }
        });
        
        // Re-sort the topUrls array based on visit count
        state.stats.topUrls.sort((a, b) => b.visits - a.visits);
      }
      
      // Update total visits count
      if (state.stats) {
        state.stats.totalVisits += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Create URL
    builder.addCase(createUrl.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createUrl.fulfilled, (state, action) => {
      state.loading = false;
      const newUrl = action.payload;
      const normalizedNewOriginalUrl = UrlNormalizer.normalize(newUrl.originalUrl);
      
      // Check if there is an existing URL with the same normalized original URL
      const existingUrlIndex = state.urls.findIndex(url => 
        UrlNormalizer.normalize(url.originalUrl) === normalizedNewOriginalUrl
      );
      
      if (existingUrlIndex !== -1) {
        // Replace the existing URL with the new one
        state.urls[existingUrlIndex] = newUrl;
      } else {
        // Add the new URL to the beginning of the array
        state.urls.unshift(newUrl);
      }
      
      // Update currentUrl
      state.currentUrl = newUrl;
      
      // Update topUrls if stats exist
      if (state.stats && state.stats.topUrls) {
        // Check if the normalized original URL exists in topUrls
        const topUrlIndex = state.stats.topUrls.findIndex(url => 
          UrlNormalizer.normalize(url.originalUrl) === normalizedNewOriginalUrl
        );
        
        if (topUrlIndex !== -1) {
          // Replace the existing URL in topUrls
          state.stats.topUrls[topUrlIndex] = newUrl;
          // Re-sort the topUrls array based on visit count
          state.stats.topUrls.sort((a, b) => b.visits - a.visits);
        }
        // We don't add to topUrls here as that's determined by visit count
      }
    });
    builder.addCase(createUrl.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch URLs
    builder.addCase(fetchUrls.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUrls.fulfilled, (state, action) => {
      state.loading = false;
      state.urls = action.payload;
    });
    builder.addCase(fetchUrls.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch URL by ID
    builder.addCase(fetchUrlById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUrlById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentUrl = action.payload;
    });
    builder.addCase(fetchUrlById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update URL
    builder.addCase(updateUrl.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUrl.fulfilled, (state, action) => {
      state.loading = false;
      state.currentUrl = action.payload;
      state.urls = state.urls.map(url => 
        url.id === action.payload.id ? action.payload : url
      );
    });
    builder.addCase(updateUrl.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Delete URL
    builder.addCase(deleteUrl.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUrl.fulfilled, (state, action) => {
      state.loading = false;
      const deletedId = action.payload;
      
      // Find the URL that was deleted to get its original URL
      const deletedUrl = state.urls.find(url => url.id === deletedId);
      
      if (deletedUrl) {
        const normalizedOriginalUrl = UrlNormalizer.normalize(deletedUrl.originalUrl);
        
        // Check if there are other URLs pointing to the same normalized original URL
        const otherUrlsWithSameOriginal = state.urls.filter(
          url => url.id !== deletedId && UrlNormalizer.normalize(url.originalUrl) === normalizedOriginalUrl
        );
        
        // Only update top URLs if this was the last URL pointing to this normalized original URL
        if (otherUrlsWithSameOriginal.length === 0 && state.stats && state.stats.topUrls) {
          // Remove from topUrls if present
          state.stats.topUrls = state.stats.topUrls.filter(url => 
            UrlNormalizer.normalize(url.originalUrl) !== normalizedOriginalUrl
          );
          
          // Update total URLs count
          if (state.stats.totalUrls > 0) {
            state.stats.totalUrls -= 1;
          }
        }
      }
      
      // Remove from urls array
      state.urls = state.urls.filter(url => url.id !== deletedId);
      
      // Clear currentUrl if it's the deleted URL
      if (state.currentUrl && state.currentUrl.id === deletedId) {
        state.currentUrl = null;
      }
    });
    builder.addCase(deleteUrl.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch Stats
    builder.addCase(fetchStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentUrl, clearError, incrementUrlVisits } = urlSlice.actions;
export default urlSlice.reducer;
