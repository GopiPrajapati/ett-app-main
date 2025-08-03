import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState} from 'react';

const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [hasCheckedInitialState, setHasCheckedInitialState] = useState(false); // Track if initial state is checked

  useEffect(() => {
    // Fetch initial network state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setHasCheckedInitialState(true); // Set the flag after initial state check
    });

    // Listen for network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      // Only show toast if the network state has changed after initial check
      if (hasCheckedInitialState && state.isConnected !== isConnected) {
        setIsConnected(state.isConnected);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasCheckedInitialState, isConnected]);

  return {isConnected};
};

export default useNetwork;
