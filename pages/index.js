import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LinkList from '../components/LinkList';
import Loader from '../components/Loader';
import { getCountries, detectCountryFromLanguage } from '../lib/countries';
import styles from '../styles/Home.module.css';
import AboutLink from '../components/AboutLink';
import { config } from '../lib/config';

export default function Home() {  
  const router = useRouter();
  const countries = getCountries();

  useEffect(() => {
    const lang = navigator.language.toLowerCase();
    const country = detectCountryFromLanguage(lang);
    country && router.push(`/${country}`);
  }, []);

  return (
    <div className={styles.welcomeWrapper}>
      <div className={styles.welcome}>
        <div className={styles.loaderIconWrapper}>
          <Loader />
          <span className="icon-location"></span>
        </div>
        <h1>
          Nude Places
        </h1>
        <div className={styles.aboutLinkContainer}>
          <AboutLink />
        </div>
      </div>
      <div className={styles.belowFold}>
        <h2>Countries</h2>
        <LinkList listItems={getCountryListItems(countries)} />
      </div>
    </div>
  )
}






function buildCountryUrl(country) {
  return `/${encodeURIComponent(country.urlName)}`;
}



function getCountryListItems(countries) {
  const listItems = [];

  countries.map((country) => {
    listItems.push({
      href: buildCountryUrl(country),
      text: country.name,
    })
  })

  return listItems;
}