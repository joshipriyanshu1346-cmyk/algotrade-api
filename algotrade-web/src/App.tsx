import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./app/store";
import { useAppDispatch } from "./app/hooks";
import { bootstrapAuth } from "./features/auth/authSlice";
import { AppRouter } from "./routes/AppRouter";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthBootstrap>
            <AppRouter />
          </AuthBootstrap>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
}
