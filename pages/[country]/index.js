import Head from 'next/head';
import Link from 'next/link'
import dynamic from 'next/dynamic';
import initFirebase from '../../lib/firebase';

export default function LocationsIndex({ country, regions, locationsByRegion, allLocations }) {
    const Map = dynamic(
        () => import('../../components/Map'),
        {
            loading: () => <p>Map is loading...</p>,
            ssr: false
        }
    );

    return (
        <div>
            <Head>
                <title>{getTitleString(country)}</title>
            </Head>

            <main>
                <h1>
                    {country.name}
                </h1>
                <Map mapPosition={[country.latitude, country.longitude]} markerPositions={buildCountryLocationsMarkerPositions(allLocations)} zoom={6}></Map>
                {regions.map((region) => (
                    <>
                        <h2>{region}</h2>
                        <ul key={region}>
                            {locationsByRegion[region].map((location) => (
                                <li key={location.UUID}>
                                    <Link href={buildLocationUrl(location)}>
                                        <a>{location.title}</a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                ))}
            </main>
        </div>
    )
}

export async function getStaticProps({ params }) {

    let db = await initFirebase()

    let countryData = db.collection('countries').where('isoCode', '==', params.country).limit(1).get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    }).catch((error) => {
        console.log("Error getting country data: ", error);
    });
    const country = await countryData

    let locationsData = db.collection('locations')
        .where('country', '==', params.country)
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
    return {
        paths: [
            { params: { country: 'DE' } },
        ],
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

    {
        locations.map((location) => {
            markerPositions.push({
                latitude: location.latitude,
                longitude: location.longitude,
                title: location.title,
                text: location.text,
                url: buildLocationUrl(location)
            })
        })
    }

    return markerPositions;
}


function buildLocationUrl(location) {
    return `/${location.country}/${location.region}/${location.seoName}`;
}
