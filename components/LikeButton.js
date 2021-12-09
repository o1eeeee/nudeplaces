import { useEffect, useState } from 'react';
import { useLanguageContext } from '../context/LanguageProvider';
import { useModalContext } from '../context/ModalProvider';
import styles from '../styles/components/LikeButton.module.css';
import ReviewLocationForm from './ReviewLocationForm';

export default function LikeButton({ location }) {
    const { setIsShown, setModalContent } = useModalContext();
    const { dictionary } = useLanguageContext();
    const [wasClicked, setWasClicked] = useState(false);
    const [likeCount, setLikeCount] = useState(location.location_reviews.length);

    useEffect(() => {
        if (wasClicked) {
            setLikeCount(likeCount + 1)
        }
    }, [wasClicked])

    const handleClick = () => {
        setModalContent(<ReviewLocationForm location={location} setIsSubmitted={setWasClicked} />);
        setIsShown(true);
    };

    return (
        <button className={wasClicked ? styles.likeButtonClicked : styles.likeButton} onClick={handleClick} >
            <span className="icon-heart"></span>
            {likeCount}
        </button>
    )
}