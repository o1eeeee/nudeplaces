import { useState, useEffect } from 'react';

export default function LocationTypeFilter({ type, filter, setFilter }) {
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
        <button type="button" onClick={handleClick}>{isActive && "X"} <span className={`icon-${type.value}`}></span> {type.label}</button>
    )
}