import { config } from '../lib/config';
import { buildLocationInfo, buildLocationStreetAndHouseNr, buildLocationPostcodeAndMunicipality, buildLocationRegionAndCountry, buildLocationLastUpdatedDate } from '../lib/locations';
import LinkList from '../components/LinkList';
import styles from '../styles/components/LocationInfoList.module.css';
import { useLanguageContext } from '../context/LanguageProvider';

export default function LocationInfoList({ location, country }) {
    const { dictionary } = useLanguageContext();
    const locationInfo = buildLocationInfo(location);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(location);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(location);
    const locationRegionAndCountry = buildLocationRegionAndCountry(location, country);

    const lat = encodeURIComponent(location.latitude);
    const lng = encodeURIComponent(location.longitude);
    const mapLinks = [
        {
            href: `https://maps.google.com?q=${lat},${lng}`,
            text: "Google Maps",
            external: true,
        },
        {
            href: `https://www.openstreetmap.org/index.html?mlat=${lat}&mlon=${lng}&zoom=${config.MAP_DEFAULT_ZOOM_LOCATION}`,
            text: "OpenStreetMap",
            external: true,
        },
        {
            href: `https://www.komoot.de/plan/@${lat},${lng},${config.MAP_DEFAULT_ZOOM_LOCATION}z`,
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

    return (
        <dl className={styles.locationInfoList}>
            <dt>{dictionary("locationInfoListLabel")}</dt>
            <dd>
                <div>
                    {locationInfo && <p>{locationInfo}</p>}
                    {location.street && <p>{locationStreetAndHouseNr}</p>}
                    {location.postcode && <p>{locationPostcodeAndMunicipality}</p>}
                    <p>{locationRegionAndCountry}</p>
                </div>
            </dd>
            <dt>{dictionary("locationInfoListShowOnMap")}</dt>
            <dd>
                <LinkList listItems={mapLinks} />
            </dd>
            {(websiteLinks.length > 0) && (
                <>
                    <dt>{dictionary("locationInfoListWebsite")}</dt>
                    <dd><LinkList listItems={websiteLinks} /></dd>
                </>
            )}
            <dt>{dictionary("locationInfoListLastUpdated")}</dt>
            <dd><p>{buildLocationLastUpdatedDate(location)}</p></dd>
        </dl>
    )
}