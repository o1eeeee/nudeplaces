import { useState, useEffect } from 'react';
import { useLanguageContext } from '../context/LanguageProvider';
import styles from '../styles/components/LocationTypeFilterButton.module.css';

export default function LocationTypeFilterButton({ type, filter, setFilter }) {
    const { dictionary } = useLanguageContext();
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        const newFilter = [...filter];
        const index = newFilter.indexOf(type.value);
        if ((index > -1) && !isActive) {
            newFilter.splice(index, 1);
        }
        if ((index === -1) && isActive) {
            newFilter.push(type.value);
        }
        setFilter(newFilter)
    }, [isActive])

    const handleClick = () => {
        setIsActive(!isActive);
    }

    return (
        <button className={styles.locationTypeFilterButton} type="button" onClick={handleClick}>
            <span className={`icon-${type}`}></span>
            {dictionary(`locationTypeFilter_${type}`)}
            <span className="icon-check-circle" style={{color: `${isActive ? '#2979ff' : '#ddd'}` }}></span>
        </button>
    )
}