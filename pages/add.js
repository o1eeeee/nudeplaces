import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import styles from '../styles/AddLocation.module.css';
import { useMapContext } from '../context/MapProvider';
import AddLocationForm from '../components/AddLocationForm';
import { useLanguageContext } from '../context/LanguageProvider';

export default function AddLocation() {
    const { dictionary } = useLanguageContext();
    const { map, setMap } = useMapContext();
    const { mapPosition } = map;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        setMap({
            ...map,
            markerPositions: [{
                latitude: 0,
                longitude: 0,
                isDraggable: true
            }],
            draggableMarkerPosition: mapPosition,
        })
    }, [mapPosition])

    const SuccessContainer = () => (
        <div className={styles.successContainer}>
            <p>{dictionary("addLocationSuccessText")}</p>
            <button type="button" onClick={() => setIsSubmitted(false)}>{dictionary("addLocationSuccessButton")}</button>
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
                    {dictionary("addLocationTitle")}
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