// app/StoreProvider.tsx
'use client';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use state with a lazy initializer function
  // React will only execute makeStore() once during initial render
  const [store] = useState<AppStore>(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
