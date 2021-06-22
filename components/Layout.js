import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '../styles/components/Layout.module.css';
import { useState } from 'react';

export default function Layout({ children, mapData, backButtonData }) {
    const [showMap, setShowMap] = useState(false);

    const Map = dynamic(
        () => import('./Map'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <p>Map is loading...</p>,
            ssr: false
        }
    );
    Map.displayName = 'Map';

    const ButtonBar = () => (
        <div className={styles.buttonBar}>
            {backButtonData && (
                <Link href={backButtonData.href ?? '/'}>
                    <a className={styles.backButton}>
                        {backButtonData.href && (<>&larr; </>)}
                        {backButtonData.text}
                    </a>
                </Link>
            )}
            <button onClick={() => setShowMap(true)} className={styles.mapButton}>
                <span className="icon-map"></span>
            </button>
        </div>
    );
    ButtonBar.displayName = 'ButtonBar';

    return (
        <>
            <main className={styles.main}>
                {!showMap ? (
                    <div className={styles.content}>
                        <ButtonBar />
                        <div className={styles.scrollableContainer}>
                            {children}
                        </div>
                        <Link href={'/'}>
                            <a className={styles.addButton}><span className="icon-location"></span> Add Location</a>
                        </Link>
                    </div>
                ) : (
                    <button onClick={() => setShowMap(false)} className={styles.infoButton}>
                        <span className="icon-info"></span>
                    </button>
                )}
                <Map mapPosition={mapData.mapPosition} markerPositions={mapData.markerPositions} zoom={mapData.zoom}></Map>
            </main>
        </>
    )
}