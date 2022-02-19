import { createContext, useContext } from 'react';
import { useState } from 'react';
import ModalContainer from '../components/ModalContainer';

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [isShown, setIsShown] = useState(false);
    const [modalContent, setModalContent] = useState("");

    return (
        <ModalContext.Provider value={{
            isShown, setIsShown, setModalContent,
        }}>
            <ModalContainer isShown={isShown} setIsShown={setIsShown} modalContent={modalContent} />
            {children}
        </ModalContext.Provider>
    );
}

export function useModalContext() {
    return useContext(ModalContext);
}