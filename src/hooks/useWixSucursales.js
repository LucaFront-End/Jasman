import { useEffect, useMemo, useState } from 'react';
import { getCachedWixBranches, mergeSucursalesWithWix } from '../services/wixService';

/**
 * Enriches a static sucursales list with live Wix CMS "Sucursales" data
 * (including enlaceDeGoogleMaps and CMS WhatsApp links).
 */
export function useWixSucursales(staticList = []) {
  const [wixBranches, setWixBranches] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getCachedWixBranches()
      .then((branches) => {
        if (isMounted && Array.isArray(branches) && branches.length > 0) {
          setWixBranches(branches);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(
    () => mergeSucursalesWithWix(staticList, wixBranches),
    [staticList, wixBranches]
  );
}

