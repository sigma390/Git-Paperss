import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DownloadState {
  count: number;
}

const initialState: DownloadState = {
  count: 0,
};

const downloadSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    reset: (state) => {
      state.count = 0;
    },
  },
});

export const { increment, reset } = downloadSlice.actions;
export default downloadSlice.reducer;
