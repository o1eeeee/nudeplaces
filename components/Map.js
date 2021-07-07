/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvent, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';
import { config } from '../lib/config';
import DraggableMarker from '../components/DraggableMarker';
import AddLocationButton from '../components/AddLocationButton';
import { useMapContext } from '../context/MapProvider';
import styles from '../styles/components/Map.module.css';

export default function Map() {
    const { mapPosition, markerPositions, zoom, setBounds } = useMapContext();
    const [map, setMap] = useState(null);

    function MapBounds() {
        const map = useMapEvent('moveend', () => {
            setBounds(map.getBounds())
        })
        return null
    }

    useEffect(() => {
        map && map.flyTo([mapPosition.latitude, mapPosition.longitude], zoom, {
            animate: true,
            duration: 1,
        })
    }, [map, mapPosition, zoom])

    return (
        <div className={styles.mapWrapper}>
            <MapContainer whenCreated={(map) => setMap(map)} minZoom={config.MAP_MIN_ZOOM} zoomControl={false} center={[mapPosition.latitude, mapPosition.longitude]} zoom={zoom} scrollWheelZoom={true} maxBounds={[[-90, -180], [90, 180]]} style={{ width: "100%", height: "100%" }}>
                <MapBounds />
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                {markerPositions.map((markerPosition, index) => {
                    if (markerPosition.isDraggable === true) {
                        return (
                            <DraggableMarker key={index} />
                        );
                    }
                    const markerPositionText = markerPosition.text;
                    const popupText = markerPositionText ? markerPositionText.length > 200 ? `${markerPositionText.substring(0, 200)}...` : markerPositionText : null;
                    return (
                        <Marker key={index} position={[markerPosition.latitude, markerPosition.longitude]}>
                            {markerPosition.title && (
                                <Popup>
                                    <h3>{markerPosition.title}</h3>
                                    {popupText && <p>{popupText}</p>}
                                    {markerPosition.url && (
                                        <Link href={markerPosition.url}>
                                            <a>Read more...</a>
                                        </Link>
                                    )}
                                </Popup>
                            )
                            }
                        </Marker>
                    )
                }
                )}
                <AddLocationButton />
            </MapContainer>
        </div>
    )
}

