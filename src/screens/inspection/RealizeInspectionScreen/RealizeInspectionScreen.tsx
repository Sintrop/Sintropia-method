import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../../components/Screen/Screen';
import { HeaderInspectionMode } from '../components/HeaderInspectionMode';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InspectionStackParamsList } from '../../../routes/InspectionRoutes';
import { useLocation } from '../../../hooks/useLocation';
import {
  Camera,
  MapView,
  PointAnnotation,
  LocationPuck,
  StyleURL,
  UserLocation,
  UserTrackingMode,
} from '@rnmapbox/maps';

type ScreenProps = NativeStackScreenProps<
  InspectionStackParamsList,
  'RealizeInspectionScreen'
>;
export function RealizeInspectionScreen({ route }: ScreenProps) {
  const { t } = useTranslation();
  const { location } = useLocation();

  return (
    <Screen screenTitle={t('realizeInspection')} showBackButton>
      <HeaderInspectionMode />

      <MapView style={styles.mapContainer} styleURL={StyleURL.SatelliteStreet}>
        <Camera
          // centerCoordinate={[
          //   location ? location?.coords.longitude : -122.084,
          //   location ? location?.coords.latitude : 37.4219983,
          // ]}
          // zoomLevel={15}
          followUserLocation={true}
          followUserMode={UserTrackingMode.Follow}
          followZoomLevel={15}
        />

        <UserLocation showsUserHeadingIndicator minDisplacement={1} />
        {/* {coords.map((coord, index) => (
          <PointAnnotation
            key={index.toString()}
            coordinate={[
              parseFloat(coord?.longitude),
              parseFloat(coord.latitude),
            ]}
            id="marker"
          >
            <View />
          </PointAnnotation>
        ))}

        <Polyline lineColor="red" lineWidth={4} coordinates={pathPolyline} /> */}
      </MapView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    width: '100%',
  },
});
