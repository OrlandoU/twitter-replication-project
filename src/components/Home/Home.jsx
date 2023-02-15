import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
    onSnapshot,
    where,
} from 'firebase/firestore';
import Tweet from '../Tweet/Tweet';
import '../../assets/css/Home.css'
import TweetRep from '../Tweet/TweetRep';
import { useEffect, useState } from 'react';
import Loader from '../Loader';
import RightBar from './RightBar';
import Thread from '../Tweet/Thread';
import { useContext } from 'react';
import { UserContext } from '../../Contexts/UserContext';

function Home() {
    const user = useContext(UserContext).user
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), orderBy('created_at', 'desc'))
        const tweets = await getDocs(q)
        setTweets(tweets.docs)
        setLoading(false)
    }

    const reload = () => {
        fetchTweets()
        console.log(tweets)
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
                        <TweetRep reload={reload}/>
                        {tweets.map(tweet => (
                            (tweet.data().thread_size < 3 && tweet.data().thread_size !== 0) ? <Thread thread={tweet.id} /> : <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.id} />
                        ))}
                    </>}

            </main>
            <RightBar />
        </>
    )
}

export default Home