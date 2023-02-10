import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore"
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { useContext, useEffect, useRef, useState } from "react"
import { NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom"
import '../../assets/css/Profile.css'
import { UserContext } from "../../Contexts/UserContext"
import Loader from "../Loader"
import Modal from "../Modal"
import Tweets from "./Tweets"
import TweetsAndReplies from "./TweetsAndReplies"

function Profile() {
    const thisUser = useContext(UserContext)
    const editRef = useRef()
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0)
    const [user, setUser] = useState({})
    const [profilePic, setProfilePic] = useState()
    const [profileBanner, setProfileBanner] = useState()
    const [profileName, setProfileName] = useState('')
    const [profileBio, setProfileBio] = useState('')
    const [profileLocation, setProfileLocation] = useState('')
    const url = useParams()

    const fetchUser = async () => {
        const user = await getDocs(query(collection(getFirestore(), 'users'), where('tag', '==', url.profileTag)))
        setUser(user.docs[0].data())
    }

    const updateUser = async() => {
        try{
            setProgress(.3)
            await updateDoc(doc(getFirestore(), 'users', thisUser.user.id), {
                name: profileName,
                bio:  profileBio 
            })
            setProgress(.5)
            if(profilePic){
                let filePath = `users-media/${thisUser.user.id}/profile_pic`;
                let newImageRef = ref(getStorage(), filePath);
                deleteObject(newImageRef)
                let fileSnapshot = await uploadBytesResumable(newImageRef, profilePic);

                let publicImageUrl = await getDownloadURL(newImageRef);

                // 4 - Update the chat message placeholder with the image's URL.
                await updateDoc(doc(getFirestore(), 'users', thisUser.user.id), {
                    profile_pic: publicImageUrl,
                    storageUri: fileSnapshot.metadata.fullPath,
                }); 
            }
            setProgress(.7)
            if (profileBanner) {
                let filePath = `users-media/${thisUser.user.id}/profile_banner`;
                let newImageRef = ref(getStorage(), filePath);
                deleteObject(newImageRef)
                let fileSnapshot = await uploadBytesResumable(newImageRef, profileBanner);

                let publicImageUrl = await getDownloadURL(newImageRef);
                setProgress(.9)
                // 4 - Update the chat message placeholder with the image's URL.
                await updateDoc(doc(getFirestore(), 'users', thisUser.user.id), {
                    profile_banner: publicImageUrl,
                    storageUri: fileSnapshot.metadata.fullPath,
                });
            }
            setProgress(1)
            window.location.reload()
        }catch(error){
            console.error('Error updating user data', error)
        }
    }

    const handleBanner = (e) => {
        setProfileBanner(e.target.files[0])
    }
    
    const handlePic = (e) => {
        setProfilePic(e.target.files[0])
    }

    const handleName = (e) => {
        if(e.target.value.length > 50) return
        setProfileName(e.target.value)
    }

    const handleBio = (e) => {
        if (e.target.value.length > 160) return

        setProfileBio(e.target.value)
    }

    const handleLocation = (e) => {
        if (e.target.value.length > 30) return

        setProfileLocation(e.target.value)
    }

    useEffect(() => {
        fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(()=>{
        if(thisUser.user){
            setProfileName(thisUser.user.name)
            setProfileBio(thisUser.user.bio)
            setProfileLocation(thisUser.user.location)
        }
    }, [thisUser])

    if (!user.name) {
        return (
            <main><Loader /></main>
        )
    }


    return (
        <main className="heightened">
            {(thisUser.user && thisUser.user.id === user.id)&& <Modal refToObject={editRef} isEdit cb={updateUser} className='profile-modal'>
                <div className="banner">
                    <label htmlFor="profile-banner-modal" className="centered">
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="svg-modal"><g><path d="M9.697 3H11v2h-.697l-3 2H5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V10h2v8.5c0 1.381-1.119 2.5-2.5 2.5H5c-1.381 0-2.5-1.119-2.5-2.5v-11C2.5 6.119 3.619 5 5 5h1.697l3-2zM12 10.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-4 2c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zM17 2c0 1.657-1.343 3-3 3v1c1.657 0 3 1.343 3 3h1c0-1.657 1.343-3 3-3V5c-1.657 0-3-1.343-3-3h-1z"></path></g></svg>
                        <input onChange={handleBanner} type="file" id="profile-banner-modal" style={{ display: 'none' }} accept="image/jpeg, image/png, image/bmp, image/webp" />
                    </label>
                    {(profileBanner || thisUser.user.profile_banner) && <img src={profileBanner ? URL.createObjectURL(profileBanner) : thisUser.user.profile_banner} alt="" className='profile-banner' accept="image/jpeg, image/png, image/bmp, image/webp" />}
                    <div className="loadBar-modal" style={{transform: `scaleX(${progress})`}}></div>
                </div>
                <div className="profile">
                    <div className="profile-opt">
                        <div className="profile-pic-container minimized">
                            <label htmlFor="profile-pic-modal" className="centered">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="svg-modal"><g><path d="M9.697 3H11v2h-.697l-3 2H5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V10h2v8.5c0 1.381-1.119 2.5-2.5 2.5H5c-1.381 0-2.5-1.119-2.5-2.5v-11C2.5 6.119 3.619 5 5 5h1.697l3-2zM12 10.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-4 2c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zM17 2c0 1.657-1.343 3-3 3v1c1.657 0 3 1.343 3 3h1c0-1.657 1.343-3 3-3V5c-1.657 0-3-1.343-3-3h-1z"></path></g></svg>
                                <input onChange={handlePic} type="file" id="profile-pic-modal" style={{ display: 'none' }} accept="image/jpeg, image/png, image/bmp, image/webp" />
                            </label>
                            <img src={profilePic ? URL.createObjectURL(profilePic) : thisUser.user.profile_pic} alt="" className='profile-pic' accept="image/jpeg, image/png, image/bmp, image/webp" />
                        </div>
                    </div>
                </div>
                <div className="profile-info-modal">
                    <label htmlFor="profile-name-modal" className="input-label">
                        <input type="text" id="profile-name" className="inputs" value={profileName} onChange={handleName}/>
                        <div className={profileName.length ? "label-text" : "label-text expanded"}>Name</div>
                        <div className="letter-count">{profileName.length} / 50</div>
                    </label>
                    <label htmlFor="profile-bio-modal" className="input-label">
                        <textarea className="inputs profile-bio" type="text" id="profile-bio-modal" value={profileBio} onChange={handleBio}/>
                        <div className={profileBio.length ? "label-text" : "label-text expanded"}>Bio</div>
                        <div className="letter-count">{profileBio.length} / 160</div>
                    </label>
                    <label htmlFor="profile-location-modal" className="input-label">
                        <input className="inputs" type="text" id="profile-location-modal" value={profileLocation} onChange={handleLocation} />
                        <div className={profileLocation.length ? "label-text" : "label-text expanded"}>Location</div>
                        <div className="letter-count">{profileLocation.length} / 30</div>
                    </label>
                </div>
            </Modal>
            }<div className="return-tweet-exp tweet" onClick={() => navigate(-1)}>
                <div className="wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-left</title><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" /></svg>
                </div>
                <div className="profile-header">
                    <div className="profile-header-name">{user.name}</div>
                    <div className="profile-tweets-count">{user.tweets_count} {user.tweets_count === 1 ? 'Tweet': 'Tweets'}</div>
                </div>
            </div>
            <div className="banner">
                {user.profile_banner && <img src={user.profile_banner} alt="" className='profile-banner' />}
            </div>
            <div className="profile">
                <div className="profile-opt">
                    <div className="profile-pic-container">
                        <img src={user.profile_pic} alt="" className='profile-pic'/>
                    </div>
                    <button className="edit-profile" ref={editRef}>Edit profile</button>
                </div>
                <div className="profile-ids">
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-tag">@{user.tag}</div>
                </div>
                {user.bio && <div className="profile-bio">{user.bio}</div>}
                <div className="profile-creation-date">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="calendar-svg"><g><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></g></svg>
                    Joined {new Date(user.created_at).toString().slice(4, 7)} {new Date(user.created_at).toString().slice(11, 15)}
                </div>
                <div className="profile-track">
                    <div className="profile-following">
                        <span className="count">{user.following_count}</span> Following
                    </div>
                    <div className="profile-followers">
                        <span className="count">{user.followers_count}</span> Followers
                    </div>
                </div>
            </div>

            <div className="profile-navbar">
                <NavLink to={`.`} end={`${url.profileTag}`} className='profile-link'><span className="link-wrapper">Tweets</span></NavLink>
                <NavLink to={`./with_replies`} className='profile-link'><span className="link-wrapper">Tweets & replies</span></NavLink>
                <NavLink to={`./media`} className='profile-link'><span className="link-wrapper">Media</span></NavLink>
                <NavLink to={`./likes`} className='profile-link'><span className="link-wrapper">Likes</span></NavLink>
            </div>
            <Routes>
                <Route path={'/'} element={<Tweets />} />
                <Route path={'/with_replies'} element={<TweetsAndReplies />} />
            </Routes>
        </main>
    )
}

export default Profile