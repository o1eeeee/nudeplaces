import LocationTypeFilterButton from './LocationTypeFilterButton';
import getLocationTypes from '../lib/locationTypes';
import styles from '../styles/components/FilterBar.module.css'


function FilterBar({ locationTypeFilter, setLocationTypeFilter }) {
    const locationTypes = getLocationTypes();

    return (
        <div className={styles.filterBar}>
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