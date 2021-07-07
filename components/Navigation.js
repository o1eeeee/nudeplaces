import CountrySelect from './CountrySelect';
import { getCountries } from '../lib/countries';
import styles from '../styles/components/Navigation.module.css';
import { useRouter } from 'next/router';

export default function Navigation() {
    const router = useRouter();
    const countries = getCountries();
    return (
        <div className={styles.navigation}>
            <button type="button" className={styles.backButton} onClick={() => router.back()}>
                <span className={"icon-arrow-left"}></span>
            </button>
            <CountrySelect countries={countries} />
        </div>
    )
}


