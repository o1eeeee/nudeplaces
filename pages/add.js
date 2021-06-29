import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import FilterBar from '../components/FilterBar';
import ContentWrapper from '../components/ContentWrapper';
import AboutLink from '../components/AboutLink';
import styles from '../styles/AddLocation.module.css';
import AddLocationForm from '../components/AddLocationForm';

export default function AddLocation() {
    const DraggableMap = dynamic(
        () => import('../components/DraggableMap'),
        {
            // eslint-disable-next-line react/display-name
            loading: () => <p>Map is loading...</p>,
            ssr: false
        }
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
                    <AddLocationForm />
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