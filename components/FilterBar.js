import React, { useEffect, useRef } from 'react';
import LocationTypeFilterButton from './LocationTypeFilterButton';
import getLocationTypes from '../lib/locationTypes';
import styles from '../styles/components/FilterBar.module.css'
import { register } from 'swiper/element/bundle';

function FilterBar({ locationTypeFilter, setLocationTypeFilter }) {
    const swiperRef = useRef(null);
    const locationTypes = getLocationTypes();

    useEffect(() => {
        register();
        swiperRef.current.initialize();
    }, []);

    return (
        <div className={styles.filterBar}>
            <swiper-container slides-per-view="auto" space-between="18" init="false" ref={swiperRef}>
                {locationTypes.map((type, index) => {
                    if (type == "_undefined_") {
                        return null
                    }
                    return (
                        <swiper-slide key={type}>
                            <LocationTypeFilterButton filter={locationTypeFilter} setFilter={setLocationTypeFilter} type={type} />
                        </swiper-slide>
                    )
                })}
            </swiper-container>
        </div>
    )
}

export default React.memo(FilterBar);