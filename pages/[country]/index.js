import Head from 'next/head';
import LinkList from '../../components/LinkList';
import initFirebase from '../../lib/firebase';
import Layout from '../../components/Layout';

export default function LocationsIndex(props) {
    let { country, regions, locationsByRegion, allLocations } = props;
    const mapData = {
        mapPosition: [
            country.latitude,
            country.longitude
        ],
        markerPositions: buildCountryLocationsMarkerPositions(allLocations, country),
        zoom: 6,
    }

    const backButtonData = {
        href: '/',
        text: "Countries",
    }

    return (
        <>
            <Head>
                <title>{getTitleString(country)}</title>
            </Head>
            <Layout mapData={mapData} backButtonData={backButtonData}>
                <h1>
                    {country.name}
                </h1>
                <ul>
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
        const props = require('../../dev/countries/staticProps.json');
        return props;
    }

    let db = await initFirebase()

    // Fetch country
    let countryData = db.collection('countries').where('urlName', '==', params.country).limit(1).get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    }).catch((error) => {
        console.log("Error getting country data: ", error);
        return { notFound: true }
    });
    const country = await countryData

    if (!country[0]) {
        return { notFound: true }
    }

    // Fetch locations for country sorted by region and title
    let locationsData = db.collection('locations')
        .where('country', '==', country[0].isoCode)
        .orderBy('region')
        .orderBy('title')
        .limit(50)
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
            country: country[0],
            regions: regions ?? [],
            locationsByRegion: locationsByRegion ?? {},
            allLocations: filteredLocations ?? {}
        }
    }
}


export async function getStaticPaths() {
    if (process.env.NODE_ENV === 'development') {
        const paths = require('../../dev/countries/staticPaths.json');
        return paths;
    }

    let db = await initFirebase()
    let data = db.collection('countries')
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

    const countries = await data

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
