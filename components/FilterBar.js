import LocationTypeFilterButton from './LocationTypeFilterButton';
import getLocationTypes from '../lib/locationTypes';
import styles from '../styles/components/FilterBar.module.css'
import { useEffect, useRef } from 'react';


function FilterBar({ locationTypeFilter, setLocationTypeFilter }) {
    const locationTypes = getLocationTypes();
    const ref = useRef(null);
    let startX;
    let scrollLeft;

    useEffect(() => {
        ref.current.addEventListener('mousedown', start);
        ref.current.addEventListener('touchstart', start);

        ref.current.addEventListener('mousemove', move);
        ref.current.addEventListener('touchmove', move);

        ref.current.addEventListener('mouseleave', end);
        ref.current.addEventListener('mouseup', end);
        ref.current.addEventListener('touchend', end);

        return () => {
            if (ref.current) {
                ref.current.removeEventListener('mousedown', start);
                ref.current.removeEventListener('touchstart', start);

                ref.current.removeEventListener('mousemove', move);
                ref.current.removeEventListener('touchmove', move);

                ref.current.removeEventListener('mouseleave', end);
                ref.current.removeEventListener('mouseup', end);
                ref.current.removeEventListener('touchend', end);
            }
        };
    }, [])

    function start(e) {
        ref.current.classList.add('active');
        startX = e.pageX || e.touches[0].pageX - ref.current.offsetLeft;
        scrollLeft = ref.current.scrollLeft;
    }

    function move(e) {
        if (!ref.current.classList.contains('active')) return;
        e.preventDefault();
        const x = e.pageX || e.touches[0].pageX - ref.current.offsetLeft;
        const dist = (x - startX);
        ref.current.scrollLeft = scrollLeft - dist;
    }

    function end() {
        ref.current.classList.remove('active');
    }

    return (
        <div className={styles.filterBar} ref={ref}>
            <ul>
                {locationTypes.map((type, index) => {
                    if (type == "_undefined_") {
                        return null
                    }
                    return (
                        <li key={type}>
                            <LocationTypeFilterButton filter={locationTypeFilter} setFilter={setLocationTypeFilter} type={type} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default FilterBar;