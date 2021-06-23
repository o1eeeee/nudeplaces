import App from 'next/app'
import { fetchAboutData } from '../lib/firebase'
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    let about = {};
    // Make any initial calls we need to fetch data required for SSR
    if (process.env.NODE_ENV === 'development') {
      console.log(process.env.NODE_ENV)
      about = [
        require('../dev/about.json')
      ];
    } else {
      about = await fetchAboutData();
    }

    // Load the page getInitiaProps
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ about, ...ctx });
    }

    return { pageProps: { ...pageProps, about: about[0] } };
  }

  render() {
    const { Component } = this.props;

    return (
      <Component {...this.props.pageProps} />
    )
  }
}

export default MyApp



