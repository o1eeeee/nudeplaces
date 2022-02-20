import { useState } from 'react';
import { useGeolocationContext } from '../context/GeolocationProvider';
import styles from '../styles/components/GetGeolocationButton.module.css';
import LoaderInline from './LoaderInline';

export default function GetGeolocationButton() {
    const { setCurrentPosition } = useGeolocationContext();
    const [loading, setLoading] = useState(false);
    return (
        <button className={styles.geoButton} onClick={() => {
            setLoading(true)
            navigator.geolocation.getCurrentPosition(function (position) {
                setCurrentPosition({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
                setLoading(false)
            }, function () {
                setLoading(false)
            });
        }}>
            {loading ? <LoaderInline /> : <span className="icon-geolocation"></span>}
            <span className={styles.geoButtonText}>Geolocation</span>
        </button>
    )
}