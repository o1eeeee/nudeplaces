import Head from 'next/head';
import Link from 'next/link'
import initFirebase from '../../lib/firebase';
import Layout from '../../components/Layout';

export default function LocationsIndex({ country, regions, locationsByRegion, allLocations }) {

    const mapData = {
        mapPosition: [
            country.latitude,
            country.longitude
        ],
        markerPositions: buildCountryLocationsMarkerPositions(allLocations, country),
        zoom: 6,
    }

    return (
        <>
            <Head>
                <title>{getTitleString(country)}</title>
            </Head>
            <Layout mapData={mapData}>
                <Link href={'/'}>
                    <a>&larr; Show all nude places</a>
                </Link>
                <h1>
                    {country.name}
                </h1>
                {regions.map((region) => (
                    <div key={region}>
                        <h2>{region}</h2>
                        <ul>
                            {locationsByRegion[region].map((location) => (
                                <li key={location.UUID}>
                                    <Link href={buildLocationUrl(location, country)}>
                                        <a>{location.title}</a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </Layout>
        </>
    )
}

export async function getStaticProps({ params }) {

    let db = await initFirebase()

    let countryData = db.collection('countries').where('urlName', '==', params.country).limit(1).get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    }).catch((error) => {
        console.log("Error getting country data: ", error);
    });
    const country = await countryData

    let locationsData = db.collection('locations')
        .where('country', '==', country[0].isoCode)
        .where('region', '!=', null)
        .orderBy('region')
        .orderBy('title')
        .limit(20)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData
    const regions = [];
    const locationsByRegion = {};

    locations.map((location) => {
        if (!locationsByRegion[location.region]) {
            regions.push(location.region);
            locationsByRegion[location.region] = [];
        }

        locationsByRegion[location.region].push(location);
    })

    return {
        props: {
            country: country ? country[0] : {},
            regions: regions ?? [],
            locationsByRegion: locationsByRegion ?? {},
            allLocations: locations ?? {}
        }
    }
}


export async function getStaticPaths() {
    let db = await initFirebase()
    let data = db.collection('countries').get().then((snapshot) => {
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
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.region)}/${encodeURIComponent(location.seoName)}`;
}
