import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore"
import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import Signin from "../Main/Signin"
import '../../assets/css/RightBar.css'
import UserPreview from "../Main/UserPreview"
import Modal from "../Modal"
import Login from "../Main/Login"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import SearchBar from "./SearchBar"

function RightBar() {
    const [count, setCount] = useState(0)
    const register = useRef()
    const [users, setUsers] = useState([])
    const [modalHeader, setModalHeader] = useState('')
    const [nonClosable, setNonClosable] = useState(false)
    const loginRef = useRef()
    const googleRef = useRef()
    const registerRef = useRef()
    const userP = useContext(UserContext)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchUsers = async (user) => {
        const q = query(collection(getFirestore(), 'users'), where('id', '!=', user.id), orderBy('id'), orderBy('followers_count', 'desc'), limit(4))
        onSnapshot(q, (data) => setUsers(data.docs))
        const users = await getDocs(q)
        setUsers(users.docs)
    }

    const handleOpenLogin = () => {
        document.querySelector('.modal-container.register-gen').click()
        loginRef.current.click()
    }

    const tryGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(getAuth(), provider)
            let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
            if (!userData.data()) {
                googleRef.current.click()
            } else {
                userP.setUser(userData.data())
            }
            document.querySelector('.modal-container').click()
        } catch (error) {
            console.error('Error login with google', error)
        }

    }

    const handleFollow = async (userRef) => {
        const userData = userRef.data()
        try {
            if (!userData.followers.includes(userP.user.tag)) {
                await updateDoc(userRef.ref, {
                    followers: arrayUnion(userP.user.tag),
                    followers_count: increment(1)
                })
                await updateDoc(doc(getFirestore(), 'users', userP.user.id),
                    { following_count: increment(1) }
                )
                await setDoc(doc(getFirestore(), 'notifications', userRef.id + 'follow'), {
                    userTag: userData.tag,
                    type: 'follow',
                    viewed: false,
                    text: 'followed you',
                    users: [userRef.id],
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime()
                })
            }
            else {
                await updateDoc(userRef.ref, {
                    followers: arrayRemove(userP.user.tag),
                    followers_count: increment(-1)
                })
                await updateDoc(doc(getFirestore(), 'users', userP.user.id),
                    { following_count: increment(-1) }
                )
                await deleteDoc(doc(getFirestore(), 'notifications', userRef.id + 'follow'))
            }
        } catch (error) {
            console.error('Error handling follow request', error)
        }
    }

    const isFallowing = (userData) => {
        return userData.followers.includes(userP.user.tag)
    }

    const handleCreateAccount = () => {
        document.querySelector('.modal-container.register-gen').click()
        register.current.click()
    }

    useEffect(() => {
        if (userP.user) {
            fetchUsers(userP.user)
        }
    }, [userP])



    return (
        <>
            <span ref={googleRef}></span>
            {!userP.user &&
                <>
                    <Modal refToObject={register} nonClosable={nonClosable} modalHeader={modalHeader} className={'signin'}>
                        <Signin setModalHeader={setModalHeader} setNonClosable={setNonClosable} key={count} />
                    </Modal>
                    <div className="login-footer">
                        <div className="login-wrapper">
                            <div className="login-text">
                                <div className="header">Don't miss what's happening</div>
                                <div className="sub-header">Twitter users are the first to know.</div>
                            </div>
                            <div className="login-footer-buttons">
                                <button ref={loginRef} onClick={() => setCount(prev => prev + 1)}>Login</button>
                                <button ref={registerRef} id={'registerRef'}>Register</button>
                            </div>
                        </div>
                    </div>
                    <Modal refToObject={loginRef} className={'signin signin-gen'} >
                        <Login key={count} googleRef={googleRef} />
                    </Modal>
                    <Modal refToObject={registerRef} className={'signin register-gen'}>
                        <form className={'login-form'}>
                            <h1 className="title">Join Twitter Now</h1>
                            <button className="register-button" type="button" onClick={tryGoogleLogin}>
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" ><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                                <span>Login with Google</span>
                            </button>

                            <div className="register-or"><span>or</span></div>
                            <button className="register-button" type="button" onClick={handleCreateAccount}>
                                <span>Create Account</span>
                            </button>
                            <div className="register-redirect">
                                <span className="grayed">Do you already have an account?</span> <span className="pseudolink" onClick={handleOpenLogin}>Log in</span>
                            </div>
                        </form>
                    </Modal>
                    <Modal refToObject={googleRef} nonClosable={nonClosable} modalHeader={modalHeader} className={'signin'}>
                        <Signin setModalHeader={setModalHeader} setNonClosable={setNonClosable} key={count} isGmail />
                    </Modal>
                </>
            }
            <section className="right-bar">
                <SearchBar />
                {!userP.user &&
                    <div className="register-container">
                        <h2 className="title">New on Twitter?</h2>
                        <button className="register-button" type="button" onClick={tryGoogleLogin}>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                            <span>Register with Google</span>
                        </button>
                        <button className="register-button" ref={register} onClick={() => setCount(prev => prev + 1)}>Create Account</button>
                    </div>}
                {userP.user && <div className="right-bar-box">
                    <h2 className="title">Who to Follow</h2>
                    {userP.user && users.map(user => (
                        <UserPreview data={user.data()} className='who-to-follow'>
                            <button className={isFallowing(user.data()) ? "unfollow-button" : "follow-button"} onClick={() => handleFollow(user)}>{isFallowing(user.data()) ? "Unfollow" : "Follow"}</button>
                        </UserPreview>
                    ))}
                </div>}
            </section>
        </>
    )
}
export default RightBar