import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '../styles/components/Layout.module.css';

const Layout = ({ children, mapData, backButtonData }) => {

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
                <div className={styles.content}>
                    {backButtonData && (
                        <Link href={backButtonData.href}>
                            <a className={styles.backButton}>&larr; {backButtonData.text}</a>
                        </Link>
                    )}
                    {children}
                    <Link href={'/'}>
                        <a className={styles.addButton}>+ Add Location</a>
                    </Link>
                </div>
                <Map mapPosition={mapData.mapPosition} markerPositions={mapData.markerPositions} zoom={mapData.zoom}></Map>
            </main>
        </>
    )
}

export default Layout;