import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';

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
  },
  extraReducers: (builder) => {
    // Create URL
    builder.addCase(createUrl.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createUrl.fulfilled, (state, action) => {
      state.loading = false;
      state.currentUrl = action.payload;
      state.urls.unshift(action.payload);
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
      state.urls = state.urls.filter(url => url.id !== action.payload);
      if (state.currentUrl && state.currentUrl.id === action.payload) {
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

export const { clearCurrentUrl, clearError } = urlSlice.actions;
export default urlSlice.reducer;
