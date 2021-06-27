import Link from 'next/link';
import styles from '../styles/components/AboutLink.module.css';

export default function AboutLink() {
    return (
        <Link href={'/about'}>
            <a className={styles.aboutLink}>About and Privacy</a>
        </Link>
    )
}

