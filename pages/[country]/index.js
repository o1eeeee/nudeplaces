import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getCountries, getRegionsForCountry } from '../../lib/countries';
import { config } from '../../lib/config';
import Layout from '../../components/Layout';
import FilterBar from '../../components/FilterBar';
import { useMapContext } from '../../context/MapProvider';
import styles from '../../styles/Country.module.css';
import { useLanguageContext } from '../../context/LanguageProvider';
import { useHistoryContext } from '../../context/HistoryProvider';
import LocationList from '../../components/LocationList';

const useCountry = (locations) => {
    const { map, setMap } = useMapContext();
    const { bounds } = map;
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [locationTypeFilter, setLocationTypeFilter] = useState([]);

    useEffect(() => {
        const locationsInBounds = bounds ? getLocationsInBounds(locations, bounds) : locations;
        const typeFilteredLocations = getLocationsFilteredByType(locationsInBounds, locationTypeFilter);
        setFilteredLocations(typeFilteredLocations);
    }, [bounds, locations, JSON.stringify(locationTypeFilter)])

    useEffect(() => {
        const typeFilteredLocations = getLocationsFilteredByType(locations, locationTypeFilter);
        const markerPositions = buildCountryLocationsMarkerPositions(typeFilteredLocations);
        setMap({
            ...map,
            markerPositions: markerPositions,
        });
    }, [locations, JSON.stringify(locationTypeFilter)])

    return { filteredLocations, locationTypeFilter, setLocationTypeFilter }
}

export default function Country({ country, locations }) {
    const { previousCountry, setPreviousCountry, previousPath } = useHistoryContext();
    const { dictionary } = useLanguageContext();
    const { filteredLocations, locationTypeFilter, setLocationTypeFilter } = useCountry(locations);
    let { regions, locationsByRegion } = getLocationsByRegion(filteredLocations, country);
    const { map, setMap } = useMapContext();
    const { previousMapPosition, previousZoom } = map;

    useEffect(() => {
        if (country) {
            if (previousPath === "/[country]/[location]" && country.urlName === previousCountry) {
                setMap({
                    ...map,
                    mapPosition: previousMapPosition,
                    markerPositions: buildCountryLocationsMarkerPositions(locations),
                    zoom: previousZoom,
                })
            } else {
                let mapPosition = {
                    latitude: country.latitude,
                    longitude: country.longitude
                }
                setPreviousCountry(country.urlName);

                // zoom out one level on small devices
                const initZoom = country.zoom;
                const isSmallDevice = document.documentElement.clientWidth < config.BREAKPOINT_MD_IN_PX;
                const zoom = initZoom ? (isSmallDevice ? (initZoom - 1) : initZoom) : config.MAP_DEFAULT_ZOOM_COUNTRY;
                setMap({
                    ...map,
                    mapPosition: mapPosition,
                    markerPositions: buildCountryLocationsMarkerPositions(locations),
                    previousMapPosition: mapPosition,
                    zoom: zoom,
                    previousZoom: zoom,
                })
            }
        }
    }, [country, locations])

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
                            <LocationList locations={locationsByRegion[region]} country={country} />
                        </li>
                    ))}
                </ul>
            </Layout>
        </>
    )
}

export async function getStaticProps({ params }) {
    // Fetch countries
    const countries = getCountries();
    const country = countries.filter(country => country.urlName === params.country);
    if (!country[0]) {
        return { notFound: true }
    }

    let locations;
    const publicationState = process.env.NODE_ENV === 'development' ? "preview" : "live";
    try {
        const response = await fetch(`${config.FETCH_URL}/locations?filters[country][$eq]=${country[0].isoCode}&sort=seo_name&publicationState=${publicationState}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        locations = await response.json()
    } catch (error) {
        console.log("Error getting location data: ", error);
        return { notFound: true }
    }

    return {
        revalidate: 86400,
        props: {
            country: country[0],
            locations: locations.data ?? []
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
            latitude: location.attributes.latitude,
            longitude: location.attributes.longitude,
            title: location.attributes.title,
            text: location.attributes.text,
            seo_name: location.attributes.seo_name,
        })
    })

    markerPositions.sort((a, b) => a.id - b.id);

    return markerPositions;
}


function getLocationsByRegion(locations, country) {
    // Distribute locations to region arrays
    const allRegions = getRegionsForCountry(country);
    const regions = [];
    const locationsByRegion = {};
    locations.map((location) => {
        const attributes = location.attributes;
        const regionFromList = attributes.region && allRegions.filter(region => attributes.region === region.code)[0];
        const fullRegionName = regionFromList ? regionFromList.name : attributes.region;
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
    const locationsInBounds = locations.filter(({ attributes }) => {
        return attributes.latitude < _northEast.lat &&
            attributes.longitude < _northEast.lng &&
            attributes.latitude > _southWest.lat &&
            attributes.longitude > _southWest.lng
    })
    return locationsInBounds;
}


function getLocationsFilteredByType(locations, filters) {
    const filteredLocations = (filters.length > 0) ? locations.filter(({attributes}) => filters.includes(attributes.type)) : locations;
    return filteredLocations;
}
