import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useContext, useState } from "react"
import { UserContext } from "../../Contexts/UserContext";

function Signin({registerRef}) {
    const user = useContext(UserContext)
    const [isLogin, setIsLogin] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [tag, setTag] = useState('')
    const [password, setPassword] = useState('')

    const createUser = async () => {

        if (!isLogin) {
            try {
                await createUserWithEmailAndPassword(getAuth(), email, password)
                 setDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid), {
                    tag,
                    email,
                    name,
                    bio: '',
                    location: '',
                    followers: [],
                    tweets_count: 0,
                    tag_substring: tag.split('').map((el, index) => name.slice(0, index + 1).toLowerCase()),
                    followers_count: 0,
                    name_substring: name.split('').map((el, index)=>name.slice(0, index + 1).toLowerCase()),
                    profile_pic: 'https://i.pinimg.com/736x/35/99/27/359927d1398df943a13c227ae0468357.jpg',
                    created_at: new Date().getTime(),
                    id: getAuth().currentUser.uid
                })
                let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
                user.setUser(userData.data())
            } catch (error) {
                console.error('Error creating user', error)
            }
        } else {
            try {
                await signInWithEmailAndPassword(getAuth(), email, password)
                let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
                user.setUser(userData.data())
            } catch (error) {
                console.error('Error creating user', error)
            }
        }


    }

    const handleForm = (e) => {
        e.preventDefault()
        createUser()
    }

    const handleNameChange = (e) => {
        setName(e.currentTarget.value)
    }

    const handleTagChange = (e) => {
        setTag(e.currentTarget.value)
    }

    const handleEmailChange = (e) => {
        setEmail(e.currentTarget.value)
    }

    const handlePassChange = (e) => {
        setPassword(e.currentTarget.value)
    }

    const handleLogout = async () => {
        await signOut(getAuth())
        user.setUser(getAuth().currentUser)
    }

    // if (user.user) {

    //     return <button type="button" onClick={handleLogout}>Logout</button>
    // }

    return (
        <>
            {!isLogin ? (
                <form onSubmit={handleForm}>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-name-modal" className="input-label">
                            <input type="text" id="profile-name" className="inputs" value={name} onChange={handleNameChange} />
                            <div className={name.length ? "label-text" : "label-text expanded"}>Name</div>
                            <div className="letter-count">{name.length} / 50</div>
                        </label>
                        <label htmlFor="profile-tag-modal" className="input-label">
                            <input type="text" id="profile-name" className="inputs" pattern="^[a-zA-Z0-9_]*$" value={tag} onChange={handleTagChange} />
                            <div className={tag.length ? "label-text" : "label-text expanded"}>Tag</div>
                            <div className="letter-count">{tag.length} / 50</div>
                        </label>
                        <label htmlFor="profile-mail-modal" className="input-label">
                            <textarea className="inputs profile-mail" type="text" id="profile-bio-modal" value={email} onChange={handleEmailChange} />
                            <div className={email.length ? "label-text" : "label-text expanded"}>Email</div>
                            <div className="letter-count">{email.length} / 160</div>
                        </label>
                        <label htmlFor="profile-location-modal" className="input-label">
                            <input className="inputs" type="text" id="profile-location-modal" value={password} onChange={handlePassChange} />
                            <div className={password.length ? "label-text" : "label-text expanded"}>Location</div>
                            <div className="letter-count">{password.length} / 30</div>
                        </label>
                    </div>

                    <button>Submit</button>
                    <button type="button" onClick={() => setIsLogin(true)}>Login</button>
                </form>
            ) : (
                <form onSubmit={handleForm}>
                    <label htmlFor="">
                        email
                        <input onChange={handleEmailChange} type="email" value={email} required autoComplete="true"/>
                    </label>
                    <label htmlFor="">
                        password
                        <input onChange={handlePassChange} type="password" value={password} required autoComplete="true"/>
                    </label>
                    <button>Submit</button>
                    <button type="button" onClick={() => setIsLogin(false)}>Signup</button>
                </form>
            )}
        </>


    )
}

export default Signin