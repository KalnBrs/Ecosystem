import { createSlice } from "@reduxjs/toolkit";

export interface DailyResetState {
  isActive: boolean
  pendingTaskIds: string[],
  currentIndex: number, 
  lastResetDate: string | null // YYYY-MM-DD for "already reset today" check
}

const initialState : DailyResetState = {
  isActive: false,
  pendingTaskIds: [],
  currentIndex: 0,
  lastResetDate: null
}

export const dailyResetSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

  }
})

export const {  } = dailyResetSlice.actions;
export default dailyResetSlice.reducer;