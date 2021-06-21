/** https://stackoverflow.com/questions/57704196/leaflet-with-next-js */
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';

const Map = ({ mapPosition, markerPositions, zoom }) => {
    return (
        <MapContainer center={mapPosition} zoom={zoom} scrollWheelZoom={false} style={{ height: 600, width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!markerPositions ?
                <Marker position={mapPosition}></Marker> :
                markerPositions.map((markerPosition, index) => (
                    <Marker key={index} position={[markerPosition.latitude, markerPosition.longitude]}>
                        <Popup>
                            <h3>{markerPosition.title}</h3>
                            {markerPosition.text && <p>{markerPosition.text}</p>}
                            <Link href={markerPosition.url}>
                                <a>Read more...</a>
                            </Link>
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>
    )
}

export default Map
