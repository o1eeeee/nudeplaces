import { useEffect, useState } from 'react';
import { useMapContext } from '../context/MapProvider';
import getLocationTypes from '../lib/locationTypes';
import { config } from '../lib/config';
import styles from '../styles/components/Form.module.css'
import { useLanguageContext } from '../context/LanguageProvider';
import slugify from 'slugify';

export default function AddLocationForm({ isSubmitting, setIsSubmitting, setIsSubmitted }) {
    const { dictionary } = useLanguageContext();
    const { draggableMarkerPosition } = useMapContext();
    const [values, setValues] = useState({
        title: "",
        description: "",
        type: "",
        url: "",
    });
    const [errors, setErrors] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [allowSubmit, setAllowSubmit] = useState(false);
    const locationTypes = getLocationTypes();
    const regexPatterns = {
        url: "https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}"
    }

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

    function validateForm(values) {
        const errors = {}
        const lat = draggableMarkerPosition.latitude;
        const lng = draggableMarkerPosition.longitude;

        // Position
        if (!lat || !lng || !allowSubmit) {
            errors.position = dictionary("addLocationFormValidatePosition");
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
            let data;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`)
                if (!response.ok) {
                    console.log("An error has occured: ", response.status);
                    return false;
                }
                data = await response.json();
            } catch (error) {
                console.log("An error has occured: ", error);
                return false;
            }

            const title = !!values.title ? values.title : "";
            const text = !!values.description ? values.description : null;
            const type = !!values.type ? values.type : null;
            const url = !!values.url ? values.url : null;
            const country = data.address.country_code ? data.address.country_code.toUpperCase() : "XX";
            const postcode = data.address.postcode ?? null;
            const region = data.address.state ?? null;
            const subregion = data.address.county ?? data.address.borough ?? data.address.state_district ?? null;
            const municipality = data.address.city ?? data.address.town ?? data.address.municipality ?? data.address.village ?? data.address.city_district ?? subregion ?? region ?? country;
            const neighbourhood = data.address.suburb ?? null;
            const street = data.address.road ?? null;
            const housenumber = data.address.house_number ?? null;
            const seoName = slugify(`${title}-${municipality}`).toLowerCase();

            try {
                const response = await fetch(`${config.FETCH_URL}/locations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        isPublished: false,
                        country: country,
                        housenumber: housenumber,
                        latitude: latitude,
                        longitude: longitude,
                        municipality: municipality,
                        neighbourhood: neighbourhood,
                        postcode: postcode,
                        region: region,
                        seoName: seoName,
                        street: street,
                        subregion: subregion,
                        text: text,
                        title: title,
                        type: type,
                        url: url,
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
        <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.dragMarkerOnMapInfo}>
                <span className="icon-info"></span>
                <span>{dictionary("addLocationFormPositionInfo")}</span>
            </p>
            <div className={styles.formGroup}>
                <label>
                    <span>{dictionary("addLocationFormPositionLabel")}</span>
                    <p>{`${draggableMarkerPosition.latitude.toFixed(6)}, ${draggableMarkerPosition.longitude.toFixed(6)}`}</p>
                </label>
                {errors.position && <p>{errors.position}</p>}
            </div>
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
    )
}