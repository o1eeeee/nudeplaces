/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvent, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';
import { config } from '../lib/config';
import DraggableMarker from '../components/DraggableMarker';
import AddLocationButton from '../components/AddLocationButton';
import { useMapContext } from '../context/MapProvider';
import styles from '../styles/components/Map.module.css';
import { useHistoryContext } from '../context/HistoryProvider';
import { useLanguageContext } from '../context/LanguageProvider';
import GetGeolocationButton from './GetGeolocationButton';
import { useGeolocationContext } from '../context/GeolocationProvider';
import MapContent from './MapContent';



export default function Map({ country, showAddLocationButton }) {
    const { map, setMap } = useMapContext();
    const { mapPosition, zoom } = map;
    const { currentPosition, setCurrentPosition } = useGeolocationContext();

    useEffect(() => {
        if (currentPosition) {
            setMap({
                ...map,
                mapPosition: currentPosition,
                zoom: config.MAP_DEFAULT_ZOOM_GEOLOCATION,
            })
        }
    }, [currentPosition]);

    return (
        <div className={styles.mapWrapper}>
            <MapContainer minZoom={config.MAP_MIN_ZOOM} zoomControl={false} center={[mapPosition.latitude, mapPosition.longitude]} zoom={zoom} scrollWheelZoom={true} maxBounds={[[-90, -180], [90, 180]]} style={{ width: "100%", height: "100%" }}>
                <MapContent country={country} showAddLocationButton={showAddLocationButton} />
            </MapContainer>
        </div>
    )
}

