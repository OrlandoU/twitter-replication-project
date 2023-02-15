import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import Loader from "../Loader"
import Tweet from '../Tweet/Tweet'

function Mention() {
    const user = useContext(UserContext).user
    const [mentions, setMentions] = useState([])
    const [loaded, setLoaded] = useState(false)

    const fetchTweets = async () => {
        try {
            console.log(user.tag)
            const q = query(collection(getFirestore(), 'notifications'), where('userTag', '==', user.tag), where('type', '==', 'mention' ), orderBy('updated_at', 'desc'))
            const notification = await getDocs(q)
            console.log(notification)
            setMentions(notification.docs)
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
                mentions.map((mention) => (
                    <Tweet tweetId={mention.data().tweetId} />
                ))
            }
        </>
    )
}

export default Mention