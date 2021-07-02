import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import styles from '../styles/AddLocation.module.css';
import { useMapContext } from '../context/MapProvider';
import AddLocationForm from '../components/AddLocationForm';

export default function AddLocation() {
    const { mapPosition, setDraggableMarkerPosition, setMarkerPositions } = useMapContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        setMarkerPositions([{
            latitude: 0,
            longitude: 0,
            isDraggable: true
        }])
        setDraggableMarkerPosition(mapPosition)
    }, [mapPosition])

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
            {isSubmitting && <div className={styles.loaderContainer}><Loader /></div>}
            <Layout>
                <h1>
                    Add Nude Place
                </h1>
                {isSubmitted ? <SuccessContainer /> : <AddLocationForm isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} setIsSubmitted={setIsSubmitted} />}
            </Layout>
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