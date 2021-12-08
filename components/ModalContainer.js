import styles from '../styles/components/ModalContainer.module.css';

export default function ModalContainer({ isShown, setIsShown, modalContent }) {
    return (
        <>
            {isShown && <div className={styles.modalContainer}>
                <div className={styles.modal}>
                    {modalContent}
                    <button className={styles.hideModalButton} onClick={() => setIsShown(false)}>X</button>
                </div>
            </div>}
        </>
    )
}