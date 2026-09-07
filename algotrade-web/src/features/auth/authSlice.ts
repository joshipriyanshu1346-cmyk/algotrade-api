import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchMeRequest,
  googleAuthRequest,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "./authApi";
import { getApiErrorMessage } from "../../services/apiClient";
import { tokenStore } from "../../services/tokenStore";
import type { LoginCredentials, RegisterCredentials, User } from "../../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  initialized: false,
  error: null,
};

function applyAuth(state: AuthState, user: User, accessToken: string) {
  state.user = user;
  state.accessToken = accessToken;
  state.status = "authenticated";
  state.error = null;
  tokenStore.set(accessToken);
}

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  try {
    const accessToken = await refreshRequest();
    tokenStore.set(accessToken);
    const user = await fetchMeRequest();
    return { user, accessToken };
  } catch {
    tokenStore.set(null);
    return rejectWithValue("Not authenticated");
  }
});

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await loginRequest(credentials);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Login failed"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      return await registerRequest(credentials);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed"));
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { rejectWithValue }) => {
    try {
      return await googleAuthRequest(idToken);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Google sign-in failed"));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutRequest();
  } catch {
    // Clear local state even if server logout fails
  }
  tokenStore.set(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        applyAuth(state, action.payload.user, action.payload.accessToken);
        state.initialized = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
        state.initialized = true;
        tokenStore.set(null);
      })

      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        applyAuth(state, action.payload.user, action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })

      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        applyAuth(state, action.payload.user, action.payload.accessToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })

      .addCase(googleLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        applyAuth(state, action.payload.user, action.payload.accessToken);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
