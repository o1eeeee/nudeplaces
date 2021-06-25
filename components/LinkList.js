import Link from 'next/link';
import styles from '../styles/components/LinkList.module.css';

export default function LinkList({ listItems }) {
    return (
        <ul className={styles.linkList}>
            {listItems.map((item, index) => (
                <li key={index}>
                    {item.external ? (
                        <a target="_blank" href={item.href} rel="noopener noreferrer nofollow">
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