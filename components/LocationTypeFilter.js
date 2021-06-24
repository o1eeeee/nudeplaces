import { useState, useEffect } from 'react';

export default function LocationTypeFilter({ value, filter, setFilter }) {
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        const newFilter = [...filter];
        const index = newFilter.indexOf(value);
        if ((index > -1) && !isActive) {
            newFilter.splice(index, 1);
        }
        if ((index === -1) && isActive) {
            newFilter.push(value);
        }        
        setFilter(newFilter)
    }, [isActive])

    const handleClick = () => {
        setIsActive(!isActive);        
    }

    return (
        <button type="button" onClick={handleClick}>{isActive && "X"} {value}</button>
    )
}