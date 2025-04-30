import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Host } from 'react-native-portalize';
import { PreInspectionRoutes } from './PreInspectionRoutes';
import { useInspectionContext } from '../hooks/useInspectionContext';
import { InspectionsRoutes } from './InspectionsRoutes';

export function Routes(): React.JSX.Element {
  const { inspectionMode } = useInspectionContext();
  
  return (
    <NavigationContainer>
      <Host>
        {inspectionMode ? <InspectionsRoutes /> : <PreInspectionRoutes />}
      </Host>
    </NavigationContainer>
  );
}
