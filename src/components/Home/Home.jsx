import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
    onSnapshot,
} from 'firebase/firestore';
import Tweet from '../Tweet/Tweet';
import '../../assets/css/Home.css'
import TweetRep from '../Tweet/TweetRep';
import { useEffect, useState } from 'react';

function Home() {
    const [tweets, setTweets] = useState([])

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), orderBy('created_at', 'desc'))
        const tweets = await getDocs(q)
        onSnapshot(q, (docs) => setTweets(docs.docs))
        setTweets(tweets.docs)
    }

    useEffect(() => {
        fetchTweets()
    }, [])

    return (
        <main className='home'>
            <h1>Home</h1>
            <TweetRep />
            {tweets.map(tweet => (
                <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.id} />
            ))}
        </main>
    )
}

export default Home