import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LinkList from '../components/LinkList';
import { getCountries, detectCountryFromLanguage } from '../lib/countries';
import styles from '../styles/Home.module.css';
import AboutLink from '../components/AboutLink';

export default function Home() {
  const router = useRouter();
  const countries = getCountries();

  useEffect(() => {
    const lang = navigator.language.toLowerCase();
    const country = detectCountryFromLanguage(lang);
    country && router.push(`/${country}`);
  }, []);


  return (
    <>
      <Head>
        <title>{getTitleString()}</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.welcome}>
        <div className={styles.loaderIconWrapper}>
          <div className={styles.loader}></div>
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
    </>
  )
}



function getTitleString() {
  const titleString = [];
  titleString.push(`Nudist, Naturist, Clothing Optional Places and Beaches worldwide`);
  titleString.push("nudeplaces");
  return titleString.join(" – ")
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