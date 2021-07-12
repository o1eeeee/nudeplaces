import Link from 'next/link';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/AboutLink.module.css';

export default function AboutLink() {
    const { dictionary } = useLanguageContext();

    return (
        <Link href={'/about'}>
            <a className={styles.aboutLink}>{dictionary("about")}</a>
        </Link>
    )
}

