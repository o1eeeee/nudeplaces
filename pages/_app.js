import App from 'next/app'
import { fetchAboutData } from '../lib/firebase'
import '../styles/globals.css'
import '../styles/fonts/nudeplaces/style.css'

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    let about = {};

    if (process.env.NODE_ENV === 'development') {
      about = {
        "name": "Max Mustermann",
        "street": "Musterstr. 1",
        "city": "D-12345 Musterstadt",
        "email": "max@mustermann.de",
        "websiteUrl": "https://mustermann.de"
      }
    } else {
      about = await fetchAboutData();
    }

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



