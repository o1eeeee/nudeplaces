import { zoom, buildLocationInfo, buildLocationStreetAndHouseNr, buildLocationPostcodeAndMunicipality, buildLocationRegionAndCountry, buildLocationLastUpdatedDate } from '../lib/locations';
import LinkList from '../components/LinkList';
import styles from '../styles/components/LocationInfoList.module.css';

export default function LocationInfoList({ location, country }) {
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

    return (
        <dl className={styles.locationInfoList}>
            <dt>Location Info</dt>
            <dd>
                <div>
                    {locationInfo && <p>{locationInfo}</p>}
                    {location.street && <p>{locationStreetAndHouseNr}</p>}
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
}