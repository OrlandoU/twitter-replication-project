import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useContext, useState } from "react"
import { UserContext } from "../../Contexts/UserContext";

function Signin() {
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
                    followers: [],
                    followers_count: 0,
                    name_substring: name.split('').map((el, index)=>name.slice(0, index + 1).toLowerCase()),
                    profile_pic: 'https://i.pinimg.com/736x/35/99/27/359927d1398df943a13c227ae0468357.jpg',
                    created_at: new Date().getTime(),
                    id: getAuth().currentUser.uid
                })
                user.setUser(getAuth().currentUser)
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

    if (user.user) {

        return <button type="button" onClick={handleLogout}>Logout</button>
    }

    return (
        <>
            {!isLogin ? (
                <form onSubmit={handleForm}>
                    <label htmlFor="">
                        usertag
                        <input onChange={handleTagChange} type="text" value={tag} required />
                    </label>

                    <label htmlFor="">
                        username
                        <input onChange={handleNameChange} type="text" value={name} required />
                    </label>

                    <label htmlFor="">
                        email
                        <input onChange={handleEmailChange} type="email" value={email} required />
                    </label>
                    <label htmlFor="">
                        password
                        <input onChange={handlePassChange} type="password" value={password} required />
                    </label>
                    <button>Submit</button>
                    <button type="button" onClick={() => setIsLogin(true)}>Login</button>
                </form>
            ) : (
                <form onSubmit={handleForm}>
                    <label htmlFor="">
                        email
                        <input onChange={handleEmailChange} type="email" value={email} required />
                    </label>
                    <label htmlFor="">
                        password
                        <input onChange={handlePassChange} type="password" value={password} required />
                    </label>
                    <button>Submit</button>
                    <button type="button" onClick={() => setIsLogin(false)}>Signup</button>
                </form>
            )}
        </>


    )
}

export default Signin