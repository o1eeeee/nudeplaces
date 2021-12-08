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
    try {
        const response = await fetch(`${config.FETCH_URL}/locations?country=${country[0].isoCode}&_sort=seoName&_limit=2000`, {
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

    const publishedLocations = locations.filter((location) => {
        if (process.env.NODE_ENV === 'development') {
            return true;
        } else {
            return location.published_at != null;
        }
    });

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
