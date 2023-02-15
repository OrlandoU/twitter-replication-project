import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, getFirestore, increment, setDoc, updateDoc } from "firebase/firestore"
import { useRef } from "react"
import { forwardRef, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"
import Opt from "../Opt"

const UserPreview = forwardRef(({ id, children, time, className, path, main = false, cb, data, retweeted_by, isModal, isFirstMessage, hasOptions, bookmarked, handleBookmark }, ref) => {
    const mainUser = useContext(UserContext)
    const optionRef = useRef()
    const [user, setUser] = useState({})
    const [userRef, setUserRef] = useState({})
    const navigate = useNavigate()

    const fetchUser = async (id) => {
        try {
            const user = await getDoc(doc(getFirestore(), 'users', id))
            setUser(user.data())
            setUserRef(user)
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

    const handleFollow = async (userRef) => {
        const userData = userRef.data()
        try {
            if (!userData.followers.includes(mainUser.user.tag)) {
                await updateDoc(userRef.ref, {
                    followers: arrayUnion(mainUser.user.tag),
                    followers_count: increment(1)
                })
                await updateDoc(doc(getFirestore(), 'users', mainUser.user.id),
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
                    followers: arrayRemove(mainUser.user.tag),
                    followers_count: increment(-1)
                })
                await updateDoc(doc(getFirestore(), 'users', mainUser.user.id),
                    { following_count: increment(-1) }
                )
                await deleteDoc(doc(getFirestore(), 'notifications', userRef.id + 'follow'))
            }

            let userUpdated = await getDoc(userRef.ref)
            setUser(userUpdated.data())
            setUserRef(userUpdated)
        } catch (error) {
            console.error('Error handling follow request', error)
        }
    }

    const isFallowing = (userData) => {
        return userData.followers.includes(mainUser.user.tag)
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
                                    {hasOptions &&
                                        <div className="tweet-options" ref={optionRef} onClick={(e) => e.stopPropagation()}>
                                            <Opt triggerRef={optionRef}>
                                                {user.id &&
                                                    <>
                                                        <div className="option" onClick={() => handleFollow(userRef)}>
                                                            <svg viewBox="0 0 24 24" aria-hidden="true" class="option-svg"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>
                                                            {isFallowing(user) ? "Unfollow @" + user.tag : "Follow @" + user.tag}
                                                        </div>
                                                        <div className="option" onClick={handleBookmark}>
                                                            <svg viewBox="0 0 24 24" aria-hidden="true" class="option-svg"><g><path d="M17 3V0h2v3h3v2h-3v3h-2V5h-3V3h3zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V11h2v11.94l-8-5.71-8 5.71V4.5C4 3.12 5.119 2 6.5 2h4.502v2H6.5z"></path></g></svg>
                                                            {bookmarked ? 'Remove Tweet from Bookmarks': 'Bookmark'}
                                                        </div>
                                                    </>
                                                }
                                            </Opt>
                                            <svg viewBox="0 0 24 24" aria-hidden="true" class="sub-options"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                                        </div>}
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