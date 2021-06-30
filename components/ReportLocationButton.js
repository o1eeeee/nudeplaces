import styles from '../styles/components/ReportLocationButton.module.css';

export default function ReportLocationButton({ locationData }) {
    const email = process.env.WEBSITE_EMAIL;
    const subject = `Report Location: ${locationData.title}, ${locationData.country}`;
    const privacyStatement = "By sending this email, you agree that the data you provide is processed in order to solve the issue. All data will be deleted after the issue was solved.";
    const body = `${privacyStatement}%0D%0A%0D%0A${locationData.url}%0D%0A%0D%0APlease specify the issue below:%0D%0A%0D%0A`;

    return (
        <a className={styles.reportLocationButton} href={`mailto:${email}?subject=${subject}&body=${body}`} rel="noreferrer noopener nofollow">
            <span className="icon-report"></span> Report As Inappropriate
        </a>
    )
}