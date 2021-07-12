import Layout from "../components/Layout"
import { useLanguageContext } from "../context/LanguageProvider";

export default function Custom404() {
    const { dictionary } = useLanguageContext();

    return (
        <Layout>
            <h1>{dictionary("404pageTitle")}</h1>
            <p>{dictionary("404pageText")}</p>
        </Layout>
    )
}