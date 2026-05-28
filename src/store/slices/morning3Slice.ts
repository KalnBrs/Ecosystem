import { createSlice } from "@reduxjs/toolkit";

export interface MorningState {
  picksLockedForDate: string | null,
  pickedTaskIds: string[],
  selectionComplete: boolean
}

const initialState : MorningState = {
  picksLockedForDate: null,
  pickedTaskIds: [],
  selectionComplete: false
}

export const morning3Slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

  }
})

export const {  } = morning3Slice.actions;
export default morning3Slice.reducer;