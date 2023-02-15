import { useState } from "react"
import { useEffect } from "react"

function Opt({ children, triggerRef }) {
    const [visible, setVisible] = useState(false)

    const show = () => {
        setVisible(true)
    }

    const hide = () => {
        setVisible(false)
    }

    useEffect(() => {
        if (triggerRef.current) {
            triggerRef.current.addEventListener('click', show)
        }
    }, [triggerRef])

    if (!visible) {
        return null
    }

    return (
        <>
            <div className="option-container" onClick={hide}>
                {children}
            </div>
            <div className="hide-opt" onClick={hide}></div>
        </>
    )
}

export default Opt