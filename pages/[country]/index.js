import { useState, useEffect } from 'react';
import Head from 'next/head';
import LinkList from '../../components/LinkList';
import initFirebase from '../../lib/firebase';
import { getCountries, getRegionsForCountry } from '../../lib/countries';
import { config } from '../../lib/config';
import Layout from '../../components/Layout';
import FilterBar from '../../components/FilterBar';
import { useMapContext } from '../../context/MapProvider';
import styles from '../../styles/Country.module.css';
import { useLanguageContext } from '../../context/LanguageProvider';
import { useHistoryContext } from '../../context/HistoryProvider';

const useCountry = (locations) => {
    const { bounds, setMarkerPositions } = useMapContext();
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [locationTypeFilter, setLocationTypeFilter] = useState([]);

    useEffect(() => {
        const locationsInBounds = bounds ? getLocationsInBounds(locations, bounds) : locations;
        const typeFilteredLocations = (locationTypeFilter.length > 0) ? locationsInBounds.filter((location) => locationTypeFilter.includes(location.type)) : locationsInBounds;
        setFilteredLocations(typeFilteredLocations);

        const markerPositions = buildCountryLocationsMarkerPositions(typeFilteredLocations);
        setMarkerPositions(markerPositions);
    }, [bounds, locations, JSON.stringify(locationTypeFilter)])

    return { filteredLocations, locationTypeFilter, setLocationTypeFilter }
}

export default function Country({ country, locations }) {
    const { previousPath, previousMapPosition, setPreviousMapPosition, previousZoom, setPreviousZoom } = useHistoryContext();
    const { dictionary } = useLanguageContext();
    const { filteredLocations, locationTypeFilter, setLocationTypeFilter } = useCountry(locations);
    let { regions, locationsByRegion } = getLocationsByRegion(filteredLocations, country);
    const { setMapPosition, setZoom } = useMapContext();

    useEffect(() => {
        if (country) {
            if (previousPath === "/[country]/[location]") {
                setMapPosition(previousMapPosition);
                setZoom(previousZoom);
            } else {
                let mapPosition = {
                    latitude: country.latitude,
                    longitude: country.longitude
                }
                setMapPosition(mapPosition);
                setPreviousMapPosition(mapPosition);

                // zoom out one level on small devices
                const initZoom = country.zoom;
                const isSmallDevice = document.documentElement.clientWidth < config.BREAKPOINT_MD_IN_PX;
                const zoom = initZoom ? (isSmallDevice ? (initZoom - 1) : initZoom) : config.MAP_DEFAULT_ZOOM_COUNTRY;
                setZoom(zoom);
                setPreviousZoom(zoom);
            }
        }
    }, [country])

    return (
        <>
            <Head>
                <title>{getTitleString(country)}</title>
                <meta name="description" content={`Find nudist, naturist and clothing optional places, beaches, resorts and camps in ${country.name}.`} />
                <meta name="og:description" content={`Find nudist, naturist and clothing optional places, beaches, resorts and camps in ${country.name}.`} key="og-description" />
            </Head>
            <FilterBar locationTypeFilter={locationTypeFilter} setLocationTypeFilter={setLocationTypeFilter} />
            <Layout>
                <h1>
                    {country.name}
                </h1>
                {filteredLocations.length > 0
                    ? <p>{dictionary("countryShowingLocationsCount")} {filteredLocations.length} {filteredLocations.length > 1 ? <>{dictionary("countryNudePlaces")}</> : <>{dictionary("countryNudePlace")}</>} in {country.name}.</p>
                    : <p>{dictionary("countryNoLocationsFound")}</p>
                }

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
    if (process.env.NODE_ENV === 'development') {
        if (config.ENABLE_DEV_MODE) {
            const props = require(`../../dev/countries/${params.country}/staticProps.json`);
            const countries = getCountries();
            const country = countries.filter(country => country.urlName === params.country);

            if (!country[0]) {
                return { notFound: true }
            }

            props["props"]["countries"] = countries
            props["props"]["country"] = country[0]

            return props;
        }
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
            return snapshot.docs.map(doc => {
                return ({
                    "id": doc.id,
                    ...doc.data()
                })
            })
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


function buildCountryLocationsMarkerPositions(locations) {
    const markerPositions = [];

    locations.map((location) => {
        markerPositions.push({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            title: location.title,
            text: location.text,
            seoName: location.seoName,
        })
    })

    return markerPositions;
}


function buildLocationUrl(location, country) {
    return `${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.seoName)}`;
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


function getLocationsByRegion(locations, country) {
    // Distribute locations to region arrays
    const allRegions = getRegionsForCountry(country);
    const regions = [];
    const locationsByRegion = {};
    locations.map((location) => {
        const regionFromList = location.region && allRegions.filter(region => location.region === region.code)[0];
        const fullRegionName = regionFromList ? regionFromList.name : location.region;
        const assignToRegion = fullRegionName ?? 'Other regions';
        if (!locationsByRegion[assignToRegion]) {
            regions.push(assignToRegion);
            locationsByRegion[assignToRegion] = [];
        }
        locationsByRegion[assignToRegion].push(location);
    })

    regions.sort();

    return { regions, locationsByRegion };
}


function getLocationsInBounds(locations, bounds) {
    if (!bounds) {
        return locations
    }
    const { _northEast, _southWest } = bounds;
    const locationsInBounds = locations.filter(location => {
        return location.latitude < _northEast.lat &&
            location.longitude < _northEast.lng &&
            location.latitude > _southWest.lat &&
            location.longitude > _southWest.lng
    })
    return locationsInBounds;
}
