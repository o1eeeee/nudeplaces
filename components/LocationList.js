import Link from 'next/link';
import { buildLocationInfo } from '../lib/locations';
import styles from '../styles/components/LocationList.module.css';

export default function LocationList({ country, locations }) {
    let locationInfo;
    return (
        <ul className={styles.locationList}>
            {locations.map((location, index) => {
                locationInfo = buildLocationInfo(location);
                return (
                    <li key={location.id}>
                        <Link href={`/${country.urlName}/${location.seoName}`}>
                            <a>
                                <span className={`icon-${location.type}`}></span>
                                <div>
                                    <span className={styles.locationListTitle}>{location.title}</span>
                                    {locationInfo && (<span className={styles.locationListSubtitle}><span className="icon-location"></span> {locationInfo}</span>)}
                                </div>

                            </a>
                        </Link>
                    </li>);
            })}
        </ul>
    )
}