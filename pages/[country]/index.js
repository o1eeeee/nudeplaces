import { useState, useEffect } from 'react';
import Head from 'next/head';
import LinkList from '../../components/LinkList';
import initFirebase from '../../lib/firebase';
import { getCountries } from '../../lib/countries';
import { config } from '../../lib/config';
import Layout from '../../components/Layout';
import FilterBar from '../../components/FilterBar';
import { useMapContext } from '../../context/MapProvider';
import styles from '../../styles/Country.module.css';

export default function Country({ country, locations }) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [locationTypeFilter, setLocationTypeFilter] = useState([]);
    const [isMapLimited, setIsMapLimited] = useState(false);
    let { regions, locationsByRegion } = getLocationsByRegion(filteredLocations);

    useEffect(() => {
        setMapPosition({
            latitude: country.latitude,
            longitude: country.longitude
        });

        // zoom out one level on small devices
        const initZoom = country.zoom;
        const isSmallDevice = document.documentElement.clientWidth < config.BREAKPOINT_MD_IN_PX;
        const zoom = initZoom ? (isSmallDevice ? (initZoom - 1) : initZoom) : config.MAP_DEFAULT_ZOOM_COUNTRY;
        setZoom(zoom);
    }, [country])

    useEffect(() => {
        let typeFilteredLocations = []
        if (locationTypeFilter.length > 0) {
            typeFilteredLocations = locations.filter((location) => locationTypeFilter.includes(location.type))
        } else {
            typeFilteredLocations = locations
        }
        setFilteredLocations(typeFilteredLocations);

        const markerPositions = buildCountryLocationsMarkerPositions(typeFilteredLocations, country);
        const isSmallDevice = document.documentElement.clientWidth < config.BREAKPOINT_MD_IN_PX;
        if (markerPositions.length > config.MAP_MARKER_LIMIT_MOBILE && isSmallDevice) {
            setMarkerPositions(markerPositions.slice(0, config.MAP_MARKER_LIMIT_MOBILE));
            setIsMapLimited(true);
        } else {
            setMarkerPositions(markerPositions);
            setIsMapLimited(false);
        }
    }, [country, locations, JSON.stringify(locationTypeFilter)])

    return (
        <>
            <Head>
                <title>{getTitleString(country)}</title>
            </Head>
            <FilterBar locationTypeFilter={locationTypeFilter} setLocationTypeFilter={setLocationTypeFilter} />
            <Layout>
                <h1>
                    {country.name}
                </h1>
                <p>{filteredLocations.length} nude place{filteredLocations.length != 1 && <>s</>} in {country.name}. {isMapLimited && <><br />Max. {config.MAP_MARKER_LIMIT_MOBILE} places are shown on the map. Please use filters or scroll down to see more.</>}</p>
                <ul className={styles.regionsList}>
                    {regions.map((region) => (
                        <li key={region}>
                            <h2>{region}</h2>
                            <LinkList listItems={getLocationListItems(locationsByRegion[region], country)} />
                        </li>
                    ))}
                </ul>
            </Layout>
        </>
    )
}

export async function getStaticProps({ params }) {
    if (config.ENABLE_DEV_MODE && process.env.NODE_ENV === 'development') {
        const props = require('../../dev/countries/staticProps.json');
        const countries = getCountries();
        const country = countries.filter(country => country.urlName === params.country);

        if (!country[0]) {
            return { notFound: true }
        }

        props["props"]["countries"] = countries
        props["props"]["country"] = country[0]

        return props;
    }

    let db = await initFirebase()

    // Fetch countries
    const countries = getCountries();
    const country = countries.filter(country => country.urlName === params.country);
    if (!country[0]) {
        return { notFound: true }
    }

    // Fetch locations for country
    let locationsData = db.collection('locations')
        .where('country', '==', country[0].isoCode)
        .where('seoName', '>', '')
        .orderBy('seoName')
        .limit(config.FETCH_LOCATIONS_LIMIT)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData

    const publishedLocations = locations.filter((location) => location.isPublished != false);

    return {
        revalidate: 86400,
        props: {
            country: country[0],
            locations: publishedLocations ?? {}
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
