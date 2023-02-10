import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
    getDoc,
} from 'firebase/firestore';
import Tweet from '../Tweet/Tweet';
import '../../assets/css/Home.css'
import TweetRep from '../Tweet/TweetRep';
import { useContext, useEffect, useRef, useState } from 'react';
import Loader from '../Loader';
import RightBar from './RightBar';
import Thread from '../Tweet/Thread';
import { UserContext } from '../../Contexts/UserContext';
import Signin from '../Main/Signin';
import Modal from '../Modal';
import Login from '../Main/Login';

function Home() {
    const loginRef = useRef()
    const registerRef = useRef()
    const user = useContext(UserContext).user
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [count, setCount] = useState(0)

    const fetchTweets = async () => {
        const q = query(collection(getFirestore(), 'tweets'), orderBy('created_at', 'desc'))
        const tweets = await getDocs(q)
        setTweets(tweets.docs)
        setLoading(false)
    }

    useEffect(() => {
        fetchTweets()
    }, [])


    return (
        <>
            <main className='home'>
                <div className="login-footer">
                    <div className="login-wrapper">
                        <div className="login-text">
                            <div className="header">Don't miss what's happening</div>
                            <div className="sub-header">Twitter users are the first to know.</div>
                        </div>
                        <div className="login-footer-buttons">
                            <button ref={loginRef} onClick={()=>setCount(prev=>prev + 1)}>Login</button>
                            <button ref={registerRef}>Register</button>
                        </div>
                    </div>
                </div>
                <Modal refToObject={loginRef} className={'signin'}>
                    <Login key={count}/>
                </Modal>
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