import Head from 'next/head';
import initFirebase from '../../../lib/firebase';
import Layout from '../../../components/Layout';
import LinkList from '../../../components/LinkList';
import styles from '../../../styles/LocationsDetail.module.css';

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

    const mapLinks = [
        {
            href: `https://maps.google.com?q=${lat},${lng}`,
            text: "Google Maps",
            external: true,
        },
        {
            href: `https://www.openstreetmap.org/index.html?mlat=${lat}&mlon=${lng}&zoom=${zoom}`,
            text: "OpenStreetMap",
            external: true,
        },
        {
            href: `https://www.komoot.de/plan/@${lat},${lng},${zoom}z`,
            text: "Komoot",
            external: true,
        }
    ]

    const websiteLinks = [];
    if (location.url) {
        websiteLinks.push({
            href: location.url,
            external: true,
        })
    }

    const locationInfo = buildLocationInfo(location);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(location);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(location);
    const locationRegionAndCountry = buildLocationRegionAndCountry(location, country);

    const LocationInfoList = () => (
        <dl className={styles.locationInfoList}>
            <dt>Location Info</dt>
            <dd>
                <div>
                    {locationInfo && <p>{locationInfo}</p>}
                    {locationStreetAndHouseNr && <p>{locationStreetAndHouseNr}</p>}
                    {location.postcode && <p>{locationPostcodeAndMunicipality}</p>}
                    <p>{locationRegionAndCountry}</p>
                </div>
            </dd>
            <dt>Show on Map</dt>
            <dd>
                <LinkList listItems={mapLinks} />
            </dd>
            {(websiteLinks.length > 0) && (
                <>
                    <dt>Website</dt>
                    <dd><LinkList listItems={websiteLinks} /></dd>
                </>
            )}
            <dt>Last updated</dt>
            <dd><p>{buildLocationLastUpdatedDate(location)}</p></dd>
        </dl>
    )
    LocationInfoList.displayName = 'LocationInfoList';

    return (
        <>
            <Head>
                <title>{getTitleString(location, country)}</title>
            </Head>
            <Layout mapData={mapData} backButtonData={backButtonData}>
                <h1>
                    {location.title}
                </h1>
                <p className={styles.locationDescription}>{location.text}</p>
                <LocationInfoList />
                <button className={styles.reportAsInappropriateButton}>Report As Inappropriate</button>
            </Layout>
        </>
    )
}


export async function getStaticProps({ params }) {
    if (process.env.NODE_ENV === 'development') {
        const props = require('../../../dev/locations/staticProps.json');
        return props;
    }

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
    if (process.env.NODE_ENV === 'development') {
        const paths = require('../../../dev/locations/staticPaths.json');
        return paths;
    }

    let db = await initFirebase()

    // Fetch countries
    let countriesData = db.collection('countries').get().then((snapshot) => {
        return snapshot.docs.map(doc => doc.data())
    }).catch((error) => {
        console.log("Error getting country data: ", error);
    });
    const countries = await countriesData

    // Countries by isoCode
    const countriesByIsoCode = [];
    countries.map((country) => {
        countriesByIsoCode[country.isoCode] = country;
    })

    // Fetch locations
    let locationsData = db.collection('locations')
        .where('region', '!=', null)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData

    // Filter out locations that don't have a seoName
    const filteredLocations = locations.filter(location => location.seoName != null)

    const paths = filteredLocations.map((location) => ({
        params: {
            country: countriesByIsoCode[location.country] ? (countriesByIsoCode[location.country]['urlName'] ?? "unknown") : "unknown",
            region: location.region,
            location: location.seoName,
        }
    }))

    return {
        paths,
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
