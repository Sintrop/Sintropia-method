import { createContext, ReactNode, useEffect, useState } from 'react';
import { StartInspectionProps } from '../types/inspectionContext';
import { useSQLite } from '../hooks/useSQLite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AreaDBProps } from '../types/database';
import { downloadAreaOfflineMap } from '../services/map/downloadAreaOfflineMap';

export interface InspectionContextProps {
  inspectionMode: boolean;
  startInspection: (data: StartInspectionProps) => void;
  exitInspectionMode: () => void;
  enterInspectionMode: () => void;
  areaOpened: AreaDBProps | undefined;
  finishInspection: (areaId: number) => void;
  deleteAreaInspection: (areaId: number) => void;
  fetchOpenedAreas: () => void;
}

interface InspectionProviderProps {
  children: ReactNode;
}

export const InspectionContext = createContext({} as InspectionContextProps);

export function InspectionContextProvider({
  children,
}: InspectionProviderProps) {
  const {
    addArea,
    areasOpened,
    fetchOpenedAreas,
    updateAreaStatus,
    deleteArea,
  } = useSQLite();
  const [inspectionMode, setInspectionMode] = useState(false);
  const [areaOpened, setAreaOpened] = useState<AreaDBProps>();

  useEffect(() => {
    handleCheckInspectionMode();
  }, []);

  useEffect(() => {
    if (areasOpened.length > 0) {
      setAreaOpened(areasOpened[0]);
    }
  }, [areasOpened]);

  async function handleCheckInspectionMode() {
    const response = await AsyncStorage.getItem('inspection-mode');

    if (response) {
      if (response === 'true') {
        setInspectionMode(true);
      } else {
        setInspectionMode(false);
      }
    }
  }

  async function startInspection(props: StartInspectionProps) {
    const { regenerator, coordinates, areaSize, collectionMethod } = props;

    // Collections belong to the regenerator's area, not to an on-chain
    // inspection, so they can be done before or independently of a request.
    await addArea({
      coordinates: JSON.stringify(coordinates),
      name: regenerator.name,
      description: '',
      proofPhoto: '',
      size: areaSize,
      inspectionId: '',
      regeneratorAddress: regenerator.address,
      status: 0,
      collectionMethod,
      inspectorReport: '',
    });

    downloadAreaOfflineMap(`area-${regenerator.address}`, coordinates);

    fetchOpenedAreas();
    setInspectionMode(true);
    await AsyncStorage.setItem('inspection-mode', 'true');
  }

  async function finishInspection(areaId: number) {
    await updateAreaStatus(1, areaId);
    exitInspectionMode();
    setAreaOpened(undefined);
  }

  function exitInspectionMode() {
    AsyncStorage.removeItem('inspection-mode');
    setInspectionMode(false);
  }

  function enterInspectionMode() {
    AsyncStorage.setItem('inspection-mode', 'true');
    setInspectionMode(true);
  }

  async function deleteAreaInspection(areaId: number) {
    await deleteArea(areaId);
    exitInspectionMode();
    setAreaOpened(undefined);
  }

  return (
    <InspectionContext.Provider
      value={{
        inspectionMode,
        startInspection,
        exitInspectionMode,
        enterInspectionMode,
        finishInspection,
        areaOpened,
        deleteAreaInspection,
        fetchOpenedAreas,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}
