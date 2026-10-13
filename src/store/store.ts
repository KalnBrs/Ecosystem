import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"
import focusReducer from "./slices/focusSlice"
import morning3Reducer from "./slices/morning3Slice"
import dailyResetReducer from "./slices/dailyResetSlice"


export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      focus: focusReducer,
      morning3: morning3Reducer,
      dailyReset: dailyResetReducer
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];