import { createSlice } from "@reduxjs/toolkit";

export interface MorningState {
  picksLockedForDate: string | null, // Last day completed morning 3, on open compare to current date
  pickedTaskIds: string[],
  selectionComplete: boolean
}

const initialState : MorningState = {
  picksLockedForDate: null,
  pickedTaskIds: [],
  selectionComplete: false
}

export const morning3Slice = createSlice({
  name: 'morning3',
  initialState,
  reducers: {

  }
})

export const {  } = morning3Slice.actions;
export default morning3Slice.reducer;