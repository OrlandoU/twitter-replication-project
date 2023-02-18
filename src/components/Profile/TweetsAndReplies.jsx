import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Tweet from "../Tweet/Tweet"

function TweetsAndReplies(){
    const [tweets, setTweets] = useState([])
    const url = useParams()

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), where('userTag', '==', url.profileTag), orderBy('pinned'), orderBy('created_at', 'desc'))
        const tweets = await getDocs(q)
        setTweets(tweets.docs)
    }

    useEffect(() => {
        fetchTweets()
    }, [])

    return (
        <>
            {
                tweets.map(tweet => (
                    <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.data().retweeted_tweet || tweet.id} profile />
                ))
            }
        </>
    )
}

export default TweetsAndReplies