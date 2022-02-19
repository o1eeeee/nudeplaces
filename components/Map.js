/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvent, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import 'react-leaflet-markercluster/dist/styles.min.css';
import Link from 'next/link';
import { config } from '../lib/config';
import DraggableMarker from '../components/DraggableMarker';
import AddLocationButton from '../components/AddLocationButton';
import { useMapContext } from '../context/MapProvider';
import styles from '../styles/components/Map.module.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useHistoryContext } from '../context/HistoryProvider';
import { useLanguageContext } from '../context/LanguageProvider';

const MapMarker = ({ country, markerPosition }) => {
    const { dictionary } = useLanguageContext();
    return (
        <Marker position={[markerPosition.latitude, markerPosition.longitude]}>
            {markerPosition.title && (
                <Popup>
                    <h3>{markerPosition.title}</h3>
                    {markerPosition.text && <p className={styles.popupText}>{markerPosition.text}</p>}
                    {markerPosition.seoName && (
                        <Link href={{
                            pathname: '/[country]/[location]',
                            query: {
                                country: country,
                                location: markerPosition.seoName,
                            }
                        }}>
                            <a>{dictionary("readMore")}...</a>
                        </Link>
                    )}
                </Popup>
            )
            }
        </Marker>
    );
};

export default function Map({ showAddLocationButton, country }) {
    const { mapPosition, markerPositions, zoom, setBounds } = useMapContext();
    const [map, setMap] = useState(null);
    const { previousPath, setPreviousMapPosition, setPreviousZoom } = useHistoryContext();

    function MapBounds() {
        const map = useMapEvent('moveend', () => {
            if (previousPath !== "/[country]/[location]") {
                setPreviousMapPosition({
                    latitude: map.getCenter().lat,
                    longitude: map.getCenter().lng
                })
                setPreviousZoom(map.getZoom())
            }
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
                <MarkerClusterGroup maxClusterRadius={40} showCoverageOnHover={false}>
                    {markerPositions.map((markerPosition, index) => {
                        if (markerPosition.isDraggable === true) {
                            return (
                                <DraggableMarker key={index} />
                            );
                        }
                        return (
                            <MapMarker key={markerPosition.id} country={country} markerPosition={markerPosition} />
                        )
                    }
                    )}
                </MarkerClusterGroup>
                {showAddLocationButton && <AddLocationButton />}
            </MapContainer>
        </div>
    )
}

