import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import initFirebase from '../../../lib/firebase';

export default function LocationsDetail({ location }) {
    const locationInfo = buildLocationInfo(location);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(location);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(location);

    const Map = dynamic(
        () => import('../../../components/Map'),
        {
            loading: () => <p>Map is loading...</p>,
            ssr: false
        }
    );

    return (
        <div>
            <Head>
                <title>{getTitleString(location)}</title>
            </Head>

            <main>
                <Link href={`/${location.country}`}>
                    <a>&larr; Show all nude places in {location.country}</a>
                </Link>
                <h1>
                    {location.title}
                </h1>
                <p>{location.text}</p>
                <dl>
                    <dt>Location info</dt>
                    <dd>
                        {locationInfo}
                        {locationInfo && locationStreetAndHouseNr && <br />}
                        {locationStreetAndHouseNr}
                        {(locationInfo || locationStreetAndHouseNr) && location.postcode && <br />}
                        {location.postcode && locationPostcodeAndMunicipality}
                    </dd>
                    <dt>Position</dt>
                    <dd>{location.latitude}<br />{location.longitude}</dd>
                    <dt>Last updated</dt>
                    <dd>{buildLocationLastUpdatedDate(location)}</dd>
                </dl>
                <Map mapPosition={[location.latitude, location.longitude]} zoom={15}></Map>
            </main>
        </div>
    )
}


export async function getStaticProps({ params }) {

    let db = await initFirebase()

    let locationData = db.collection('locations')
        .where('seoName', '==', params.location)
        .where('region', '==', params.region)
        .limit(1)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const location = await locationData

    return {
        props: {
            location: location ? location[0] : {}
        }
    }
}


export async function getStaticPaths() {
    return {
        paths: [
            {
                params: {
                    country: 'DE',
                    region: 'BB',
                    location: 'felixsee__bohsdorf-felixsee'
                }
            },
        ],
        fallback: false,
    }
}


function getTitleString(location) {
    const titleString = [];
    titleString.push(location.title);
    titleString.push(buildLocationInfo(location) + ", " + buildLocationRegionAndCountry(location))
    titleString.push("Nudist, Naturist, Clothing Optional Places and Beaches");
    titleString.push("nudeplaces");
    return titleString.join(" – ")
}



function buildLocationRegionAndCountry(location) {
    const regionAndCountry = [];
    location.region && regionAndCountry.push(location.region);
    location.country && regionAndCountry.push(location.country);
    return regionAndCountry.join(", ");
}


function buildLocationInfo(location) {
    const locationInfo = [];
    location.neighbourhood && locationInfo.push(location.neighbourhood);
    location.municipality && locationInfo.push(location.municipality);
    location.subregion && locationInfo.push(location.subregion);
    location.region && locationInfo.push(location.region);
    return locationInfo.join(", ");
}



function buildLocationStreetAndHouseNr(location) {
    const streetAndHouseNr = [];
    location.street && streetAndHouseNr.push(location.street);
    location.housenumber && streetAndHouseNr.push(location.housenumber);
    return streetAndHouseNr.join(" ");
}


function buildLocationPostcodeAndMunicipality(location) {
    const postcodeAndMunicipality = [];
    location.postcode && postcodeAndMunicipality.push(location.postcode);
    location.municipality && postcodeAndMunicipality.push(location.municipality);
    return postcodeAndMunicipality.join(" ");
}


function buildLocationLastUpdatedDate(location) {
    const date = new Date(location.modifyDate);
    return date.toLocaleDateString('de-DE', { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit" 
    });
}
