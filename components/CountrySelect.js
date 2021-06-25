import { useEffect, useRef, useState } from 'react';
import LinkList from './LinkList';
import getCountries from '../lib/countries';
import styles from '../styles/components/CountrySelect.module.css';

export default function CountrySelect({ initialCountry }) {
    const countries = getCountries();
    const [value, setValue] = useState("");
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const [showCountriesList, setShowCountriesList] = useState(false);
    const countrySelectRef = useRef(null);

    useEffect(() => {
        setShowCountriesList(false);
    }, [initialCountry])

    useEffect(() => {
        const nameFilteredCountries = countries
            .filter((country) => (!value || country.name.toLowerCase().includes(value.toLowerCase()) || country.nativeName.toLowerCase().includes(value.toLowerCase())));

        setFilteredCountries(nameFilteredCountries);
    }, [value])

    useEffect(() => {
        function handleClickOutside(event) {
            if (countrySelectRef.current && !countrySelectRef.current.contains(event.target)) {
                setShowCountriesList(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [countrySelectRef]);

    const handleChange = (e) => {
        setValue(e.target.value);
    }

    const handleFocus = (e) => {
        setShowCountriesList(true);
    }

    return (
        <div className={`${styles.countrySelect} ${showCountriesList && styles.countrySelectOpen}`}>
            <div ref={countrySelectRef}>
                <div className={styles.countryInputGroup}>
                    <label htmlFor="CountryInput">Country</label>
                    <input id="CountryInput" className={styles.countryInput} placeholder="Show nude places in..." type="text" value={value} onChange={handleChange} onFocus={handleFocus} />
                    <span className="icon-search"></span>
                </div>
                <div className={`${styles.countriesList} ${showCountriesList && styles.countriesListOpen}`}>
                    <LinkList listItems={getCountryListItems(filteredCountries)} />
                </div>
            </div>
        </div>

    )
}


function getCountryListItems(countries) {
    const listItems = [];

    countries.map((country) => {
        listItems.push({
            href: buildCountryUrl(country),
            text: country.name
        })
    })

    return listItems;
}


function buildCountryUrl(country) {
    return `/${encodeURIComponent(country.urlName)}`;
}