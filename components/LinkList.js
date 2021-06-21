import Link from 'next/link';
import styles from '../styles/components/LinkList.module.css';

const LinkList = ({ listItems }) => {

    return (
        <ul className={styles.linkList}>
            {listItems.map((item, index) => (
                <li key={index}>
                    {item.external ? (
                        <a target="_blank" href={item.href} rel="noopener noreferrer nofollow">&#8618; {item.text ?? item.href}</a>
                    ) : (
                        <Link href={item.href}>
                            <a>{item.text ?? item.href}</a>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default LinkList;