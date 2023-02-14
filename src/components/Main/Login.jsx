import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useContext, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"

function Login(props) {
    const user = useContext(UserContext)
    const [stage, setStage] = useState(0)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorEmail, setErrorEmail] = useState('')
    const [progress, setProgress] = useState(0)

    const handleStage1 = async (e) => {
        e.preventDefault()
        const q = query(collection(getFirestore(), 'users'), where('email', '==', email))
        const emailDocs = await getDocs(q)
        if (emailDocs.size === 0) {
            setErrorEmail('Email direction not found')
        } else {
            setStage(prev => prev + 1)
        }
    }

    const handleStage2 = async (e) => {
        e.preventDefault()
        try {
            await signInWithEmailAndPassword(getAuth(), email, password)
            let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
            user.setUser(userData.data())
            document.querySelector('.modal-container').click()
        } catch (error) {
            console.error('Error login', error)
        }

    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePassChange = (e) => {
        setPassword(e.target.value)
    }

    const handleOpenRegister = () => {
        document.querySelector('.modal-container.signin-gen').click()
        document.querySelector('#registerRef').click()
    }

    const tryGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(getAuth(), provider)
            let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
            if (!userData.data()) {
                props.googleRef.current.click()
            } else {
                user.setUser(userData.data())
            }
            document.querySelector('.modal-container').click()
        } catch (error) {
            console.error('Error login with google', error)
        }

    }

    if (stage === 0) {
        return (
            <>
                <form onSubmit={handleStage1} className={'login-form'}>
                    <h1 className="title">Login on Twitter</h1>
                    <button className="register-button" type="button" onClick={tryGoogleLogin}>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" ><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                        <span >Login with Google</span>
                    </button>
                    <div className="register-or"><span>or</span></div>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-mail-modal" className="input-label">
                            <input className={errorEmail ? "profile-mail error inputs" : "profile-mail inputs"} type="email" id="profile-bio-modal" value={email} onChange={handleEmailChange} required />
                            <div className={email.length ? "label-text" : "label-text expanded"}>Email</div>
                            <div className="error-email">{errorEmail}</div>
                        </label>
                    </div>
                    <button className="signin-button-next" type="submit">Next</button>
                    <div className="register-redirect">
                        <span className="grayed">Not a user yet?</span> <span className="pseudolink" onClick={handleOpenRegister}>Register</span>
                    </div>
                </form>
            </>
        )
    }
    if (stage === 1) {
        return (
            <>
                <div className="loadBar-modal" style={{ transform: `scaleX(${progress})` }}></div>
                <form onSubmit={handleStage2} className={'login-form'}>
                    <h1 className="title">Introduce your Password</h1>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-mail-modal" className="input-label">
                            <input className={errorEmail ? "profile-mail error inputs" : "profile-mail inputs"} type="email" id="profile-bio-modal" value={email} onChange={handleEmailChange} required disabled/>
                            <div className={email.length ? "label-text" : "label-text expanded"}>Email</div>
                            <div className="error-email">{errorEmail}</div>
                        </label>
                        <label htmlFor="profile-mail-modal" className="input-label">
                            <input className="profile-mail inputs" type="password" id="profile-bio-modal" value={password} onChange={handlePassChange} required />
                            <div className="label-text">Password</div>
                        </label>
                    </div>
                    <button className="signin-button-next" type="submit">Next</button>
                </form>
            </>
        )
    }
}

export default Login