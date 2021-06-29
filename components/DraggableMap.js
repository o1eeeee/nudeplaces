/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import DraggableMarker from './DraggableMarker';
import { useMapContext } from '../context/MapProvider';
import { useEffect } from 'react';

export default function DraggableMap() {
    const { setDraggableMarkerPosition, mapPosition, zoom } = useMapContext();

    useEffect(() => {
        // place the draggable marker in the center of the map
        setDraggableMarkerPosition(mapPosition);
    }, [])

    return (
        <MapContainer zoomControl={false} center={mapPosition} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", flex: "1 1 0%" }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <DraggableMarker />
        </MapContainer>
    )
}

