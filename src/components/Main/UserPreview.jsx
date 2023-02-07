import { doc, getDoc, getFirestore } from "firebase/firestore"
import { forwardRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const UserPreview = forwardRef(({ id, children, time, className, path, main = false, cb, data }, ref) => {
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
        navigate(path)
    }

    useEffect(() => {
        if (data) {
            console.log(data)
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
                        <div className="side-tweet">
                            <img className="tweet-profile-pic" src={user.profile_pic} alt="" />
                        </div>
                        <div className="main-tweet-content">
                            <div className={"tweet-header"}>
                                <div className="tweet-username">{user.name}</div>
                                <div className="tweet-usertag">@{user.tag}</div>
                                {time && <div className="tweet-timestamp">· {convertTime(time)}</div>}
                            </div>
                            {children}
                        </div>
                    </div> : <div className="main-tweet" ref={ref}>
                        <div className="main-tweet-header">
                            <img src={user.profile_pic} alt="User Profile" className="tweet-profile-pic" />
                            <div className="main-tweet-names">
                                <div className="main-tweet-name tweet-username">{user.name}</div>
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