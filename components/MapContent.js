import { Marker, Popup, TileLayer, useMap, useMapEvent, ZoomControl } from 'react-leaflet'
import { useMapContext } from '../context/MapProvider';
import styles from '../styles/components/Map.module.css';
import { useLanguageContext } from '../context/LanguageProvider';
import GetGeolocationButton from './GetGeolocationButton';
import DraggableMarker from '../components/DraggableMarker';
import AddLocationButton from '../components/AddLocationButton';
import Link from 'next/link';
import { useHistoryContext } from '../context/HistoryProvider';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/styles';
import { useEffect } from 'react';


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

const MarkerPopup = ({ country, title, text, seo_name }) => {
    const { dictionary } = useLanguageContext();
    return (
        <Popup>
            <h3>{title}</h3>
            {text && <p className={styles.popupText}>{text}</p>}
            {seo_name && (
                <Link href={{
                    pathname: '/[country]/[location]',
                    query: {
                        country: country,
                        location: seo_name,
                    }
                }}>
                    <span>{dictionary("readMore")}...</span>
                </Link>
            )}
        </Popup>
    );
}

export default function MapContent({ country, showAddLocationButton }) {
    const mapHook = useMap();
    const { map, setMap } = useMapContext();
    const { mapPosition, zoom } = map;
    const { previousPath } = useHistoryContext();
    const { markerPositions } = map;

    useEffect(() => {
        mapHook.flyTo([mapPosition.latitude, mapPosition.longitude], zoom, {
            animate: true,
            duration: 1,
        })
    }, [mapPosition, zoom])

    function MapBounds() {
        const mapContainer = useMapEvent('moveend', () => {
            let previousMapPosition
            let previousZoom
            if (previousPath !== "/[country]/[location]") {
                previousMapPosition = {
                    latitude: mapHook.getCenter().lat,
                    longitude: mapHook.getCenter().lng
                }
                previousZoom = mapHook.getZoom();
            }
            const bounds = mapHook.getBounds();
            setMap({
                ...map,
                bounds: bounds,
                previousMapPosition: previousMapPosition ?? map.previousMapPosition,
                previousZoom: previousZoom ?? map.previousZoom,
            })
        })
        return null
    }

    return (
        <>
            <MapBounds />
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <MarkerClusterGroup maxClusterRadius={60} showCoverageOnHover={false}>
                {markerPositions.map((markerPosition, index) => {
                    if (markerPosition.isDraggable === true) {
                        return (
                            <DraggableMarker key={index} />
                        );
                    }
                    if (isMarkerInBounds(markerPosition, mapHook.getBounds())) {
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
        </>
    );
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