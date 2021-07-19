import Link from 'next/link';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/AddLocationButton.module.css';

export default function AddLocationButton() {
    const { dictionary } = useLanguageContext();
    return (
        <Link href={'/add'}>
            <a className={styles.addButton}><span className="icon-location"></span><span className={styles.addButtonText}>{dictionary("addLocationButtonText")}</span></a>
        </Link>
    )
}