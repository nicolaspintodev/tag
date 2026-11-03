import { useEffect, useRef } from 'react';

const TIMEOUT_MINUTOS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 15;
export const TIMEOUT_MS = TIMEOUT_MINUTOS * 60 * 1000;

const EVENTOS_ACTIVIDAD = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
const THROTTLE_MS = 1000;

const useSessionTimeout = ({ activo, onTimeout }) => {
  const ultimaActividad = useRef(0);
  const temporizador = useRef(null);

  useEffect(() => {
    if (!activo) return undefined;

    ultimaActividad.current = Date.now();

    const programar = (espera = TIMEOUT_MS) => {
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => onTimeout?.(), espera);
    };

    const registrarActividad = () => {
      const ahora = Date.now();
      if (ahora - ultimaActividad.current < THROTTLE_MS) return;
      ultimaActividad.current = ahora;
      programar();
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState !== 'visible') return;
      const restante = TIMEOUT_MS - (Date.now() - ultimaActividad.current);
      if (restante <= 0) {
        onTimeout?.();
        return;
      }
      programar(restante);
    };

    EVENTOS_ACTIVIDAD.forEach((evento) =>
      window.addEventListener(evento, registrarActividad, { passive: true }),
    );
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    programar();

    return () => {
      clearTimeout(temporizador.current);
      EVENTOS_ACTIVIDAD.forEach((evento) => window.removeEventListener(evento, registrarActividad));
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [activo, onTimeout]);
};

export default useSessionTimeout;
