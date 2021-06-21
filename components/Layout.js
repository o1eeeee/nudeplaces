import dynamic from 'next/dynamic';
import styles from '../styles/components/Layout.module.css';

const Layout = ({ children, mapData }) => {    
    
    const Map = dynamic(
        () => import('./Map'),
        {
          loading: () => <p>Map is loading...</p>,
          ssr: false
        }
      );
    return (
        <>
            <main className={styles.main}>
                <div className={styles.content}>{children}</div>
                <Map mapPosition={mapData.mapPosition} markerPositions={mapData.markerPositions} zoom={mapData.zoom}></Map>
            </main>
        </>
    )
}

export default Layout;