import Link from 'next/link';
import styles from '../styles/components/LinkList.module.css';

const LinkList = ({ listItems }) => {

    return (
        <ul className={styles.linkList}>
            {listItems.map((item, index) => (
                <li key={index}>
                    <Link href={item.href}>
                        <a>{item.text}</a>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default LinkList;