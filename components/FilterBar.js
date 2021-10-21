import { Swiper, SwiperSlide } from 'swiper/react';
import LocationTypeFilterButton from './LocationTypeFilterButton';
import getLocationTypes from '../lib/locationTypes';
import styles from '../styles/components/FilterBar.module.css'
import "swiper/swiper.min.css";
import React from 'react';

function FilterBar({ locationTypeFilter, setLocationTypeFilter }) {
    const locationTypes = getLocationTypes();
    return (
        <div className={styles.filterBar}>
            <Swiper slidesPerView="auto" spaceBetween={18}>
                {locationTypes.map((type, index) => {
                    if (type == "_undefined_") {
                        return null
                    }                    
                    return (
                    <SwiperSlide key={type}>
                        <LocationTypeFilterButton filter={locationTypeFilter} setFilter={setLocationTypeFilter} type={type} />
                    </SwiperSlide>
                )})}
            </Swiper>
        </div>
    )
}

export default React.memo(FilterBar);