import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import initFirebase from '../lib/firebase';

export default function Home({ countries }) {
  const Map = dynamic(
    () => import('../components/Map'),
    {
      loading: () => <p>Map is loading...</p>,
      ssr: false
    }
  );

  return (
    <div>
      <Head>
        <title>nudeplaces</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>
          Nude Places
        </h1>
        <Map mapPosition={[51.165691, 10.451526]} markerPositions={buildCountryMarkerPositions(countries)} zoom={3}></Map>
        <ul>
          {countries.map((country) => (
            <li key={country.isoCode}>
              <Link href={buildCountryUrl(country)}>
                <a>{country.name}</a>
              </Link>
            </li>
          ))}
        </ul>

      </main>
    </div>
  )
}

export async function getStaticProps() {

  let db = await initFirebase()
  let data = db.collection('countries').get().then((snapshot) => {
    return snapshot.docs.map(doc => doc.data())
  })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });

  const countries = await data

  return {
    props: {
      countries: countries ?? {}
    }
  }
}



function buildCountryMarkerPositions(countries) {
  const markerPositions = [];

  countries.map((country) => {
    markerPositions.push({
      latitude: country.latitude,
      longitude: country.longitude,
      title: country.name,
      url: buildCountryUrl(country)
    })
  })

  return markerPositions;
}


function buildCountryUrl(country) {
  return `/${encodeURIComponent(country.isoCode)}`;
}
