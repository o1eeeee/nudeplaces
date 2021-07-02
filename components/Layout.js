import Navigation from './Navigation';
import ContentWrapper from './ContentWrapper';
import AboutLink from './AboutLink';
import styles from '../styles/components/Layout.module.css';

export default function Layout({ children }) {

    return (
        <>
            <Navigation />
            <main className={styles.main}>
                <ContentWrapper>
                    {children}
                    <div className={styles.aboutLinkContainer}>
                        <AboutLink />
                    </div>
                </ContentWrapper>
            </main>
        </>
    )
}