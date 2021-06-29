import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import FilterBar from '../components/FilterBar';
import ContentWrapper from '../components/ContentWrapper';
import AboutLink from '../components/AboutLink';
import styles from '../styles/AddLocation.module.css';
import AddLocationForm from '../components/AddLocationForm';

export default function AddLocation() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const DraggableMap = dynamic(
        () => import('../components/DraggableMap'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <p>Map is loading...</p>,
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
            <main>
                <FilterBar backButtonHref="/" />
                <ContentWrapper>
                    <h1>
                        Add Nude Place
                    </h1>
                    {isSubmitted ? <SuccessContainer /> : <AddLocationForm setIsSubmitted={setIsSubmitted} />}                    
                    <div className={styles.aboutLinkContainer}>
                        <AboutLink />
                    </div>
                </ContentWrapper>
                <div className={styles.mapContainer}>
                    <DraggableMap />
                </div>
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