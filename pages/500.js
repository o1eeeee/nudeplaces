import Layout from "../components/Layout"
import { useLanguageContext } from "../context/LanguageProvider"

export default function Custom500() {
    const { dictionary } = useLanguageContext();

    return (
        <Layout>
            <h1>{dictionary("500pageTitle")}</h1>
            <p>{dictionary("500pageText")}</p>
        </Layout>
    )
}