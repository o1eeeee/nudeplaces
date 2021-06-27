import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import LocationTypeFilter from './LocationTypeFilter';
import CountrySelect from './CountrySelect';
import { getCountries } from '../lib/countries';
import getLocationTypes from '../lib/locationTypes';
import styles from '../styles/components/FilterBar.module.css';
import "swiper/swiper.min.css";

export default function FilterBar({ initialCountry, backButtonHref, locationTypeFilter, setLocationTypeFilter }) {
    const countries = getCountries();
    const locationTypes = getLocationTypes();
    return (
        <div className={styles.filterBar}>
            <div className={styles.navigation}>
                {backButtonHref && (
                    <Link href={backButtonHref}>
                        <a className={styles.backButton}>
                            &larr;
                        </a>
                    </Link>
                )}
                <CountrySelect countries={countries} initialCountry={initialCountry} />
            </div>
            {setLocationTypeFilter &&
                <Swiper slidesPerView="auto" spaceBetween={18}>
                    {locationTypes.map((type, index) => (
                        <SwiperSlide key={index}>
                            <LocationTypeFilter filter={locationTypeFilter} setFilter={setLocationTypeFilter} type={type} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            }
        </div>
    )
}