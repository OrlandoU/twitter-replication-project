import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore"
import { useContext } from "react"
import { useEffect, useRef } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"

function Notification({ data, collectionRef }) {
    const [loading, setLoading] = useState(false)
    const [typeSvg, setTypeSvg] = useState()
    const [users, setUsers] = useState([])
    const user = useContext(UserContext).user
    const navigate = useNavigate()
    const mounted = useRef()

    const fetchUsers = async () => {
        for (let user of data.users) {
            if (users.length === 14) return
            let userData = await getDoc(doc(getFirestore(), 'users', user))
            setUsers(prev => [...prev, userData.data()])
        }
        setLoading(true)
    }

    const getSvg = () => {
        if (data.type === 'likes') {
            setTypeSvg(<svg viewBox="0 0 24 24" aria-hidden="true" class="notification-svg like"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>)
        } else if (data.type === 'retweets') {
            setTypeSvg(<svg viewBox="0 0 24 24" aria-hidden="true" class="notification-svg retweet"><g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g></svg>)
        }
    }

    const handleView = async () => {
        await updateDoc(collectionRef, {
            viewed: true,
        })
    }

    const navigateToTweet = () => {
        if(data.tweetId){
            navigate(`/${user.tag}/status/${data.tweetId}`)
        }
    }

    useEffect(() => {
        if(!mounted.current){
            getSvg()
            fetchUsers()
            handleView()
            mounted.current = true
        }
    }, [])

    if (!data.users.length) {
        return null
    }

    if(!loading){
        return null
    }

    return (
            <>
                <div className='tweet noti-wrapper' onClick={navigateToTweet}>
                    <div className="tweet-wrapper">
                        <div className="side-tweet">
                            {typeSvg}
                        </div>
                        <div className="main-tweet-content">
                            <div className="notifications-users">
                                {users.map(user => (
                                    <img src={user.profile_pic} alt="notification user minimized" />
                                ))}
                            </div>
                            <div className={"tweet-header"}>
                                <div>
                                <span className="noti-name">{users[0].name}</span> {users.length === 2 && ' and '} {users.length === 2 && <span className="noti-name">{users[1].name}</span>} {users.length > 2 && ' and others '} {data.text}
                                </div>
                            </div>
                            <div className="noti-tweet-content">
                                {data.tweetContent}
                            </div>
                        </div>
                    </div>
                </div>
            </>
    )
}

export default Notification