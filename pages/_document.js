import Document, { Html, Head, Main, NextScript } from 'next/document'

class CustomDocument extends Document {
    render() {
        return (
            <Html xmlns="http://www.w3.org/1999/xhtml" lang="en" xmlLang="en">
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500&display=swap" rel="stylesheet" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default CustomDocument