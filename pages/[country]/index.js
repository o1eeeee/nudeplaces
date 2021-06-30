import { useState, useEffect } from 'react';
import Head from 'next/head';
import LinkList from '../../components/LinkList';
import FilterBar from '../../components/FilterBar';
import ContentWrapper from '../../components/ContentWrapper';
import initFirebase from '../../lib/firebase';
import { getCountries } from '../../lib/countries';
import Layout from '../../components/Layout';
import AboutLink from '../../components/AboutLink';
import { useMapContext } from '../../context/MapProvider';
import styles from '../../styles/Country.module.css';

export default function Country({ initialCountry, locations }) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [locationTypeFilter, setLocationTypeFilter] = useState([]);
    let { regions, locationsByRegion } = getLocationsByRegion(filteredLocations);

    useEffect(() => {
        let typeFilteredLocations = []
        if (locationTypeFilter.length > 0) {
            typeFilteredLocations = locations.filter((location) => locationTypeFilter.includes(location.type))
        } else {
            typeFilteredLocations = locations
        }

        // zoom out one level on small devices
        const initZoom = initialCountry.zoom;
        const isSmallDevice = document.documentElement.clientWidth < 768;
        const zoom = initZoom ? (isSmallDevice ? (initZoom - 1) : initZoom) : 6;

        setFilteredLocations(typeFilteredLocations);
        setMapPosition([
            initialCountry.latitude,
            initialCountry.longitude
        ]);
        setMarkerPositions(buildCountryLocationsMarkerPositions(typeFilteredLocations, initialCountry));
        setZoom(zoom);

    }, [initialCountry, locations, JSON.stringify(locationTypeFilter)])

    return (
        <>
            <Head>
                <title>{getTitleString(initialCountry)}</title>
            </Head>
            <Layout>
                <FilterBar initialCountry={initialCountry} locationTypeFilter={locationTypeFilter} setLocationTypeFilter={setLocationTypeFilter} />
                <ContentWrapper>
                    <h1>
                        {initialCountry.name}
                    </h1>
                    <p>{filteredLocations.length} nude place{filteredLocations.length != 1 && <>s</>} in {initialCountry.name}</p>
                    <ul className={styles.regionsList}>
                        {regions.map((region) => (
                            <li key={region}>
                                <h2>{region}</h2>
                                <LinkList listItems={getLocationListItems(locationsByRegion[region], initialCountry)} />
                            </li>
                        ))}
                    </ul>
                    <div className={styles.aboutLinkContainer}>
                        <AboutLink />
                    </div>
                </ContentWrapper>
            </Layout>
        </>
    )
}

export async function getStaticProps({ params }) {
    if (process.env.NODE_ENV === 'development') {
        const props = require('../../dev/countries/staticProps.json');
        const countries = getCountries();
        const initialCountry = countries.filter(country => country.urlName === params.country);

        if (!initialCountry[0]) {
            return { notFound: true }
        }

        props["props"]["countries"] = countries
        props["props"]["initialCountry"] = initialCountry[0]

        return props;
    }

    let limit = 2000;
    if (process.env.NODE_ENV === 'development') {
        // Safety net for testing purposes
        limit = 20;
    }

    let db = await initFirebase()

    // Fetch countries
    const countries = getCountries();
    const initialCountry = countries.filter(country => country.urlName === params.country);
    if (!initialCountry[0]) {
        return { notFound: true }
    }

    // Fetch locations for country
    let locationsData = db.collection('locations')
        .where('country', '==', initialCountry[0].isoCode)
        .where('seoName', '>', '')
        .orderBy('seoName')
        .limit(limit)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData

    return {
        revalidate: 86400,
        props: {
            initialCountry: initialCountry[0],
            locations: locations ?? {}
        }
    }
}


export async function getStaticPaths() {
    const countries = getCountries();

    const paths = countries.map((country) => ({
        params: { country: country.urlName }
    }))

    return {
        paths,
        fallback: false,
    }
}


function getTitleString(country) {
    const titleString = [];
    titleString.push(country.name);
    titleString.push(`Nudist, Naturist, Clothing Optional Places and Beaches in ${country.name}`);
    titleString.push("nudeplaces");
    return titleString.join(" – ")
}


function buildCountryLocationsMarkerPositions(locations, country) {
    const markerPositions = [];

    locations.map((location) => {
        markerPositions.push({
            latitude: location.latitude,
            longitude: location.longitude,
            title: location.title,
            text: location.text,
            url: buildLocationUrl(location, country)
        })
    })

    return markerPositions;
}


function buildLocationUrl(location, country) {
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.seoName)}`;
}


function getLocationListItems(locations, country) {
    const listItems = [];

    locations.map((location) => {
        listItems.push({
            href: buildLocationUrl(location, country),
            text: location.title,
            icon: location.type
        })
    })

    return listItems;
}


function getLocationsByRegion(locations) {
    // Distribute locations to region arrays
    const regions = [];
    const locationsByRegion = {};
    let assignToRegion = 'unassigned';
    locations.map((location) => {
        assignToRegion = location.region ?? 'unassigned';
        if (!locationsByRegion[assignToRegion]) {
            regions.push(assignToRegion);
            locationsByRegion[assignToRegion] = [];
        }
        locationsByRegion[assignToRegion].push(location);
    })

    regions.sort();

    return { regions, locationsByRegion };
}
