import Link from 'next/link';
import CountrySelect from './CountrySelect';
import { getCountries } from '../lib/countries';
import styles from '../styles/components/Navigation.module.css';

export default function Navigation({ backButtonHref }) {
    const countries = getCountries();
    return (
        <div className={styles.navigation}>
            {backButtonHref && (
                <Link href={backButtonHref}>
                    <a className={styles.backButton}>
                        &larr;
                    </a>
                </Link>
            )}
            <CountrySelect countries={countries} />
        </div>
    )
}


