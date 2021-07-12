import { useEffect, useState } from 'react';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/CopyToClipboardButton.module.css';

export default function CopyToClipboardButton({ value }) {
    const { dictionary } = useLanguageContext();
    const [wasClicked, setWasClicked] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setWasClicked(false), 3000);
        return () => {
            clearTimeout(timer)
        }
    }, [wasClicked])

    return (
        <button className={wasClicked ? styles.copyToClipboardButtonClicked : styles.copyToClipboardButton} onClick={(() => { navigator.clipboard.writeText(value); setWasClicked(true) })} >
            {wasClicked ? <><span className="icon-check-circle"></span> {dictionary("copiedUrlToClipboard")}</> : <><span className="icon-copy"></span> {dictionary("copyUrlToClipboard")}</>}
        </button>
    )
}