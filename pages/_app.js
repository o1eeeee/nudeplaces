import dynamic from 'next/dynamic';
import Router, { useRouter } from 'next/router';
import { MapProvider } from '../context/MapProvider';
import LoaderContainer from '../components/LoaderContainer';
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

Router.onRouteChangeStart = () => {
  NProgress.start()
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};

const Map = dynamic(
  () => import('../components/Map'),
  {
    // eslint-disable-next-line react/display-name
    loading: () => <LoaderContainer />,
    ssr: false
  }
);


function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const showMap = !(['/', '/about'].includes(router.pathname));
  return (
    <MapProvider>
      <div className={"appWrapper"}>
        <Component {...pageProps} />
        {showMap && <Map />}
      </div>
    </MapProvider>
  )
}

export default MyApp
