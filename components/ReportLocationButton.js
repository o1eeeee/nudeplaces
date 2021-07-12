import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/ReportLocationButton.module.css';

export default function ReportLocationButton({ locationData }) {
    const { dictionary } = useLanguageContext();
    const email = process.env.WEBSITE_EMAIL;
    const subject = `${dictionary("reportLocationMailSubject")} ${locationData.title}, ${locationData.country}`;
    const privacyStatement = dictionary("reportLocationMailPrivacy");
    const body = `${privacyStatement}%0D%0A%0D%0A${locationData.url}%0D%0A%0D%0A${dictionary("reportLocationMailText")}%0D%0A%0D%0A`;

    return (
        <a className={styles.reportLocationButton} href={`mailto:${email}?subject=${subject}&body=${body}`} rel="noreferrer noopener nofollow">
            <span className="icon-report"></span> {dictionary("reportLocationButtonText")}
        </a>
    )
}