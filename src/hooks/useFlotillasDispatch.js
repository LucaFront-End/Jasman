import { useCallback, useEffect, useRef, useState } from 'react';

const DISPATCH_EVENT = 'jasman-flotillas-dispatch';
const STORAGE_KEY = 'jasman_flotillas_dispatch_v1';

const FLEET_VEHICLES = [
  { id: 'van-jasman', label: 'Van de Reparto Corporativa', bay: 'Bahía 01 · Llantas & Balanceo', color: '#E2E8F0' },
  { id: 'sedan-exec', label: 'Sedán Ejecutivo', bay: 'Bahía 02 · Alineación 3D', color: '#C41E24' },
  { id: 'suv-fleet', label: 'SUV Supervisión', bay: 'Bahía 03 · Servicio Mayor', color: '#334155' },
  { id: 'pickup-util', label: 'Pick-Up Utilitaria', bay: 'Bahía 01 · Paquete Flotilla', color: '#1E293B' },
];

function readPersistedState() {
  if (typeof window === 'undefined') {
    return { dispatchedCount: 148, lastDispatch: null };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        dispatchedCount: Number(parsed?.dispatchedCount) || 148,
        lastDispatch: parsed?.lastDispatch || null,
      };
    }
  } catch {
    // ignore storage errors
  }
  return { dispatchedCount: 148, lastDispatch: null };
}

function writePersistedState(nextState) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // ignore storage errors
  }
}

/**
 * Shared Flotillas workshop & cart dispatch hook.
 * Connects the isometric workshop animation, dispatch checkmark confirmation,
 * Flotillas quote form submission, and Tienda cart checkout dispatch.
 */
export function useFlotillasDispatch({ autoLoop = false } = {}) {
  const [persisted, setPersisted] = useState(() => readPersistedState());
  const [cycleIndex, setCycleIndex] = useState(0);
  const [bayPhase, setBayPhase] = useState('servicing'); // 'entering' | 'servicing' | 'exiting'
  const [showCheck, setShowCheck] = useState(false);

  const cycleRef = useRef(cycleIndex);
  const persistedRef = useRef(persisted);

  useEffect(() => {
    cycleRef.current = cycleIndex;
    persistedRef.current = persisted;
  }, [cycleIndex, persisted]);

  // Sync state across components (FlotillasPage, CartDrawer, ThankYouPage)
  useEffect(() => {
    const handleSync = (e) => {
      const detail = e.detail;
      if (!detail) return;
      setPersisted(detail.state);
      setBayPhase('exiting');
      setShowCheck(true);
    };
    window.addEventListener(DISPATCH_EVENT, handleSync);
    return () => window.removeEventListener(DISPATCH_EVENT, handleSync);
  }, []);

  // Auto-hide transient check badge while keeping lastDispatch record
  useEffect(() => {
    if (!showCheck) return undefined;
    const t = setTimeout(() => {
      setShowCheck(false);
    }, 3600);
    return () => clearTimeout(t);
  }, [showCheck, persisted.dispatchedCount]);

  // Realistic workshop cycle when autoLoop is enabled (e.g., Flotillas showcase)
  useEffect(() => {
    if (!autoLoop) return undefined;

    let step = 0;
    const phases = ['entering', 'servicing', 'exiting'];
    const timer = setInterval(() => {
      step = (step + 1) % phases.length;
      const nextPhase = phases[step];
      setBayPhase(nextPhase);
      if (nextPhase === 'exiting') {
        setShowCheck(true);
        const vehicle = FLEET_VEHICLES[cycleRef.current % FLEET_VEHICLES.length];
        setPersisted((prev) => {
          const next = {
            dispatchedCount: prev.dispatchedCount + 1,
            lastDispatch: {
              id: `FL-${Math.floor(100000 + Math.random() * 900000)}`,
              source: 'loop',
              label: vehicle.label,
              bay: vehicle.bay,
              timestamp: Date.now(),
            },
          };
          writePersistedState(next);
          return next;
        });
        setCycleIndex((idx) => (idx + 1) % FLEET_VEHICLES.length);
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [autoLoop]);

  const dispatchVehicle = useCallback(
    ({ source = 'manual', label, bay, folio, unitsCount } = {}) => {
      const vehicle = FLEET_VEHICLES[cycleRef.current % FLEET_VEHICLES.length];
      const nextState = {
        dispatchedCount: (persistedRef.current?.dispatchedCount || 148) + 1,
        lastDispatch: {
          id: folio || `FL-${Math.floor(100000 + Math.random() * 900000)}`,
          source,
          label:
            label ||
            (source === 'cart'
              ? `Carrito Despachado${unitsCount ? ` (${unitsCount} uds)` : ''}`
              : vehicle.label),
          bay: bay || vehicle.bay,
          timestamp: Date.now(),
        },
      };

      writePersistedState(nextState);
      persistedRef.current = nextState;
      setPersisted(nextState);
      setBayPhase('exiting');
      setShowCheck(true);
      setCycleIndex((idx) => (idx + 1) % FLEET_VEHICLES.length);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DISPATCH_EVENT, { detail: { state: nextState } }));
      }

      return nextState.lastDispatch;
    },
    []
  );

  const notifyCartDispatched = useCallback(
    ({ folio, unitsCount, label } = {}) =>
      dispatchVehicle({
        source: 'cart',
        folio,
        unitsCount,
        label: label || `Pedido Tienda${unitsCount ? ` · ${unitsCount} llantas` : ''}`,
        bay: 'Salida Express · Despacho En Línea',
      }),
    [dispatchVehicle]
  );

  const activeVehicle = FLEET_VEHICLES[cycleIndex % FLEET_VEHICLES.length];

  return {
    bayPhase,
    showCheck,
    dispatchedCount: persisted.dispatchedCount,
    lastDispatch: persisted.lastDispatch,
    activeVehicle,
    vehicles: FLEET_VEHICLES,
    dispatchVehicle,
    notifyCartDispatched,
    triggerCheck: () => setShowCheck(true),
  };
}

export default useFlotillasDispatch;
