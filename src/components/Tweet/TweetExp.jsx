import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore"
import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import '../../assets/css/TweetExp.css'
import { UserContext } from "../../Contexts/UserContext"
import Tweet from "./Tweet"
import HTMLReactParser from "html-react-parser";
import TweetRep from "./TweetRep"
import UserPreview from "../Main/UserPreview"
import Loader from "../Loader"
import Thread from "./Thread"


function TweetExp() {
    const hasMounted = useRef()
    const mainTweetRef = useRef()
    const expRef = useRef()
    const user = useContext(UserContext)
    const urlParams = useParams()
    const navigate = useNavigate()
    const [tweet, setTweet] = useState({})
    const [tweetId, setTweetId] = useState()
    const [parentTweets, setParentTweets] = useState({})
    const [replies, setReplies] = useState([])
    const [myReplies, setMyReplies] = useState([])
    const [loaded, setLoaded] = useState(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchMainTweet = async () => {
        let tweet = await getDoc(doc(getFirestore(), 'tweets', urlParams.tweetId))
        onSnapshot(doc(getFirestore(), 'tweets', urlParams.tweetId), (data) => setTweet(data.data()))
        fetchParentTweets(tweet.data().parent_tweet)
        fetchReplies(tweet.data().userTag)
        fetchMyReplies(tweet.data().userTag)
        setTweetId(tweet.id)
        setTweet(tweet.data())
    }

    const fetchParentTweets = async (id) => {
        if (!id) return
        try {
            let tweetData = await getDoc(doc(getFirestore(), 'tweets', id))
            setParentTweets(prevState => ({ ...prevState, [id]: { data: tweetData.data(), id } }))

            onSnapshot(doc(getFirestore(), 'tweets', id), (data) => {
                setParentTweets(prevState => ({ ...prevState, [id]: { data: data.data(), id } }))
            })
            fetchParentTweets(tweetData.data().parent_tweet)
        } catch (error) {
            console.error('Error fetching parent tweet', error)
        }
    }

    const fetchReplies = async (id) => {
        try {
            let q = query(collection(getFirestore(), 'tweets'), orderBy('userTag'), orderBy('thread_size', 'desc'), orderBy('likes', 'desc'), orderBy('views', 'desc'), where('parent_tweet', '==', urlParams.tweetId), where('userTag', '!=', id), limit(20))
            let tweetReplies = await getDocs(q)
            setReplies(tweetReplies.docs)
            setLoaded(true)
        } catch (error) {
            console.error('Error fetching tweet replies', error)
        }
    }

    const fetchMyReplies = async (id) => {
        try {
            let q = query(collection(getFirestore(), 'tweets'), where('parent_tweet', '==', urlParams.tweetId), where('userTag', '==', id), orderBy('created_at'))
            let tweet = await getDocs(q)
            setMyReplies(tweet.docs)
            onSnapshot(q, (data) => (setMyReplies(data.docs)))
        } catch (error) {
            console.error('Error fetching tweet replies', error)
        }
    }

    useEffect(() => {
        if (!hasMounted.current) {
            fetchMainTweet()
            hasMounted.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!loaded) return
        expRef.current.style.minHeight = (window.innerHeight + (Object.keys(parentTweets).length * 800)) + 'px'
        mainTweetRef.current.scrollIntoView({ block: 'start' })
    }, [loaded, parentTweets])

    const handleReply = (e) => {
        e.stopPropagation()
    }

    const handleLike = async (e) => {
        e.stopPropagation()
        if (!user.user) return false
        if (isLiked()) {
            await updateDoc(doc(getFirestore(), 'tweets', tweetId), {
                liked_by: arrayRemove(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'notifications', tweetId + '-likes'), {
                users: arrayRemove(user.user.id),
            })
        } else {
            await updateDoc(doc(getFirestore(), 'tweets', tweetId), {
                liked_by: arrayUnion(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'notifications', tweetId + '-likes'), {
                users: arrayUnion(user.user.id),
                updated_at: new Date().getTime()
            })
        }
    }

    const handleRetweet = async (e) => {
        e.stopPropagation()
        if (!user.user) return false
        if (isRetweeted()) {
            await updateDoc(doc(getFirestore(), 'tweets', tweetId), {
                retweeted_by: arrayRemove(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'users', user.user.id), { tweets_count: increment(-1) })
            await updateDoc(doc(getFirestore(), 'notifications', tweetId + '-retweets'), {
                users: arrayRemove(user.user.id)
            })
            await deleteDoc(doc(getFirestore(), 'tweets', tweetId + user.user.id))
        } else {
            await updateDoc(doc(getFirestore(), 'notifications', tweetId + '-retweets'), {
                users: arrayUnion(user.user.id),
                updated_at: new Date().getTime()
            })
            await updateDoc(doc(getFirestore(), 'tweets', tweetId), {
                retweeted_by: arrayUnion(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'users', user.user.id), { tweets_count: increment(1) })

            await setDoc(doc(getFirestore(), 'tweets', tweetId + user.user.id), {
                userId: user.user.id,
                userTag: user.user.tag,
                userName: user.user.name,
                created_at: new Date().getTime(),
                retweeted_tweet: tweetId,
                parent_tweet: null
            })
        }
    }

    const isLiked = () => {
        if (!user.user || !tweet.liked_by) return false
        return tweet.liked_by.includes(user.user.tag)
    }

    const isRetweeted = () => {
        if (!user.user || !tweet.retweeted_by) return false
        return tweet.retweeted_by.includes(user.user.tag)
    }
    if (!loaded) {
        return (
            <main>
                <Loader />

            </main>
        )
    }

    return (
        <main className="tweet-exp" ref={expRef}>
            <div className="return-tweet-exp tweet" onClick={() => navigate(-1)}>
                <div className="wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-left</title><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" /></svg>
                </div>
                <span>Tweet</span>
            </div>
            {Object.keys(parentTweets).sort((a, b) => {
                return parentTweets[a].data.created_at - parentTweets[b].data.created_at
            })
                .map(key => (
                    <Tweet tweetData={parentTweets[key].data} id={parentTweets[key].id} isParent key={key} />
                ))}
            <UserPreview
                id={tweet.userId}
                time={tweet.created_at}
                ref={mainTweetRef}
                main>
                {tweet.parent_tweet_user && (
                    <div className="tweet-replied">
                        Replying to <a className="tag" href={`#/${tweet.parent_tweet_user}`}>{tweet.parent_tweet_user}</a>
                    </div>
                )}
                <div className="main-tweet-main-content">{tweet.content ? HTMLReactParser(tweet.content) : null}</div>
                {((tweet.replied_by || tweet.retweeted_by || tweet.liked_by) && (tweet.replied_by.length > 0 || tweet.retweeted_by.length > 0 || tweet.liked_by.length > 0))
                    && <div className="main-tweet-meta">
                        {tweet.replies_count ? <div className="main-replies"><span className="bold">{tweet.replies_count}</span> {tweet.replies_count > 1 ? 'Replies' : 'Reply'}</div> : null}
                        {tweet.retweeted_by && tweet.retweeted_by.length ? <div className="main-retweets"><span className="bold">{tweet.retweeted_by.length}</span> {tweet.retweeted_by.length > 1 ? "Retweets" : "Retweet"}</div> : null}
                        {tweet.liked_by && tweet.liked_by.length ? <div className="main-likes"><span className="bold">{tweet.liked_by.length}</span> {tweet.liked_by.length > 1 ? 'Likes' : 'Like'}</div> : null}
                    </div>}
                {tweet.media_url && tweet.media_url.length > 0 && <div className="tweet-media">
                    {tweet.media_url.map(media => (
                        <div className="tweet-media-wrapper">
                            <img src={media} alt="Tweet media" key={media} />
                        </div>
                    ))}
                </div>}
                <div className="main-tweet-wrapper">
                    <div className="main-tweet-interact">
                        <div className="comment" onClick={handleReply}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>

                        </div>
                        <div onClick={handleRetweet} class={isRetweeted() ? "retweeted retweet" : "retweet"}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                            {tweet.retweeted_by && (tweet.retweeted_by.length || '')}
                        </div>
                        <div onClick={handleLike} class={isLiked() ? 'liked like' : 'like'}>
                            {isLiked() ? <div class="liked like-button">
                                <div class="heart-bg">
                                    <div class={!isLiked() ? "heart-icon" : "liked heart-icon"}></div>
                                </div>
                            </div> : <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>}


                        </div>
                    </div>
                </div>
            </UserPreview>

            {user.user && <TweetRep parentId={tweetId} parentName={tweet.userTag} ancestorUser={tweet.parent_tweet_user} />}
            {myReplies.concat(replies).map(tweet => (
                tweet.data().thread_children.length ? <Thread thread={tweet.id} /> : <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.id} />
            ))}
        </main>
    )
}

export default TweetExp