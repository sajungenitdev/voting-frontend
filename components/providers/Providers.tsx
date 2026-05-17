"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { restoreSession } from "@/store/slices/authSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Component to restore session on app load and listen for auth changes
function SessionRestorer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial session restore
    dispatch(restoreSession());

    // Listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "user") {
        console.log("Storage changed, restoring session...");
        dispatch(restoreSession());
      }
    };

    // Listen for custom auth events
    const handleAuthUpdate = () => {
      console.log("Auth update event received, restoring session...");
      dispatch(restoreSession());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-storage-updated", handleAuthUpdate);

    // Also check for token on focus (user might have logged in from another tab)
    const handleFocus = () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      if (token && user) {
        dispatch(restoreSession());
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-storage-updated", handleAuthUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <SessionRestorer>{children}</SessionRestorer>
      </PersistGate>
    </Provider>
  );
}
