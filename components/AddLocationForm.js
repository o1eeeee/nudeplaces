import { useEffect, useState } from 'react';
import { useMapContext } from '../context/MapProvider';
import getLocationTypes from '../lib/locationTypes';
import { config } from '../lib/config';
import styles from '../styles/components/Form.module.css'
import { useLanguageContext } from '../context/LanguageProvider';
import slugify from 'slugify';
import { buildLocationInfo, buildLocationPostcodeAndMunicipality, buildLocationRegionAndCountry, buildLocationStreetAndHouseNr } from '../lib/locations';
import { getCountry } from '../lib/countries';
import FetchAddressButton from './FetchAddressButton';

export default function AddLocationForm({ isSubmitting, setIsSubmitting, setIsSubmitted }) {
    const { dictionary } = useLanguageContext();
    const { map, setMap } = useMapContext();
    const { bounds, draggableMarkerPosition } = map;
    const [values, setValues] = useState({
        title: "",
        description: "",
        type: "",
        url: "",
        country: null,
        postcode: null,
        region: null,
        subregion: null,
        municipality: null,
        neighbourhood: null,
        street: null,
        housenumber: null,
    });
    const [errors, setErrors] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [allowSubmit, setAllowSubmit] = useState(false);
    const locationTypes = getLocationTypes();
    const regexPatterns = {
        url: "https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}"
    }
    const isMarkerInBounds = draggableMarkerPosition.latitude > bounds?._southWest.lat && draggableMarkerPosition.latitude < bounds?._northEast.lat && draggableMarkerPosition.longitude > bounds?._southWest.lng && draggableMarkerPosition.longitude < bounds?._northEast.lng;

    const locationInfo = buildLocationInfo(values);
    const locationStreetAndHouseNr = buildLocationStreetAndHouseNr(values);
    const locationPostcodeAndMunicipality = buildLocationPostcodeAndMunicipality(values);
    const locationRegionAndCountry = values.country && buildLocationRegionAndCountry(values?.region, getCountry(values.country));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors(validateForm(values));
    }

    async function handleFetchAddress(e) {
        const latitude = isMarkerInBounds ? draggableMarkerPosition.latitude : ((bounds?._southWest.lat + bounds?._northEast.lat) / 2);
        const longitude = isMarkerInBounds ? draggableMarkerPosition.longitude : ((bounds?._southWest.lng + bounds?._northEast.lng) / 2);
        if (!latitude || !longitude) {
            return false;
        }
        setMap({
            ...map,
            draggableMarkerPosition: { latitude, longitude }
        });
        let data;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`)
            if (!response.ok) {
                throw response.status;
            }
            data = await response.json();
            if (!data.address) {
                throw "Invalid address";
            }
            setValues({
                ...values,
                country: data.address.country_code ? data.address.country_code.toUpperCase() : "XX",
                postcode: data.address.postcode ?? null,
                region: data.address.state ?? null,
                subregion: data.address.county ?? data.address.borough ?? data.address.state_district ?? null,
                municipality: data.address.city ?? data.address.town ?? data.address.municipality ?? data.address.village ?? data.address.city_district ?? data.address.subregion ?? data.address.region ?? data.address.country,
                neighbourhood: data.address.suburb ?? null,
                street: data.address.road ?? null,
                housenumber: data.address.house_number ?? null,
            });
        } catch (error) {
            console.log("An error has occured: ", error);
            return false;
        }
    }

    function validateForm(values) {
        const errors = {}
        const lat = draggableMarkerPosition.latitude;
        const lng = draggableMarkerPosition.longitude;

        // Position & Address
        if (!values.country || !values.municipality || !lat || !lng || !allowSubmit) {
            errors.address = dictionary("addLocationFormValidateAddress");
        }

        // Title
        if (!values.title) {
            errors.title = dictionary("addLocationFormValidateTitleRequired");
        }
        if (values.title.length > 100) {
            errors.title = dictionary("addLocationFormValidateTitleLength");
        }

        // Type
        if (!values.type) {
            errors.type = dictionary("addLocationFormValidateTypeRequired");
        }

        // Text
        if (values.description && values.description.length > 1000) {
            errors.description = dictionary("addLocationFormValidateDescriptionLength");
        }

        // URL
        const urlRegex = new RegExp(regexPatterns.url);
        if (values.url && !urlRegex.test(values.url)) {
            errors.url = dictionary("addLocationFormValidateUrlInvalid");
        }

        return errors;
    }

    useEffect(() => {
        isInitialized && setAllowSubmit(true);
        setIsInitialized(true);
    }, [draggableMarkerPosition])

    useEffect(() => {
        async function performCreate() {
            const latitude = draggableMarkerPosition.latitude;
            const longitude = draggableMarkerPosition.longitude;
            const title = !!values.title ? values.title : "";
            const text = !!values.description ? values.description : null;
            const type = !!values.type ? values.type : null;
            const url = !!values.url ? values.url : null;
            const seo_name = slugify(`${title}-${values.municipality}`).toLowerCase();

            try {
                const response = await fetch(`${config.FETCH_URL}/locations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: {
                            country: values.country,
                            housenumber: values.housenumber,
                            latitude: latitude,
                            longitude: longitude,
                            municipality: values.municipality,
                            neighbourhood: values.neighbourhood,
                            postcode: values.postcode,
                            region: values.region,
                            seo_name: seo_name,
                            street: values.street,
                            subregion: values.subregion,
                            text: text,
                            title: title,
                            type: type,
                            url: url,
                            publishedAt: null,
                        }
                    }),
                })
                const data = await response.json()
                setIsSubmitted(true);
            } catch (error) {
                console.log("Error writing document: ", error)
            } finally {
                setIsSubmitting(false)
            }
        }
        if (Object.keys(errors).length === 0 && isSubmitting) {
            performCreate()
        } else {
            setIsSubmitting(false)
        }
    }, [errors])

    return (
        <>
            <div className={styles.form}>
                <p className={styles.dragMarkerOnMapInfo}>
                    <span className="icon-info"></span>
                    <span>{dictionary("addLocationFormPositionInfo")}</span>
                </p>
                <div className={styles.formGroup}>
                    <label className={styles.required}>
                        <span>{dictionary("addLocationFormAddressLabel")}</span>
                    </label>
                    <FetchAddressButton handleFetchAddress={handleFetchAddress} />
                    {values.country &&
                        <>
                            {locationInfo && <p>{locationInfo}</p>}
                            {values.street && <p>{locationStreetAndHouseNr}</p>}
                            {values.postcode && <p>{locationPostcodeAndMunicipality}</p>}
                            <p>{locationRegionAndCountry}</p>
                            <p className={styles.isAddressCorrect}>
                                <span className="icon-_undefined_"></span>
                                <span>{dictionary("addLocationFormIsAddressCorrect")}</span>
                            </p>
                        </>
                    }
                    {errors.address && <p>{errors.address}</p>}
                </div>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.required}>
                        <span>{dictionary("addLocationFormTitleLabel")}</span>
                        <input type="text" name="title" placeholder={dictionary("addLocationFormTitlePlaceholder")} value={values.title} onChange={handleChange} maxLength="100" required />
                    </label>
                    {errors.title && <p>{errors.title}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.required}>
                        <span>{dictionary("addLocationFormTypeLabel")}</span>
                        <select name="type" value={values.type} onChange={handleChange} required>
                            <option key={locationTypes.length} value=""></option>
                            {locationTypes.map((locationType) => {
                                if (!["legacy", "no_nudism_anymore", "_undefined_"].includes(locationType)) {
                                    return (
                                        <option key={locationType} value={locationType}>{dictionary(`locationTypeFilter_${locationType}`)}</option>
                                    )
                                }
                            })}
                        </select>
                    </label>
                    {errors.type && <p>{errors.type}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label>
                        <span>{dictionary("addLocationFormDescriptionLabel")}
                            <span className={styles.charCounter}>({values.description ? values.description.length : 0}/1000)</span>
                        </span>
                        <textarea name="description" placeholder={dictionary("addLocationFormDescriptionPlaceholder")} value={values.description} onChange={handleChange} rows="7" maxLength="1000" />
                    </label>
                    {errors.text && <p>{errors.text}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label>
                        <span>{dictionary("addLocationFormUrlLabel")}</span>
                        <input type="text" name="url" placeholder={dictionary("addLocationFormUrlPlaceholder")} value={values.url} onChange={handleChange} pattern={regexPatterns.url} maxLength="2048" />
                    </label>
                    {errors.url && <p>{errors.url}</p>}
                </div>
                {Object.keys(errors).length > 0 && <p className={styles.errorsWarning}>{dictionary("formErrorsWarning")}</p>}
                <input type="submit" value={dictionary("addLocationFormSubmit")} />
            </form>
        </>
    )
}