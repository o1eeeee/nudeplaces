import { useEffect } from 'react';
import Head from 'next/head';
import initFirebase from '../../lib/firebase';
import { getCountries } from '../../lib/countries';
import { config } from '../../lib/config';
import { buildLocationUrl, buildLocationInfo, buildLocationRegionAndCountry } from '../../lib/locations';
import Layout from '../../components/Layout';
import { useMapContext } from '../../context/MapProvider';
import LocationInfoList from '../../components/LocationInfoList';
import CopyToClipboardButton from '../../components/CopyToClipboardButton';
import ReportLocationButton from '../../components/ReportLocationButton';
import styles from '../../styles/Location.module.css';

export default function Location({ location, country }) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();

    useEffect(() => {
        setMapPosition({
            latitude: location.latitude,
            longitude: location.longitude
        });
        setMarkerPositions([{
            latitude: location.latitude,
            longitude: location.longitude
        }]);
        setZoom(config.MAP_DEFAULT_ZOOM_LOCATION);
    }, [location]);

    return (
        <>
            <Head>
                <title>{getTitleString(location, country)}</title>
                <meta name="description" content={`${location.title} – Find nudist, naturist and clothing optional places, beaches, resorts and camps in ${country.name}.`} />
                <meta name="og:description" content={`${location.title} – Find nudist, naturist and clothing optional places, beaches, resorts and camps in ${country.name}.`} key="og-description" />
            </Head>
            <Layout>
                <h1>
                    {location.title}
                </h1>
                <p className={styles.locationDescription}>{location.text}</p>
                <p className={styles.disclaimer}>
                    <span className="icon-info"></span>
                    <span className={styles.disclaimerText}>Please note that we cannot guarantee the information to be correct and up-to-date.
                        Make sure to confirm it before planning your trip.
                        You can help us by reporting any incorrect or outdated information.</span>
                </p>                
                <LocationInfoList location={location} country={country} />
                <div className={styles.buttonsContainer}>
                    <CopyToClipboardButton value={`${process.env.WEBSITE_URL}${buildLocationUrl(location, country)}`} />
                    <ReportLocationButton locationData={getReportLocationData(location, country)} />
                </div>       
            </Layout>
        </>
    )
}


export async function getStaticProps({ params }) {
    if (process.env.NODE_ENV === 'development') {
        if (config.ENABLE_DEV_MODE) {
            const props = require('../../dev/locations/staticProps.json');
            return props;
        }
    }

    let db = await initFirebase()

    // Location
    let locationData = db.collection('locations')
        .where('seoName', '==', params.location)
        .limit(1)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
            return { notFound: true }
        });
    const location = await locationData
    if (!location[0] || location[0].isPublished === false) {
        return { notFound: true }
    }

    // Country
    const countries = getCountries();
    const country = countries.filter((country) => (country.urlName === params.country) && (country.isoCode === location[0].country));
    if (!country[0]) {
        return { notFound: true }
    }

    return {
        revalidate: 86400,
        props: {
            location: location[0],
            country: country[0]
        }
    }
}


export async function getStaticPaths() {
    if (process.env.NODE_ENV === 'development') {
        if (config.ENABLE_DEV_MODE) {
            const paths = require('../../dev/locations/staticPaths.json');
            return paths;
        }
    }

    let db = await initFirebase()

    // Fetch locations for Germany to be statically generated
    let locationsData = db.collection('locations')
        .where('country', "==", config.COUNTRY_CODE_GERMANY)
        .where('seoName', "!=", null)
        .limit(config.FETCH_LOCATIONS_LIMIT)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting location data: ", error);
        });

    const locations = await locationsData

    const publishedLocations = locations.filter((location) => location.isPublished != false);

    const paths = publishedLocations.map((location) => ({
        params: {
            country: config.SEO_NAME_GERMANY,
            location: location.seoName,
        }
    }))

    return {
        paths,
        // enable SSR for locations that haven't been generated
        fallback: 'blocking',
    }
}


function getTitleString(location, country) {
    const titleString = [];
    titleString.push(location.title);
    titleString.push(buildLocationInfo(location) + ", " + buildLocationRegionAndCountry(location, country))
    titleString.push(`Nudist, Naturist, Clothing Optional Places and Beaches in ${country.name}`);
    titleString.push("nudeplaces");
    return titleString.join(" – ")
}

function getReportLocationData(location, country) {
    const url = `${process.env.WEBSITE_URL}/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.seoName)}`
    return {
        title: location.title,
        country: country.name,
        url: url
    }
}
