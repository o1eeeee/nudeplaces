import { useEffect, useState } from 'react';
import { config } from '../lib/config';
import styles from '../styles/components/AddLocationForm.module.css'
import { useLanguageContext } from '../context/LanguageProvider';
import { useModalContext } from '../context/ModalProvider';

export default function ReviewLocationForm({ location, isSubmitting, setIsSubmitting, setIsSubmitted }) {
    const { setIsShown } = useModalContext();
    const { dictionary } = useLanguageContext();
    const [values, setValues] = useState({
        details: [],
    });
    const [errors, setErrors] = useState({});

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

        // Details
        values.details.map(detail => {
            if (!reviewDetails.includes(detail)) {
                errors.details = dictionary("addLocationFormValidatePosition");
                return errors;
            }
        })

        return errors;
    }

    const reviewDetails = [
        "clean",
        "accessible",
    ]

    useEffect(() => {
        async function performCreate() {
            const details = values.details;
            try {
                const response = await fetch(`${config.FETCH_URL}/locationReviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idLocation: location.id,
                        details: details.join(','),
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
            setIsShown(false)
        } else {
            setIsSubmitting(false)
        }
    }, [errors])

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Ort bewerten</h2>
            <p>Was gefällt dir an diesem Ort besonders?</p>
            {reviewDetails.map(detail => (
                <div className={styles.formGroupInline} key={detail}>
                    <input type="checkbox" id={detail} name={detail} value="" />
                    <label htmlFor={detail}>{detail}</label>
                </div>
            ))}
            {Object.keys(errors).length > 0 && <p className={styles.errorsWarning}>{dictionary("addLocationFormErrorsWarning")}</p>}
            <input type="submit" value={dictionary("addLocationFormSubmit")} />
        </form>
    )
}