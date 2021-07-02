import { useEffect } from 'react';
import Head from 'next/head';
import initFirebase from '../../lib/firebase';
import { getCountries } from '../../lib/countries';
import { zoom, buildLocationInfo, buildLocationRegionAndCountry } from '../../lib/locations';
import Layout from '../../components/Layout';
import { useMapContext } from '../../context/MapProvider';
import LocationInfoList from '../../components/LocationInfoList';
import ReportLocationButton from '../../components/ReportLocationButton';
import styles from '../../styles/Location.module.css';

export default function Location({ location, country }) {
    const { setMapPosition, setMarkerPositions, setZoom } = useMapContext();

    useEffect(() => {
        setMapPosition([location.latitude, location.longitude]);
        setMarkerPositions([{
            latitude: location.latitude,
            longitude: location.longitude
        }]);
        setZoom(zoom);
    }, [location]);

    return (
        <>
            <Head>
                <title>{getTitleString(location, country)}</title>
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
                <ReportLocationButton locationData={getReportLocationData(location, country)} />
            </Layout>
        </>
    )
}


export async function getStaticProps({ params }) {
    if (process.env.NODE_ENV === 'development') {
        const props = require('../../dev/locations/staticProps.json');
        return props;
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
        const paths = require('../../dev/locations/staticPaths.json');
        return paths;
    }

    const limit = process.env.NODE_ENV === 'development' ? 20 : 2000;

    let db = await initFirebase()

    // Fetch locations for Germany to be statically generated
    let locationsData = db.collection('locations')
        .where('country', "==", "DE")
        .where('seoName', "!=", null)
        .limit(limit)
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
            country: "germany",
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
    titleString.push(buildLocationInfo(location) + ", " + buildLocationRegionAndCountry(location))
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
