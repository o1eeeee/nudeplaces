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
import GetGeolocationButton from './GetGeolocationButton';
import { useGeolocationContext } from '../context/GeolocationProvider';

const StaticMarker = ({ country, markerPosition }) => {
    return (
        <Marker position={[markerPosition.latitude, markerPosition.longitude]}>
            {markerPosition.title && (
                <MarkerPopup country={country} {...markerPosition} />
            )
            }
        </Marker>
    );
};

const MarkerPopup = ({ country, title, text, seoName }) => {
    const { dictionary } = useLanguageContext();
    return (
        <Popup>
            <h3>{title}</h3>
            {text && <p className={styles.popupText}>{text}</p>}
            {seoName && (
                <Link href={{
                    pathname: '/[country]/[location]',
                    query: {
                        country: country,
                        location: seoName,
                    }
                }}>
                    <a>{dictionary("readMore")}...</a>
                </Link>
            )}
        </Popup>
    );
}

export default function Map({ country, showAddLocationButton }) {
    const { map, setMap } = useMapContext();
    const { mapPosition, markerPositions, zoom } = map;
    const [mapContainer, setMapContainer] = useState(null);
    const { previousPath } = useHistoryContext();
    const { currentPosition, setCurrentPosition } = useGeolocationContext();

    function MapBounds() {
        const mapContainer = useMapEvent('moveend', () => {
            let previousMapPosition
            let previousZoom
            if (previousPath !== "/[country]/[location]") {
                previousMapPosition = {
                    latitude: mapContainer.getCenter().lat,
                    longitude: mapContainer.getCenter().lng
                }
                previousZoom = mapContainer.getZoom();
            }
            const bounds = mapContainer.getBounds();
            setMap({
                ...map,
                bounds: bounds,
                previousMapPosition: previousMapPosition ?? map.previousMapPosition,
                previousZoom: previousZoom ?? map.previousZoom,
            })
        })
        return null
    }

    useEffect(() => {
        mapContainer && mapContainer.flyTo([mapPosition.latitude, mapPosition.longitude], zoom, {
            animate: true,
            duration: 1,
        })
    }, [mapContainer, mapPosition, zoom])

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
            <MapContainer whenCreated={(mapContainer) => setMapContainer(mapContainer)} minZoom={config.MAP_MIN_ZOOM} zoomControl={false} center={[mapPosition.latitude, mapPosition.longitude]} zoom={zoom} scrollWheelZoom={true} maxBounds={[[-90, -180], [90, 180]]} style={{ width: "100%", height: "100%" }}>
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
                        if (mapContainer && isMarkerInBounds(markerPosition, mapContainer.getBounds())) {
                            return (
                                <StaticMarker key={markerPosition.id} country={country} markerPosition={markerPosition} />
                            )
                        }
                    }
                    )}
                </MarkerClusterGroup>
                <div className={styles.buttonContainer}>
                    <GetGeolocationButton />
                    {showAddLocationButton && <AddLocationButton />}
                </div>
            </MapContainer>
        </div>
    )
}


function isMarkerInBounds(markerPosition, bounds) {
    if (!bounds) {
        return true
    }
    const { _northEast, _southWest } = bounds;
    return markerPosition.latitude < _northEast.lat &&
        markerPosition.longitude < _northEast.lng &&
        markerPosition.latitude > _southWest.lat &&
        markerPosition.longitude > _southWest.lng
}

