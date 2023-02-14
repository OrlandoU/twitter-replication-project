import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import Loader from "../Loader"
import Notification from "./Notification"

function All() {
    const user = useContext(UserContext).user
    const [notifications, setNotifications] = useState([])
    const [loaded, setLoaded] = useState(false)

    const fetchTweets = async () => {
        try {
            const q = query(collection(getFirestore(), 'notifications'), where('userTag', '==', user.tag), orderBy('updated_at', 'desc'))
            const notification = await getDocs(q)
            setNotifications(notification.docs)
            setLoaded(true)
        } catch (error) {
            console.error('Error fetching notifications', error)
        }

    }

    useEffect(() => {
        if (user) {
            fetchTweets()
        }
    }, [user])

    if (!loaded) {
        return <Loader />
    }

    return (
        <>
            {
                notifications.map((noti, index) => (
                    <Notification data={noti.data()} key={index} collectionRef={noti.ref}/>
                ))
            }
        </>
    )
}

export default All