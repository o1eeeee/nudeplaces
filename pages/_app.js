import Router from 'next/router';
import { MapProvider } from '../context/MapProvider';
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: true });

Router.onRouteChangeStart = (url) => {
  if (url !== window.location.pathname) {
    window.routeTimeout = setTimeout(() =>
      window.location = url, 300);
      NProgress.start()
  }
};

Router.onRouteChangeComplete = () => {
  clearTimeout(window.routeTimeout);
  NProgress.done();
};

Router.onRouteChangeError = () => {
  clearTimeout(window.routeTimeout);
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
