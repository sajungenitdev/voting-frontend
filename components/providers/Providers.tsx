'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Component to restore session on app load
function SessionRestorer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <SessionRestorer>
          {children}
        </SessionRestorer>
      </PersistGate>
    </Provider>
  );
}