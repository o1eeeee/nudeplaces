import styles from '../styles/components/ContentWrapper.module.css';

export default function ContentWrapper({ children }) {
    return (
        <div className={styles.contentWrapper}>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}