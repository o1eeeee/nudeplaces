import dynamic from 'next/dynamic';
import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import ContentWrapper from '../components/ContentWrapper';
import AboutLink from '../components/AboutLink';
import LoaderContainer from '../components/LoaderContainer';
import Loader from '../components/Loader';
import styles from '../styles/AddLocation.module.css';
import AddLocationForm from '../components/AddLocationForm';
import MapContainer from '../components/MapContainer';

export default function AddLocation() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const DraggableMap = dynamic(
        () => import('../components/DraggableMap'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <LoaderContainer />,
            ssr: false
        }
    );

    const SuccessContainer = () => (
        <div className={styles.successContainer}>
            <p>Thank you for submitting a nude place! Your submission will be checked by our moderators before getting published. Please allow 1-2 days for it to show up on the website.</p>
            <button type="button" onClick={() => setIsSubmitted(false)}>Add Another Nude Place</button>
        </div>
    );

    return (
        <>
            <Head>
                <title>{getTitleString()}</title>
            </Head>
            <main className={styles.main}>
                <Navigation />
                {isSubmitting && <div className={styles.loaderContainer}><Loader /></div>}
                <ContentWrapper>
                    <h1>
                        Add Nude Place
                    </h1>
                    {isSubmitted ? <SuccessContainer /> : <AddLocationForm isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} setIsSubmitted={setIsSubmitted} />}
                    <div className={styles.aboutLinkContainer}>
                        <AboutLink />
                    </div>
                </ContentWrapper>
                <MapContainer>
                    <DraggableMap />
                </MapContainer>
            </main>
        </>
    )
}


function getTitleString() {
    const titleString = [];
    titleString.push("Add Nude Place");
    titleString.push("Nudist, Naturist, Clothing Optional Places and Beaches worldwide");
    titleString.push("nudeplaces");
    return titleString.join(" – ")
}