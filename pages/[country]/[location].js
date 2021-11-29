import { useEffect } from 'react';
import Head from 'next/head';
import { getCountries, getCountry } from '../../lib/countries';
import { config } from '../../lib/config';
import { buildLocationUrl, buildLocationInfo, buildLocationRegionAndCountry } from '../../lib/locations';
import Layout from '../../components/Layout';
import { useMapContext } from '../../context/MapProvider';
import LocationInfoList from '../../components/LocationInfoList';
import CopyToClipboardButton from '../../components/CopyToClipboardButton';
import ReportLocationButton from '../../components/ReportLocationButton';
import styles from '../../styles/Location.module.css';
import { useLanguageContext } from '../../context/LanguageProvider';

export default function Location({ location, country }) {
    const { dictionary } = useLanguageContext();
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
                    <span className={styles.disclaimerText}>{dictionary("locationInfoDisclaimer")}</span>
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
    let location;
    try {
        const response = await fetch(`${config.FETCH_URL}/locations?seoName=${params.location}&_limit=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        location = data[0]
    } catch (error) {
        console.log("Error getting location data: ", error);
        return { notFound: true }
    }

    if (!location || (location.published_at === null && process.env.NODE_ENV !== 'development')) {
        return { notFound: true }
    }

    // Country
    const countries = getCountries();
    const country = countries.filter((country) => (country.urlName === params.country) && (country.isoCode === location.country));
    if (!country[0]) {
        return { notFound: true }
    }

    return {
        revalidate: 86400,
        props: {
            location: location,
            country: country[0]
        }
    }
}


export async function getStaticPaths() {
    let locations;
    try {
        const response = await fetch(`${config.FETCH_URL}/locations?_limit=5000`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        locations = await response.json()
    } catch (error) {
        console.log("Error getting location data: ", error);
    }

    const publishedLocations = locations.filter((location) => {
        if (process.env.NODE_ENV === 'development') {
            return true;
        } else {
            return location.published_at != null;
        }
    });

    const paths = publishedLocations.map((location) => {
        let country = getCountry(location.country)
        if (country) {
            return {
                params: {
                    country: country.urlName,
                    location: location.seoName,
                }
            }
        }
    })

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
