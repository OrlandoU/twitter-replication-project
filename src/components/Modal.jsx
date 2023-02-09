import React, { useEffect, useState } from "react"

const Modal = (props) => {
    const [visible, setVisible] = useState(false) 
    const openModal = () => {
        setVisible(true)
    }

    const closeModal = () => {
        setVisible(false)
    }

    useEffect(() => {
        props.refToObject.current.addEventListener('click', openModal)
        return ()=>props.refToObject.current.removeEventListener('click', openModal)
    }, [props.refToObject])    

    return (
        <div className="modal-container" style={{display: visible ? "flex": 'none'}}>
            <main className="modal">
                <div className="modal-header">
                    <div className="close-modal" onClick={closeModal}><svg viewBox="0 0 24 24" aria-hidden="true" class="close-modal-svg"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></div>
                </div>
                {props.children}
            </main>
        </div>
    )
}

export default Modal