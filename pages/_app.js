import Router from 'next/router';
import { MapProvider } from '../context/MapProvider';
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

Router.onRouteChangeStart = (url) => {
  NProgress.start()
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};


function MyApp({ Component, pageProps }) {
  return (
    <MapProvider>
      <Component {...pageProps} />
    </MapProvider>
  )
}

export default MyApp
