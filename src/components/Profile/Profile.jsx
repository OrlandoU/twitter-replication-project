import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom"
import '../../assets/css/Profile.css'
import Loader from "../Loader"
import Tweets from "./Tweets"
import TweetsAndReplies from "./TweetsAndReplies"

function Profile() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const url = useParams()

    const fetchUser = async () => {
        const user = await getDocs(query(collection(getFirestore(), 'users'), where('tag', '==', url.profileTag)))
        setUser(user.docs[0].data())
    }


    useEffect(() => {
        fetchUser()
    }, [])

    if (!user.name) {
        return (
            <main><Loader /></main>
        )
    }


    return (
        <main className="heightened">
            
            <div className="return-tweet-exp tweet" onClick={() => navigate(-1)}>
                <div className="wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-left</title><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" /></svg>
                </div>
                <div className="profile-header">
                    <div className="profile-header-name">{user.name}</div>
                    <div className="profile-tweets-count">{user.tweets_count} {user.tweets_count === 1 ? 'Tweet': 'Tweets'}</div>
                </div>
            </div>
            <div className="banner"></div>
            <div className="profile">
                <div className="profile-opt">
                    <div className="profile-pic-container">
                        <img src={user.profile_pic} alt="" className='profile-pic'/>
                    </div>
                    <button className="edit-profile">Edit profile</button>
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
                        <span className="count">{user.following_count}</span> Followers
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