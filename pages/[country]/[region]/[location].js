import Head from 'next/head';
import initFirebase from '../../../lib/firebase';
import Layout from '../../../components/Layout';

export default function LocationsDetail({ location, country }) {
    const zoom = 15;
    const lat = encodeURIComponent(location.latitude);
    const lng = encodeURIComponent(location.longitude);
    const mapData = {
        mapPosition: [
            location.latitude,
            location.longitude
        ],
        zoom: zoom,
    }

    const backButtonData = {
        href: `/${encodeURIComponent(country.urlName)}`,
        text: country.name,
    }

    const locationInfo = buildLocationInfo(location);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(location);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(location);
    const locationRegionAndCountry = buildLocationRegionAndCountry(location, country);

    return (
        <>
            <Head>
                <title>{getTitleString(location, country)}</title>
            </Head>
            <Layout mapData={mapData} backButtonData={backButtonData}>
                <h1>
                    {location.title}
                </h1>
                <p>{location.text}</p>
                <dl>
                    <dt>Location Info</dt>
                    <dd>
                        {locationInfo}
                        {locationInfo && locationStreetAndHouseNr && <br />}
                        {locationStreetAndHouseNr}
                        {(locationInfo || locationStreetAndHouseNr) && location.postcode && <br />}
                        {location.postcode && locationPostcodeAndMunicipality}
                        {(locationInfo || locationStreetAndHouseNr || location.postcode) && <br />}
                        {locationRegionAndCountry}
                    </dd>
                    <dt>Show on Map</dt>
                    <dd>
                        <ul>
                            <li key="map0">
                                <a target="_blank" href={`https://maps.google.com?q=${lat},${lng}`} rel="noopener noreferrer nofollow">Google Maps</a>
                            </li>
                            <li key="map1">
                                <a target="_blank" href={`https://www.openstreetmap.org/index.html?mlat=${lat}&mlon=${lng}&zoom=${zoom}`} rel="noopener noreferrer nofollow">OpenStreetMap</a>
                            </li>
                            <li key="map2">
                                <a target="_blank" href={`https://www.komoot.de/plan/@${lat},${lng},${zoom}z`} rel="noopener noreferrer nofollow">Komoot</a>
                            </li>
                        </ul>
                    </dd>
                    <dt>Last updated</dt>
                    <dd>{buildLocationLastUpdatedDate(location)}</dd>
                </dl>
            </Layout>
        </>
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

    let countryData = db.collection('countries')
    .where('isoCode', '==', location[0].country)
    .limit(1)
    .get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    })
    .catch((error) => {
        console.log("Error getting country data: ", error)
    })

    const country = await countryData

    return {
        props: {
            location: location ? location[0] : {},
            country: country ? country[0] : {}
        }
    }
}


export async function getStaticPaths() {
    return {
        paths: [
            {
                params: {
                    country: 'germany',
                    region: 'BB',
                    location: 'felixsee__bohsdorf-felixsee'
                }
            },
        ],
        fallback: false,
    }
}


function getTitleString(location, country) {
    const titleString = [];
    titleString.push(location.title);
    titleString.push(buildLocationInfo(location) + ", " + buildLocationRegionAndCountry(location))
    titleString.push(`Nudist, Naturist, Clothing Optional Places and Beaches in ${country.name}`);
    titleString.push("nudeplaces");
    return titleString.join(" – ")
}



function buildLocationRegionAndCountry(location, country) {
    const regionAndCountry = [];
    location.region && regionAndCountry.push(location.region);
    country && regionAndCountry.push(country.name);
    return regionAndCountry.join(", ");
}


function buildLocationInfo(location) {
    const locationInfo = [];
    location.neighbourhood && locationInfo.push(location.neighbourhood);
    location.municipality && locationInfo.push(location.municipality);
    location.subregion && locationInfo.push(location.subregion);
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
