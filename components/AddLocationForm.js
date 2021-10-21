import { useEffect, useState } from 'react';
import { useMapContext } from '../context/MapProvider';
import getLocationTypes from '../lib/locationTypes';
import initFirebase from '../lib/firebase';
import styles from '../styles/components/AddLocationForm.module.css'
import { useLanguageContext } from '../context/LanguageProvider';

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
            const dateNow = new Date().toISOString();
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

            const uuid = null;
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
            const createDate = dateNow;
            const modifyDate = createDate;
            const language = null;
            const locale = null;
            const seoName = `${title.replace(/\s/g, "-").replace(/[^A-Za-z0-9-]+/g, "")}-${municipality.replace(" ", "-").replace(/[^A-Za-z0-9-]+/g, "")}`.toLowerCase();

            let db = await initFirebase()
            db.collection("locations").add({
                'UUID': uuid,
                'title': title,
                'text': text,
                'type': type,
                'url': url,
                'seoName': seoName,
                'latitude': latitude,
                'longitude': longitude,
                'country': country,
                'postcode': postcode,
                'region': region,
                'subregion': subregion,
                'municipality': municipality,
                'neighbourhood': neighbourhood,
                'street': street,
                'housenumber': housenumber,
                'createDate': createDate,
                'modifyDate': modifyDate,
                'language': language,
                'locale': locale,
                'isPublished': false,
            }).then((docRef) => {
                /*console.log("Successfully written with ID: ", docRef.id)*/
                setIsSubmitted(true);
            }).catch((error) => {
                console.log("Error writing document: ", error)
            }).finally(() => {
                setIsSubmitting(false)
            })
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
            {Object.keys(errors).length > 0 && <p className={styles.errorsWarning}>{dictionary("addLocationFormErrorsWarning")}</p>}
            <input type="submit" value={dictionary("addLocationFormSubmit")} />
        </form>
    )
}