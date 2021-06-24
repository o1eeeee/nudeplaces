import Router from 'next/router';
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: true });

Router.onRouteChangeStart = () => {
  //console.log('onRouteChangeStart triggered');
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  //console.log('onRouteChangeComplete triggered');
  NProgress.done();
};

Router.onRouteChangeError = () => {
  //console.log('onRouteChangeError triggered');
  NProgress.done();
};


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
