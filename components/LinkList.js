import Link from 'next/link';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/LinkList.module.css';

export default function LinkList({ listItems }) {
    const { dictionary } = useLanguageContext();

    function handleClickExternalLink(e, href) {
        let el = e.currentTarget;
        let currentHref = el.getAttribute('href');
        if (!currentHref || currentHref != href) {
            e.preventDefault()
            let confirm = window.confirm(dictionary("externalLinkWarningText"));
            if (!confirm) {
                return;
            }
            el.setAttribute('href', href);
            el.click();
        }
    }

    return (
        <ul className={styles.linkList}>
            {listItems.map((item, index) => (
                <li key={index}>
                    {item.external ? (
                        <a onClick={(e) => handleClickExternalLink(e, item.href)} target="_blank" rel="noopener noreferrer nofollow">
                            {item.icon && <span className={`icon-${item.icon}`}></span>}
                            <span>{item.text ?? item.href}</span>
                        </a>
                    ) : (
                        <Link href={item.href}>
                            <a onClick={() => item.handleClick && item.handleClick(false)}>
                                {item.icon && <span className={`icon-${item.icon}`}></span>}
                                <span>{item.text ?? item.href}</span>
                            </a>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )
}