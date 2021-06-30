import styles from '../styles/components/MapContainer.module.css';

export default function MapContainer({ children }) {
    return (
        <div className={styles.mapContainer}>
            {children}
        </div>
    )
}