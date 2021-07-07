import { useEffect, useState } from 'react';
import styles from '../styles/components/CopyToClipboardButton.module.css';

export default function CopyToClipboardButton({ value }) {
    const [wasClicked, setWasClicked] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setWasClicked(false), 3000);
        return () => {
            clearTimeout(timer)
        }
    }, [wasClicked])

    return (
        <button className={wasClicked ? styles.copyToClipboardButtonClicked : styles.copyToClipboardButton} onClick={(() => { navigator.clipboard.writeText(value); setWasClicked(true) })} >
            {wasClicked ? <><span className="icon-check-circle"></span> Copied!</> : <><span className="icon-copy"></span> Copy URL to Clipboard</>}
        </button>
    )
}