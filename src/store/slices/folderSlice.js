// src/store/slices/folderSlice.js

import { createSlice } from '@reduxjs/toolkit';

/**
 * Folder Slice
 * Manages folder structure and organization
 */

const folderSlice = createSlice({
  name: 'folders',
  initialState: {
    folders: [], // { path, name, videoCount, totalSize, thumbnail }
    currentFolder: null,
    viewMode: 'list', // 'grid' | 'list'
  },
  reducers: {
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
    
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFolders, setCurrentFolder, setViewMode } = folderSlice.actions;
export default folderSlice.reducer;