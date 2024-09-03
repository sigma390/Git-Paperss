// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Using localStorage for persistence

import downloadReducer from './downloadSlice';
import authReducer from './authSlice';

// Combine the individual reducers into a root reducer
const rootReducer = combineReducers({
  downloads: downloadReducer,
  auth: authReducer,
});

// Create a persist configuration
const persistConfig = {
  key: 'root',
  storage,
};

// Wrap the root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
});

// Create a persistor for managing persistence
const persistor = persistStore(store);

export { store, persistor };
