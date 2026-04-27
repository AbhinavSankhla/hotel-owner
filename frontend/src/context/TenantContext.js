'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext(null);

export function TenantProvider({ children, initialHotel = null }) {
  const [hotel, setHotel] = useState(initialHotel);

  return (
    <TenantContext.Provider value={{ hotel, setHotel }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
