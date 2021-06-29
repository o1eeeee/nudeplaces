/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';
import { useMapContext } from '../context/MapProvider';

export default function Map() {
    const { mapPosition, markerPositions, zoom } = useMapContext();

    return (
        <MapContainer zoomControl={false} center={mapPosition} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", flex: "1 1 0%" }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            {!markerPositions ?
                <Marker position={mapPosition}></Marker> :
                markerPositions.map((markerPosition, index) => {
                    let markerPositionText = markerPosition.text;
                    let popupText = "";
                    if (markerPositionText) {
                        popupText = markerPositionText.length > 200 ? `${markerPositionText.substring(0, 200)}...` : markerPositionText;
                    }
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
        </MapContainer>
    )
}

