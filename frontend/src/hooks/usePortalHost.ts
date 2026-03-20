'use client';

import { useEffect, useState } from 'react';

export function usePortalHost() {
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalHost(document.body);

    return () => {
      setPortalHost(null);
    };
  }, []);

  return portalHost;
}

export default usePortalHost;
