import { doc, getDoc, getFirestore } from "firebase/firestore"
import { forwardRef, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"

const UserPreview = forwardRef(({ id, children, time, className, path, main = false, cb, data, retweeted_by, isModal }, ref) => {
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
        if(!isModal){

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

    return (
        <>
            {
                !main ?
                    <div className={className} onClick={handleClick}>
                        {retweeted_by && 
                        <div className="retweeted-header">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="retweeted-svg"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                <div className="tweet-username" onClick={(e)=>{
                                    e.stopPropagation()
                                    navigate('/' + retweeted_by.tag)
                                }}>{retweeted_by.tag === mainUser.user.tag ? 'You' : retweeted_by.name} Retweeted</div>
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