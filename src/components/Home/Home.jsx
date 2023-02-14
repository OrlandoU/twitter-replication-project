import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
} from 'firebase/firestore';
import Tweet from '../Tweet/Tweet';
import '../../assets/css/Home.css'
import TweetRep from '../Tweet/TweetRep';
import { useEffect, useState } from 'react';
import Loader from '../Loader';
import RightBar from './RightBar';
import Thread from '../Tweet/Thread';

function Home() {
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), orderBy('created_at', 'desc'))
        const tweets = await getDocs(q)
        setTweets(tweets.docs)
        setLoading(false)
    }

    useEffect(() => {
        fetchTweets()
        document.body.style.display = 'block'
    }, [])


    return (
        <>
            <main className='home'>

                {loading ?
                    <Loader /> :
                    <>
                        <h1>Home</h1>
                        <TweetRep />
                        {tweets.map(tweet => (
                            tweet.data().thread_size < 3 ? <Thread thread={tweet.id} /> : <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.id} />
                        ))}
                    </>}

            </main>
            <RightBar />
        </>
    )
}

export default Home