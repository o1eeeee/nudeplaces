/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';
import { useMapContext } from '../context/MapProvider';

export default function Map() {
    const { mapPosition, markerPositions, zoom } = useMapContext();

    return (
        <MapContainer center={mapPosition} zoom={zoom} scrollWheelZoom={false} style={{ height: "100vh", flex: "1 1 0%" }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!markerPositions ?
                <Marker position={mapPosition}></Marker> :
                markerPositions.map((markerPosition, index) => (
                    <Marker key={index} position={[markerPosition.latitude, markerPosition.longitude]}>
                        {markerPosition.title && (
                            <Popup>
                                <h3>{markerPosition.title}</h3>
                                {markerPosition.text && <p>{markerPosition.text}</p>}
                                {markerPosition.url && (
                                    <Link href={markerPosition.url}>
                                        <a>Read more...</a>
                                    </Link>
                                )}
                            </Popup>
                        )
                        }
                    </Marker>
                ))}
        </MapContainer>
    )
}