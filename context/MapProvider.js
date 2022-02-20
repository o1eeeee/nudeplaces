import { createContext, useContext } from 'react';
import { useState } from 'react';
import { config } from '../lib/config';

const MapContext = createContext();

export function MapProvider({ children }) {
    const [map, setMap] = useState({
        mapPosition: config.MAP_POSITION_GERMANY,
        previousMapPosition: null,
        markerPositions: [],
        draggableMarkerPosition: config.MAP_POSITION_GERMANY,
        zoom: config.MAP_MIN_ZOOM,
        previousZoom: null,
        bounds: null,
    })

    return (
        <MapContext.Provider value={{ map, setMap }}>
            {children}
        </MapContext.Provider>
    );
}

export function useMapContext() {
    return useContext(MapContext);
}