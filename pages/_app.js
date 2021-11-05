import dynamic from 'next/dynamic';
import Router, { useRouter } from 'next/router';
import Head from 'next/head';
import { MapProvider } from '../context/MapProvider';
import LoaderContainer from '../components/LoaderContainer';
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'
import NProgress from 'nprogress';
import { LanguageProvider } from '../context/LanguageProvider';
import { useState } from 'react';
import { HistoryProvider } from '../context/HistoryProvider';

const Map = dynamic(
  () => import('../components/Map'),
  {
    // eslint-disable-next-line react/display-name
    loading: () => <LoaderContainer />,
    ssr: false
  }
);


export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [previousPath, setPreviousPath] = useState(null);

  NProgress.configure({ showSpinner: false });

  Router.onRouteChangeStart = () => {
    NProgress.start()
  };

  Router.onRouteChangeComplete = () => {
    NProgress.done();
    setPreviousPath(router.pathname)
  };

  Router.onRouteChangeError = () => {
    NProgress.done();
  };

  const showMap = !(['/', '/about'].includes(router.pathname));
  return (
    <>
      <Head>
        <title>{getTitleString()}</title>
        <meta name="description" content="Find nudist, naturist and clothing optional places, beaches, resorts and camps worldwide." />
        <meta name="og:description" content="Find nudist, naturist and clothing optional places, beaches, resorts and camps worldwide." key="og-description" />
        <meta name="og:image" content="/icons/icon-512x512.png" key="og-image" />
        <meta name="theme-color" content="#1de9b6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="manifest" href="manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icons/icon-72x72.png" type="image/png" sizes="72x72" />
        <link rel="icon" href="/icons/icon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/icons/icon-128x128.png" type="image/png" sizes="128x128" />
        <link rel="icon" href="/icons/icon-144x144.png" type="image/png" sizes="144x144" />
        <link rel="icon" href="/icons/icon-152x152.png" type="image/png" sizes="152x152" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-384x384.png" type="image/png" sizes="384x384" />
        <link rel="icon" href="/icons/icon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
        <link rel="apple-touch-startup-image" href="/icons/launch-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-750x1294.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-1242x2148.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/icons/launch-2048x2732.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
      </Head>
      <HistoryProvider previousPath={previousPath}>
        <LanguageProvider>
          <MapProvider>
            <div className={"appWrapper"}>
              <Component {...pageProps} />
              {showMap && <Map />}
            </div>
          </MapProvider>
        </LanguageProvider>
      </HistoryProvider>
    </>
  )
}

function getTitleString() {
  const titleString = [];
  titleString.push(`Nudist, Naturist, Clothing Optional Places and Beaches worldwide`);
  titleString.push("nudeplaces");
  return titleString.join(" – ")
}
