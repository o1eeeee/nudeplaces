import styles from '../styles/components/LoaderContainer.module.css';
import Loader from './Loader';

export default function LoaderContainer() {
    return (
        <div className={styles.loaderContainer}>
            <Loader />
        </div>
    )
}