import styles from '../styles/components/Loader.module.css';

export default function LoaderInline() {
    return (
        <span className={styles.loader} style={{ fontSize: '3px' }}></span>
    )
}