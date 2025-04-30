import { createContext, ReactNode, useEffect, useState } from 'react';
import { StartInspectionProps } from '../types/inspectionContext';
import { useSQLite } from '../hooks/useSQLite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AreaDBProps } from '../types/database';

export interface InspectionContextProps {
  inspectionMode: boolean;
  startInspection: (data: StartInspectionProps) => void;
  exitInspectionMode: () => void;
  enterInspectionMode: () => void;
  areaOpened: AreaDBProps | undefined;
}

interface InspectionProviderProps {
  children: ReactNode;
}

export const InspectionContext = createContext({} as InspectionContextProps);

export function InspectionContextProvider({
  children,
}: InspectionProviderProps) {
  const { addArea, addInspection, areasOpened } = useSQLite();
  const [inspectionMode, setInspectionMode] = useState(false);
  const [areaOpened, setAreaOpened] = useState<AreaDBProps>()

  useEffect(() => {
    handleCheckInspectionMode();
  }, []);

  useEffect(() => {
    if (areasOpened.length > 0) {
      setAreaOpened(areasOpened[0]);
    }
  }, [areasOpened])

  async function handleCheckInspectionMode() {
    const response = await AsyncStorage.getItem('inspection-mode')

    if (response) {
      if (response === 'true') {
        setInspectionMode(true);
      } else {
        setInspectionMode(false);
      }
    }
  }

  async function startInspection(props: StartInspectionProps) {
    const { inspection, coordinates, areaSize } = props;

    await addArea({
      coordinates: JSON.stringify(coordinates),
      name: inspection ? `#${inspection?.inspectionId}` : '',
      description: '',
      proofPhoto: '',
      size: areaSize,
      inspectionId: inspection ? inspection?.inspectionId : '0',
      regeneratorAddress: inspection
        ? inspection?.regeneratorAddress
        : '0x0000000000000000000000000000000000000',
      status: 0
    });

    if (inspection) {
      await addInspection(inspection);
    }

    setInspectionMode(true);
    await AsyncStorage.setItem('inspection-mode', 'true');
  }

  function exitInspectionMode() {
    AsyncStorage.removeItem('inspection-mode');
    setInspectionMode(false)
  }

  function enterInspectionMode() {
    AsyncStorage.setItem('inspection-mode', 'true');
    setInspectionMode(true)
  }

  return (
    <InspectionContext.Provider
      value={{
        inspectionMode,
        startInspection,
        exitInspectionMode,
        enterInspectionMode,
        areaOpened
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}
