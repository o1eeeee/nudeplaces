import { useState } from 'react';
import { useLanguageContext } from '../context/LanguageProvider';
import { useModalContext } from '../context/ModalProvider';
import styles from '../styles/components/LikeButton.module.css';
import ReviewLocationForm from './ReviewLocationForm';

export default function LikeButton({ location }) {
    const { setIsShown, setModalContent } = useModalContext();
    const { dictionary } = useLanguageContext();
    const [wasClicked, setWasClicked] = useState(false);

    const handleClick = () => {
        setModalContent(<ReviewLocationForm location={location} isSubmitting={false} setIsSubmitting={() => {}} setIsSubmitted={() => {}} />); 
        setIsShown(true);
    };

    return (
        <button className={wasClicked ? styles.likeButtonClicked : styles.likeButton} onClick={handleClick} >
            <span className="icon-check-circle"></span>
            {wasClicked
                ? "Thank you for your feedback!"
                : "I like this place"}
        </button>
    )
}