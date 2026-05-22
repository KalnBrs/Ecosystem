import { createSlice } from "@reduxjs/toolkit";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string,
  email: string | null,
  name: string | null
}

export interface AuthState {
  status: AuthStatus,
  user: AuthUser | null,
  error: string | null,
  initialized: boolean
}

const initialState : AuthState = {
  status: "idle",
  user: null,
  error: null,
  initialized: false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

  }
})