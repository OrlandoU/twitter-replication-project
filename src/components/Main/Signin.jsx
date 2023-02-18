import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

function Signin({ setModalHeader, setNonClosable, isGmail }) {
    const user = useContext(UserContext)
    const [errorEmail, setErrorEmail] = useState()
    const [stage, setStage] = useState(0)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [tag, setTag] = useState('')
    const [password, setPassword] = useState('')
    const [date, setDate] = useState('')
    const [profilePic, setProfilePic] = useState()
    const [progress, setProgress] = useState(0)


    const createUser = async () => {
        setProgress(.3)
        try {
            if(!isGmail){
                await createUserWithEmailAndPassword(getAuth(), email, password)
            }
            setProgress(.4)
            setDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid), {
                tag,
                email,
                name,
                bio: '',
                date,
                location: '',
                followers: [],
                tweets_count: 0,
                tag_substring: tag.split('').map((el, index) => name.slice(0, index + 1).toLowerCase()),
                followers_count: 0,
                following_count: 0,
                name_substring: name.split('').map((el, index) => name.slice(0, index + 1).toLowerCase()),
                profile_pic: profilePic ? '' :'https://i.pinimg.com/736x/35/99/27/359927d1398df943a13c227ae0468357.jpg',
                created_at: new Date().getTime(),
                id: getAuth().currentUser.uid
            })
            setProgress(.6)
            let userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
            if (profilePic) {
                let filePath = `users-media/${userData.data().id}/profile_pic`;
                let newImageRef = ref(getStorage(), filePath);
                let fileSnapshot = await uploadBytesResumable(newImageRef, profilePic);

                let publicImageUrl = await getDownloadURL(newImageRef);

                // 4 - Update the chat message placeholder with the image's URL.
                await updateDoc(doc(getFirestore(), 'users', userData.data().id), {
                    profile_pic: publicImageUrl,
                    storageUri: fileSnapshot.metadata.fullPath,
                });
            }
            setProgress(1)
            document.body.style.overflow = 'initial'
            userData = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
            user.setUser(userData.data())
        } catch (error) {
            console.error('Error creating user', error)
        }
    }



    const handleStage1 = async (e) => {
        e.preventDefault()
        if(isGmail){
            setStage(prev=>prev + 1)
            return
        }
        const q = query(collection(getFirestore(), 'users'), where('email', '==', email))
        const emailDocs = await getDocs(q)
        if (emailDocs.size > 0) {
            setErrorEmail('Email direction already in use')
        } else {
            setStage(prev => prev + 1)
            setNonClosable(true)
        }
    }

    const handleStage2 = (e) => {
        e.preventDefault()

        setStage(prev => prev + 1)
    }
    const handleStage3 = (e) => {
        e.preventDefault()
        createUser()
    }

    const handlePic = (e) => {
        setProfilePic(e.target.files[0])
    }
    const handleNameChange = (e) => {
        if (e.target.value.length > 50) return
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

    const handleDateChange = (e) => {
        setDate(e.target.value)
    }


    useEffect(() => {
        if(isGmail){
            setModalHeader(`Step ${stage + 1} of 2`)
            return
        }
        setModalHeader(`Step ${stage + 1} of 3`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage])

    if (stage === 0) {
        return (
            <>
                <div className="loadBar-modal" style={{ transform: `scaleX(${progress})` }}></div>
                <form onSubmit={handleStage1} className={'sign-form'}>
                    <h1 className="title">Create your Account</h1>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-name-modal" className="input-label">
                            <input type="text" id="profile-name" className="inputs" value={name} onChange={handleNameChange} required />
                            <div className={name.length ? "label-text" : "label-text expanded"}>Name</div>
                            <div className="letter-count">{name.length} / 50</div>
                        </label>

                        {!isGmail &&
                            <label htmlFor="profile-mail-modal" className="input-label">
                                <input className={errorEmail ? "profile-mail error inputs" : "profile-mail inputs"} type="email" value={email} onChange={handleEmailChange} required />
                                <div className={email.length ? "label-text" : "label-text expanded"}>Email</div>
                                <div className="error-email">{errorEmail}</div>
                            </label>}

                        <div className="birthday-header">
                            <h4 className="title birthday">Birthday</h4>
                            <p>This information will not be public. Confirm your own age, even if this account is for a business, a pet, or something else.</p>
                        </div>
                        <div className="date-containers">
                            <label htmlFor="profile-mail-modal" className="input-label">
                                <input value={date} type='Date' className="profile-mail inputs" onChange={handleDateChange} required />
                                <div className="label-text" >Date</div>
                            </label>
                        </div>
                    </div>
                    <button className="signin-button-next" type="submit">Next</button>
                </form>
            </>
        )
    } if (stage === 1 && !isGmail) {
        return (
            <>
                <div className="loadBar-modal" style={{ transform: `scaleX(${progress})` }}></div>
                <form onSubmit={handleStage2} className={'sign-form'}>
                    <h1 className="password-title">You need a password</h1>
                    <p>Use at least 8 characters, a mixture of uppercase and lowercase letters, numbers, and symbols.</p>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-name-modal" className="input-label">
                            <input onChange={handlePassChange} value={password} type="password" className="inputs" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d\s]).{8,}" required onInvalid={(e) => e.target.setCustomValidity('Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.')} onInput={(e) => e.target.setCustomValidity('')} />
                            <div className={password.length ? "label-text" : "label-text expanded"}>Password</div>
                        </label>

                    </div>
                    <button className="signin-button-next" type="submit">Next</button>
                </form>
            </>
        )
    }
    if (stage === 2 || isGmail) {
        return (
            <>
                <div className="loadBar-modal" style={{ transform: `scaleX(${progress})` }}></div>
                <form onSubmit={handleStage3} className={'sign-form'}>
                    <h1 className="password-title">Setup Your Profile</h1>
                    <div className="profile">
                        <div className="profile-opt">
                            <div className="profile-pic-container minimized">
                                <label htmlFor="profile-pic-modal" className="centered">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" class="svg-modal"><g><path d="M9.697 3H11v2h-.697l-3 2H5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V10h2v8.5c0 1.381-1.119 2.5-2.5 2.5H5c-1.381 0-2.5-1.119-2.5-2.5v-11C2.5 6.119 3.619 5 5 5h1.697l3-2zM12 10.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-4 2c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zM17 2c0 1.657-1.343 3-3 3v1c1.657 0 3 1.343 3 3h1c0-1.657 1.343-3 3-3V5c-1.657 0-3-1.343-3-3h-1z"></path></g></svg>
                                    <input onChange={handlePic} type="file" id="profile-pic-modal" style={{ display: 'none' }} accept="image/jpeg, image/png, image/bmp, image/webp" />
                                </label>
                                <img src={profilePic ? URL.createObjectURL(profilePic) : 'https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'} alt="" className='profile-pic' accept="image/jpeg, image/png, image/bmp, image/webp" />
                            </div>
                        </div>
                    </div>
                    <div className="profile-info-modal">
                        <label htmlFor="profile-name-modal" className="input-label">
                            <input onChange={handleTagChange} value={tag} type="text" className="inputs" required />
                            <div className={tag.length ? "label-text" : "label-text expanded"}>User Tag</div>
                        </label>

                    </div>
                    <button className="signin-button-next" type="submit">Next</button>
                </form>
            </>
        )
    }
}

export default Signin