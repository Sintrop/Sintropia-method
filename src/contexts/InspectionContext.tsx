import { createContext, ReactNode, useEffect, useState } from 'react';
import { StartInspectionProps } from '../types/inspectionContext';
import { useSQLite } from '../hooks/useSQLite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InspectionContextProps {
  inspectionMode: boolean;
  startInspection: (data: StartInspectionProps) => void;
}

interface InspectionProviderProps {
  children: ReactNode;
}

export const InspectionContext = createContext({} as InspectionContextProps);

export function InspectionContextProvider({
  children,
}: InspectionProviderProps) {
  const { addArea, addInspection } = useSQLite();
  const [inspectionMode, setInspectionMode] = useState(false);

  useEffect(() => {
    handleCheckInspectionMode();
  }, [])

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

  return (
    <InspectionContext.Provider
      value={{
        inspectionMode,
        startInspection
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}
