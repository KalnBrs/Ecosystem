import { createSlice } from "@reduxjs/toolkit";

export type focusMode = "stopwatch" | "timer" | null

export interface focusState {
  activeTaskId: string | null,
  mode: focusMode,
  timerDurationMinutes: number | null,
  startedAt: string | null,
  elapsedSeconds: number,
  isRunning: boolean
}

const initialState = {
  activeTaskId: null,
  mode: null,
  timerDurationMinutes: null,
  startedAt: null,
  elapsedSeconds: 0,
  isRunning: false
}

export const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {

  }
})

export const {  } = focusSlice.actions;
export default focusSlice.reducer;