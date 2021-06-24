import { useEffect } from 'react';
import Head from 'next/head';
import LinkList from '../../components/LinkList';
import initFirebase from '../../lib/firebase';
import getCountries from '../../lib/countries';
import Layout from '../../components/Layout';
import { useMapContext } from '../../context/MapProvider';

export default function LocationsIndex(props) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();
    let { countries, initialCountry, regions, locationsByRegion, allLocations } = props;

    useEffect(() => {
        setMapPosition([
            initialCountry.latitude,
            initialCountry.longitude
        ]);
        setMarkerPositions(buildCountryLocationsMarkerPositions(allLocations, initialCountry));
        setZoom(6);
    }, [initialCountry, allLocations]);

    const backButtonData = {
        href: '/',
        text: "Countries",
    }

    return (
        <>
            <Head>
                <title>{getTitleString(initialCountry)}</title>
            </Head>
            <Layout backButtonData={backButtonData}>
                <h1>
                    {initialCountry.name}
                </h1>
                {/*<button onClick={() => { filterLocations(filteredLocations, setFilteredLocations)}} >Filter</button>*/}
                <ul>
                    {regions.map((region) => (
                        <li key={region}>
                            <h2>{region}</h2>
                            <LinkList listItems={getLocationListItems(locationsByRegion[region], initialCountry)} />
                        </li>
                    ))}
                </ul>
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
    const regions = [];
    const locationsByRegion = {};

    // Filter out locations that don't have a seoName
    const filteredLocations = locations.filter(location => location.seoName != null)

    // Distribute locations to region arrays
    let assignToRegion = 'unassigned';
    filteredLocations.map((location) => {
        assignToRegion = location.region ?? 'unassigned';
        if (!locationsByRegion[assignToRegion]) {
            regions.push(assignToRegion);
            locationsByRegion[assignToRegion] = [];
        }
        locationsByRegion[assignToRegion].push(location);
    })

    return {
        props: {
            countries: countries,
            initialCountry: initialCountry[0],
            regions: regions ?? [],
            locationsByRegion: locationsByRegion ?? {},
            allLocations: filteredLocations ?? {}
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
        })
    })

    return listItems;
}


function filterLocations(locations, setFilteredLocations) {
    const filteredLocations = locations.filter(location => location.type === "beach")
    setFilteredLocations(filteredLocations);
  }
