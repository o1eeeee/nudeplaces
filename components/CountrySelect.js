import { useEffect, useRef, useState } from 'react';
import LinkList from './LinkList';
import { getCountries } from '../lib/countries';
import styles from '../styles/components/CountrySelect.module.css';
import { useLanguageContext } from '../context/LanguageProvider';

export default function CountrySelect() {
    const { dictionary } = useLanguageContext();
    const countries = getCountries();
    const [value, setValue] = useState("");
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [showCountriesList, setShowCountriesList] = useState(false);
    const countrySelectRef = useRef(null);

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

    const handleClickLink = () => {
        setValue("");
        setShowCountriesList(false);
    }

    const handleChange = (e) => {
        setValue(e.target.value);
    }

    const handleFocus = (e) => {
        setShowCountriesList(true);
    }

    function getCountryListItems(countries, continent) {
        const listItems = [];
        const filteredCountries = countries.filter(country =>
            continent == "EU" ? country.continent == "EU" : country.continent != "EU"
        );
    
        filteredCountries.map((country) => {
            const countryName = dictionary(`countryName_${country.isoCode}`);
            listItems.push({
                href: buildCountryUrl(country),
                text: countryName,
                handleClick: handleClickLink,
            })
        })
    
        return listItems;
    }
    
    
    function buildCountryUrl(country) {
        return `/${encodeURIComponent(country.urlName)}`;
    }

    return (
        <div className={`${styles.countrySelect} ${showCountriesList && styles.countrySelectOpen}`}>
            <div ref={countrySelectRef}>
                <div className={styles.countryInputGroup}>
                    <label htmlFor="CountryInput">{dictionary("countrySelectLabel")}</label>
                    <input id="CountryInput" className={styles.countryInput} placeholder={dictionary("countrySelectPlaceholder")} type="text" value={value} onChange={handleChange} onFocus={handleFocus} />
                    <span className="icon-search"></span>
                </div>
                <div className={`${styles.countriesList} ${showCountriesList && styles.countriesListOpen}`}>
                    <h2>{dictionary("continent_europe")}</h2>
                    <LinkList listItems={getCountryListItems(filteredCountries, "EU")} />
                    <h2>{dictionary("continent_other")}</h2>
                    <LinkList listItems={getCountryListItems(filteredCountries)} />                    
                </div>
                
            </div>
        </div>

    )
}