import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { useEffect } from "react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import Tweet from "../Tweet/Tweet"

function Top() {
    const url = useParams()
    const [tweets, setTweets] = useState([])

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), where('search_substring', 'array-contains', url.query), orderBy('views', 'desc'), orderBy('likes', 'desc'))
        const docs = await getDocs(q)
        setTweets(docs.docs)
    }

    useEffect(() => {
        fetchTweets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        tweets.map(tweet => (
            <Tweet tweetData={tweet.data()} id={tweet.id} />
        ))
    )
}

export default Top