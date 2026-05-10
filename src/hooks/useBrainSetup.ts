import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Clean hook to verify connectivity to the Laptop AI Brain.
 */
export const useBrainSetup = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { serverIp } = useAppStore();

  useEffect(() => {
    const checkBrain = async () => {
      // If IP is not set, we are "ready" to show the Home screen and ask for it.
      if (!serverIp || serverIp === '192.168.1.1') {
        setIsReady(true);
        return;
      }

      try {
        const response = await fetch(`http://${serverIp}:8000/`);
        if (response.ok) {
          console.log('✅ AI Brain is online.');
          setIsReady(true);
        } else {
          setError('AI Brain is loading or unreachable.');
          setIsReady(true); // Still show Home so user can fix IP
        }
      } catch (err) {
        console.log('⚠️ AI Brain not found at this IP yet.');
        setIsReady(true); // Don't block the app start
      }
    };

    checkBrain();
  }, [serverIp]);

  return { isReady, error };
};
