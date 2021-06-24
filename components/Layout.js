import dynamic from 'next/dynamic';
import Link from 'next/link';
import styles from '../styles/components/Layout.module.css';

export default function Layout({ children }) {

    const Map = dynamic(
        () => import('./Map'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <p>Map is loading...</p>,
            ssr: false
        }
    );
    Map.displayName = 'Map';

    return (
        <>
            <main className={styles.main}>
                {children}
                <div className={styles.mapContainer}>
                    <Map />
                    <Link href={'/'}>
                        <a className={styles.addButton}><span className="icon-location"></span> Add Location</a>
                    </Link>
                </div>
            </main>
        </>
    )
}