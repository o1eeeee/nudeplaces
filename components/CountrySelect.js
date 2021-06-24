import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import getCountries from '../lib/countries';
import styles from '../styles/components/CountrySelect.module.css';

export default function CountrySelect() {
    const countries = getCountries();
    const [value, setValue] = useState("");
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const [showCountriesList, setShowCountriesList] = useState(false);
    const countrySelectRef = useRef(null);

    useEffect(() => {
        const filteredCountries = countries
            .filter((country) => (!value || country.name.toLowerCase().includes(value.toLowerCase()) || country.nativeName.toLowerCase().includes(value.toLowerCase())));

        setFilteredCountries(filteredCountries);
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
        <div ref={countrySelectRef} className={styles.countrySelect}>
            <input className={styles.countryInput} placeholder="Show nude places in..." type="text" value={value} onChange={handleChange} onFocus={handleFocus} />
            <ul className={styles.countriesList} style={showCountriesList ? { display: "flex" } : { display: "none" }}>
                {filteredCountries.map((country) => (
                    <li key={country.isoCode}>
                        <Link href={`/${country.urlName}`}>
                            <a onClick={() => setShowCountriesList(false)}>{country.name}</a>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>

    )
}