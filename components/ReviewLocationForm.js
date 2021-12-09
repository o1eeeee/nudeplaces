import { useEffect, useState } from 'react';
import { config } from '../lib/config';
import styles from '../styles/components/Form.module.css'
import { useLanguageContext } from '../context/LanguageProvider';
import { useModalContext } from '../context/ModalProvider';
import Checkbox from './Checkbox';

export default function ReviewLocationForm({ location, setIsSubmitted }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setIsShown } = useModalContext();
    const { dictionary } = useLanguageContext();
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setValues({
            ...values,
            [name]: checked,
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
        const keys = Object.keys(values)
        keys.map(key => {
            if (!reviewDetails.includes(key)) {
                errors.details = dictionary("addLocationFormValidatePosition");
                return errors;
            }
        })

        return errors;
    }

    const reviewDetails = [
        "accessible",
        "clean",
        "friendly",
        "safe",
    ]

    useEffect(() => {
        async function performCreate() {
            try {
                const response = await fetch(`${config.FETCH_URL}/location-reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        location: location.id,
                        details: values,
                    }),
                })
                const data = await response.json()
                setIsSubmitting(false)
                setIsSubmitted(true);
                setIsShown(false);
            } catch (error) {
                console.log("Error writing document: ", error)
                setErrors({ error: error })
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
            <h2>{dictionary("locationReviewTitle")}</h2>
            <p>{dictionary("locationReviewSubtitle")}</p>
            {reviewDetails.map(detail => (
                <div className={styles.formGroupInline} key={detail}>
                    <Checkbox name={detail} label={dictionary(`locationReviewLabel_${detail}`)} value={values[detail] || false} onChange={handleChange} />
                </div>
            ))}
            {Object.keys(errors).length > 0 && <p className={styles.errorsWarning}>{dictionary("formErrorsWarning")}</p>}
            <input type="submit" value={dictionary("locationReviewSubmit")} disabled={isSubmitting} />
        </form>
    )
}