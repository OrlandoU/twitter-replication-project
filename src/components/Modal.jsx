import React, { useEffect, useState } from "react"

const Modal = React.forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false)

    const openModal = () => {
        setVisible(true)
        document.body.style.overflow = 'hidden'
    }

    const closeModal = () => {
        if (props.nonClosable) return
        document.body.style.overflow = 'auto'
        setVisible(false)
    }

    useEffect(() => {
        if (props.refToObject.current) {
            props.refToObject.current.addEventListener('click', openModal)
        }
    }, [props.refToObject])

    if (!visible) {
        return null
    }

    return (
        <div className={"modal-container " + props.className} onClick={closeModal}>
            <main className={"modal " + props.className} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="close-modal" style={{ opacity: props.nonClosable ? '0' : '1' }} onClick={closeModal} ref={ref}><svg viewBox="0 0 24 24" aria-hidden="true" class="close-modal-svg"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></div>
                    {props.isEdit &&
                        <div className="modal-flex">
                            <div className="modal-title">Edit profile</div>
                            <button className="save-button" onClick={props.cb}>Save</button>
                        </div>}
                    {props.isMessage &&
                        <div className="modal-flex">
                            <div className="modal-title">New Message</div>
                        </div>}
                    {props.modalHeader &&
                        <div className="modal-flex">
                            <div className="modal-title">{props.modalHeader}</div>
                        </div>}
                </div>
                {props.children}
            </main>
        </div>
    )
})

export default Modal