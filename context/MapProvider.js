import { createContext, useContext } from 'react';
import { useState } from 'react';
import { config } from '../lib/config';

const MapContext = createContext();

export function MapProvider({ children }) {
    const [mapPosition, setMapPosition] = useState(config.MAP_POSITION_GERMANY);
    const [markerPositions, setMarkerPositions] = useState([]);
    const [draggableMarkerPosition, setDraggableMarkerPosition] = useState(config.MAP_POSITION_GERMANY);
    const [zoom, setZoom] = useState(config.MAP_MIN_ZOOM);
    const [bounds, setBounds] = useState(null);

    return (
        <MapContext.Provider value={{
            mapPosition, setMapPosition,
            markerPositions, setMarkerPositions,
            draggableMarkerPosition, setDraggableMarkerPosition,
            zoom, setZoom,
            bounds, setBounds,
        }}>
            {children}
        </MapContext.Provider>
    );
}

export function useMapContext() {
    return useContext(MapContext);
}