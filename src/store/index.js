// src/store/index.js

/**
 * Redux Store Configuration
 * Explanation: Central state management for the entire app
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import slices
import videoReducer from './slices/videoSlice';
import playerReducer from './slices/playerSlice';
import settingsReducer from './slices/settingsSlice';
import folderReducer from './slices/folderSlice';
import driveReducer from './slices/driveSlice';

// Combine reducers
const rootReducer = combineReducers({
  videos: videoReducer,
  player: playerReducer,
  settings: settingsReducer,
  folders: folderReducer,
  drive: driveReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'player'], // Only persist these slices
  blacklist: ['videos'], // Don't persist videos (too large)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

export const persistor = persistStore(store);

// TypeScript types (optional)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
