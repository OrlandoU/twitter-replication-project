import { doc, getDoc, getFirestore } from "firebase/firestore"
import { forwardRef, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"

const UserPreview = forwardRef(({ id, children, time, className, path, main = false, cb, data, retweeted_by, isModal, isFirstMessage }, ref) => {
    const mainUser = useContext(UserContext)
    const [user, setUser] = useState({})
    const navigate = useNavigate()

    const fetchUser = async (id) => {
        try {
            const user = await getDoc(doc(getFirestore(), 'users', id))
            setUser(user.data())
        } catch (error) {
            console.error('Error fetching user', error)
        }

    }
    const convertTime = (time) => {
        let hours = Math.abs(new Date().getTime() - time) / 36e5;
        if (hours < 1) {
            if (hours * 60 < 2) {
                return Math.trunc((hours * 60) * 60) + 's'
            }
            return Math.trunc(hours * 60) + 'min'
        } else if (hours > 24) {
            let date = (new Date(time).toDateString()).split(' ')
            return date[1] + date[2
            ]
        }
        return Math.trunc(hours) + 'h'
    }

    const handleClick = () => {
        if (!path) {
            if (cb) cb(id)
        }
        if (!isModal) {

            navigate(path)
        }
    }

    const handleProfile = (e) => {
        e.stopPropagation()
        navigate('/' + user.tag)
    }

    useEffect(() => {
        if (data) {
            setUser(data)
        } else {
            fetchUser(id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (isFirstMessage) {
        return (
            <div className="main-tweet first-message" ref={ref}>
                <div className="main-tweet-header first-message">
                    <img src={user.profile_pic} alt="User Profile" className="tweet-profile-pic" />
                    <div className="main-tweet-names">
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-tag">@{user.tag}</div>
                    </div>
                    {user.bio && <div className="profile-bio">{user.bio}</div>}
                    <div className="profile-creation-date">
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="calendar-svg"><g><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></g></svg>
                        Joined {new Date(user.created_at).toString().slice(4, 7)} {new Date(user.created_at).toString().slice(11, 15)}
                    </div>
                </div>
                {children}
            </div>
        )
    }

    return (
        <>
            {
                !main ?
                    <div className={className} onClick={handleClick}>
                        {retweeted_by &&
                            <div className="retweeted-header">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="retweeted-svg"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                <div className="tweet-username" onClick={(e) => {
                                    e.stopPropagation()
                                    navigate('/' + retweeted_by.tag)
                                }}>{mainUser.user && retweeted_by.tag === mainUser.user.tag ? 'You' : retweeted_by.name} Retweeted</div>
                            </div>
                        }
                        <div className="tweet-wrapper">
                            <div className="side-tweet">
                                <img className="tweet-profile-pic" src={user.profile_pic} alt="" />
                            </div>
                            <div className="main-tweet-content">
                                <div className={"tweet-header"}>
                                    <div className="tweet-username" onClick={handleProfile}>{user.name}</div>
                                    <div className="tweet-usertag">@{user.tag}</div>
                                    {time && <div className="tweet-timestamp">· {convertTime(time)}</div>}
                                </div>
                                {children}
                            </div>
                        </div>
                    </div> : <div className="main-tweet" ref={ref}>
                        <div className="main-tweet-header">
                            <img src={user.profile_pic} alt="User Profile" className="tweet-profile-pic" />
                            <div className="main-tweet-names">
                                <div className="main-tweet-name tweet-username" onClick={handleProfile}>{user.name}</div>
                                <div className="main-tweet-tag tweet-usertag">@{user.tag}</div>
                            </div>
                            <div className="options"></div>
                        </div>
                        {children}
                    </div>
            }
        </>
    )
})

export default UserPreview