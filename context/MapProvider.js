import { createContext, useContext } from 'react';
import { useState } from 'react';

const MapContext = createContext();

export function MapProvider({ children }) {
    const [mapPosition, setMapPosition] = useState([51.165691, 10.451526]);
    const [markerPositions, setMarkerPositions] = useState([]);
    const [zoom, setZoom] = useState(3);

    return (
        <MapContext.Provider value ={{mapPosition, setMapPosition, markerPositions, setMarkerPositions, zoom, setZoom}}>
            {children}
        </MapContext.Provider>
    );
}

export function useMapContext() {
    return useContext(MapContext);
}