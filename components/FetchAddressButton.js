import { useEffect, useState } from 'react';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/FetchAddressButton.module.css';

export default function FetchAddressButton({ handleFetchAddress }) {
    const { dictionary } = useLanguageContext();
    const [wasClicked, setWasClicked] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setWasClicked(false), 3000);
        return () => {
            clearTimeout(timer)
        }
    }, [wasClicked])

    return (
        <button className={wasClicked ? styles.fetchAddressButtonClicked : styles.fetchAddressButton} onClick={((e) => { handleFetchAddress(e); setWasClicked(true) })} >
            {wasClicked ? <><span className="icon-check-circle"></span> {dictionary("fetchedAddress")}</> : <><span className="icon-location"></span> {dictionary("fetchAddress")}</>}
        </button>
    )
}