import { config } from '../lib/config';
import { buildLocationInfo, buildLocationStreetAndHouseNr, buildLocationPostcodeAndMunicipality, buildLocationRegionAndCountry, buildLocationLastUpdatedDate } from '../lib/locations';
import LinkList from '../components/LinkList';
import styles from '../styles/components/LocationInfoList.module.css';
import { useLanguageContext } from '../context/LanguageProvider';

export default function LocationInfoList({ location, country }) {
    const { dictionary } = useLanguageContext();
    const locationInfo = buildLocationInfo(location.attributes);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(location.attributes);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(location.attributes);
    const locationRegionAndCountry = buildLocationRegionAndCountry(location.attributes?.region, country);

    const lat = encodeURIComponent(location.attributes.latitude);
    const lng = encodeURIComponent(location.attributes.longitude);
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
            href: location.attributes.url,
            external: true,
        })
    }

    return (
        <dl className={styles.locationInfoList}>
            <dt>{dictionary("locationInfoListLabel")}</dt>
            <dd>
                <div>
                    {locationInfo && <p>{locationInfo}</p>}
                    {location.attributes.street && <p>{locationStreetAndHouseNr}</p>}
                    {location.attributes.postcode && <p>{locationPostcodeAndMunicipality}</p>}
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
            <dd><p>{buildLocationLastUpdatedDate(location.attributes)}</p></dd>
        </dl>
    )
}