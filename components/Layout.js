import dynamic from 'next/dynamic';
import AddLocationButton from './AddLocationButton';
import LoaderContainer from './LoaderContainer';
import MapContainer from './MapContainer';
import Navigation from './Navigation';
import ContentWrapper from './ContentWrapper';
import AboutLink from './AboutLink';
import styles from '../styles/components/Layout.module.css';

export default function Layout({ children, map }) {

    const Map = dynamic(
        () => import('./Map'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <LoaderContainer />,
            ssr: false
        }
    );
    Map.displayName = 'Map';

    return (
        <>
            <main className={styles.main}>
                <Navigation />
                <ContentWrapper>
                    {children}
                    <div className={styles.aboutLinkContainer}>
                        <AboutLink />
                    </div>
                </ContentWrapper>
                <MapContainer>
                    {map ?? <Map />}
                    <AddLocationButton />
                </MapContainer>
            </main>
        </>
    )
}