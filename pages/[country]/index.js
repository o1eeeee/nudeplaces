import Head from 'next/head'
import dynamic from 'next/dynamic';
import initFirebase from '../../lib/firebase';

export default function LocationsIndex({ country, locations }) {
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
                <Map mapPosition={[country.latitude, country.longitude]} markerPositions={buildCountryMarkerPositions(locations)} zoom={6}></Map>
                {/*countries.map((country) => {
                    let countryLocations = locations[country.isoCode]['locations'];
                    return (
                        <>
                            <h2 key={country.isoCode}>{country.name}</h2>
                            <ul>
                                {countryLocations && countryLocations.map((location) => (
                                    <li key={location.UUID}>{location.title}</li>
                                ))}
                            </ul>
                        </>
                    )
                }
            )*/}
            <ul>
                {locations.map((location) => (
                    <li key={location.UUID}>{location.title}</li>
                ))}
            </ul>
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

    /*let countriesData = db.collection('countries').orderBy('name').limit(5).get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    })
        .catch((error) => {
            console.log("Error getting country data: ", error);
        });

    const countries = await countriesData
    const countriesByIsoCode = {};
    countries.map((country) => {
        countriesByIsoCode[country.isoCode] = country
    })

    let locationsData = db.collection('locations').orderBy('country').orderBy('title').limit(10).get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const unsortedLocations = await locationsData
    unsortedLocations.map((location) => {
        if (!countriesByIsoCode[location.country]["locations"]) {
            countriesByIsoCode[location.country]["locations"] = []
        }
        countriesByIsoCode[location.country]["locations"].push(location)
    })

    const locations = countriesByIsoCode;*/

    return {
        props: {
            country: country ? country[0] : {},
            locations: locations ?? {}
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


function buildCountryMarkerPositions(locations) {
    const markerPositions = [];

    {locations.map((location) => {
        markerPositions.push({
            latitude: location.latitude,
            longitude: location.longitude,
            title: location.title,
            text: location.text,
            url: `/${location.country}/${location.region}/${location.seoName}`
        })
    })}

    return markerPositions;
}
