import { useState, useEffect } from 'react';
import Head from 'next/head';
import LinkList from '../../components/LinkList';
import FilterBar from '../../components/FilterBar';
import ContentWrapper from '../../components/ContentWrapper';
import initFirebase from '../../lib/firebase';
import getCountries from '../../lib/countries';
import Layout from '../../components/Layout';
import { useMapContext } from '../../context/MapProvider';

export default function Country({ initialCountry, locations }) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [locationTypeFilter, setLocationTypeFilter] = useState([]);
    let { regions, locationsByRegion } = getLocationsByRegion(filteredLocations);

    useEffect(() => {
        setMapPosition([
            initialCountry.latitude,
            initialCountry.longitude
        ]);
        setMarkerPositions(buildCountryLocationsMarkerPositions(filteredLocations, initialCountry));
        setZoom(6);
    }, [initialCountry, filteredLocations]);

    useEffect(() => {
        if (locationTypeFilter.length > 0) {
            const typeFilteredLocations = locations.filter((location) => locationTypeFilter.includes(location.type))
            setFilteredLocations(typeFilteredLocations);
        } else {
            setFilteredLocations(locations);
        }
    }, [JSON.stringify(locationTypeFilter)])

    return (
        <>
            <Head>
                <title>{getTitleString(initialCountry)}</title>
            </Head>
            <Layout>
                <FilterBar initialCountry={initialCountry} backButtonHref='/' locationTypeFilter={locationTypeFilter} setLocationTypeFilter={setLocationTypeFilter} />
                <ContentWrapper>
                    <h1>
                        {initialCountry.name}
                    </h1>
                    <p>{filteredLocations.length} nude place{filteredLocations.length != 1 && <>s</>} in {initialCountry.name}</p>
                    <ul>
                        {regions.map((region) => (
                            <li key={region}>
                                <h2>{region}</h2>
                                <LinkList listItems={getLocationListItems(locationsByRegion[region], initialCountry)} />
                            </li>
                        ))}
                    </ul>
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

    let db = await initFirebase()

    // Fetch countries
    const countries = getCountries();
    const initialCountry = countries.filter(country => country.urlName === params.country);

    if (!initialCountry[0]) {
        return { notFound: true }
    }

    // Fetch locations for country sorted by region and title
    let locationsData = db.collection('locations')
        .where('country', '==', initialCountry[0].isoCode)
        .orderBy('region')
        .orderBy('title')
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData

    // Filter out locations that don't have a seoName
    const filteredLocations = locations.filter(location => location.seoName != null)

    return {
        props: {
            initialCountry: initialCountry[0],
            locations: filteredLocations ?? {}
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
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.region ?? 'unassigned')}/${encodeURIComponent(location.seoName)}`;
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

    return { regions, locationsByRegion };
}
