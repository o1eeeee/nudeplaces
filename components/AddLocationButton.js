import Link from 'next/link';
import styles from '../styles/components/AddLocationButton.module.css';

export default function AddLocationButton() {
    return (
        <Link href={'/add'}>
            <a className={styles.addButton}><span className="icon-location"></span></a>
        </Link>
    )
}