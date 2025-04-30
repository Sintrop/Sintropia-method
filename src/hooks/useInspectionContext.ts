import {useContext} from 'react';
import {
  InspectionContext,
  InspectionContextProps,
} from '../contexts/InspectionContext';

export function useInspectionContext(): InspectionContextProps {
  const context = useContext(InspectionContext);
  return context;
}
