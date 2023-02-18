import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, getFirestore, increment, setDoc, updateDoc } from "firebase/firestore";
import HTMLReactParser from "html-react-parser";
import { useContext, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { UserContext } from "../../Contexts/UserContext";
import Loader from "../Loader";
import UserPreview from "../Main/UserPreview";
import Modal from "../Modal";
import TweetRep from "./TweetRep";

function Tweet({ tweetData, index = 0, id, isParent, isModal, tweetId, profile }) {
    const replyRef = useRef()
    const closeRef = useRef()
    const [tweet, setTweet] = useState({})
    const user = useContext(UserContext)
    const [ref, inView] = useInView({ threshold: 1, triggerOnce: true })
    const [viewed, setViewed] = useState(false)
    const [liked, setLiked] = useState(false)
    const [likes, setLikes] = useState()
    const [retweets, setRetweets] = useState()
    const [retweeted, setRetweeted] = useState(false)
    const [bookmarked, setBookmarked] = useState(true)
    const [pinned, setPinned] = useState(false)


    const handleLike = async (e) => {
        e.stopPropagation()
        if (!user.user) return false
        if (liked) {
            setLiked(false)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                liked_by: arrayRemove(user.user.tag),
                likes: increment(-1)
            })
            await updateDoc(doc(getFirestore(), 'notifications', (id || tweetId) + '-likes'), {
                users: arrayRemove(user.user.id)
            })
        } else {
            setLiked(true)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                liked_by: arrayUnion(user.user.tag),
                likes: increment(1)
            })
            if (!(tweet.userTag === user.user.tag)) {
                await updateDoc(doc(getFirestore(), 'notifications', (id || tweetId) + '-likes'), {
                    users: arrayUnion(user.user.id),
                    updated_at: new Date().getTime()
                })
            }
        }
    }

    const handleRetweet = async (e) => {
        e.stopPropagation()
        if (!user.user) return false
        if (retweeted) {
            setRetweeted(false)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                retweeted_by: arrayRemove(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'users', user.user.id), { tweets_count: increment(-1) })
            await deleteDoc(doc(getFirestore(), 'tweets', (id || tweetId) + user.user.id))
            await updateDoc(doc(getFirestore(), 'notifications', (id || tweetId) + '-retweets'), {
                users: arrayRemove(user.user.id)
            })
        } else {
            setRetweeted(true)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                retweeted_by: arrayUnion(user.user.tag)
            })
            await updateDoc(doc(getFirestore(), 'users', user.user.id), { tweets_count: increment(1) })
            await setDoc(doc(getFirestore(), 'tweets', (id || tweetId) + user.user.id), {
                userId: user.user.id,
                userTag: user.user.tag,
                userName: user.user.name,
                created_at: new Date().getTime(),
                retweeted_tweet: id,
                parent_tweet: null
            })
            if (!(tweet.userTag === user.user.tag)) {
                await updateDoc(doc(getFirestore(), 'notifications', (id || tweetId) + '-retweets'), {
                    users: arrayUnion(user.user.id),
                    updated_at: new Date().getTime()
                })
            }
        }
    }
    const handleReply = (e) => {
        e.stopPropagation()

    }

    const handleView = async () => {
        if (inView) {
            try {
                await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                    viewers: arrayUnion(user.user.tag),
                    views: increment(1)
                })
                setViewed(true)
            } catch (error) {
                console.error('Error updating view count', error)
            }

        }
    }

    const handleBookmark = async () => {
        if (bookmarked) {
            setBookmarked(false)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                bookmarked_by: arrayRemove(user.user.tag),
            })
        } else {
            setBookmarked(true)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                bookmarked_by: arrayUnion(user.user.tag),
            })
        }
    }

    const handlePinned = async () => {
        if (pinned) {
            setPinned(false)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                pinned: false,
            })
        } else {
            setPinned(true)
            await updateDoc(doc(getFirestore(), 'tweets', (id || tweetId)), {
                pinned: true,
            })
        }
    }

    const fetchTweetData = async (id) => {
        const data = await getDoc(doc(getFirestore(), 'tweets', id))

        setTweet(data.data())
    }

    useEffect(() => {
        if (user.user && !viewed) {
            handleView()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView])

    useEffect(() => {
        if (user.user && tweet.userId) {
            if (tweet.liked_by.includes(user.user.tag)) {
                setLikes(tweet.liked_by.length - 1)
            } else {
                setLikes(tweet.liked_by.length)
            }

            if (tweet.retweeted_by.includes(user.user.tag)) {
                setRetweets(tweet.retweeted_by.length - 1)
            } else {
                setRetweets(tweet.retweeted_by.length)
            }

            setPinned(tweet.pinned)
            setBookmarked(tweet.bookmarked_by.includes(user.user.tag))
            setLiked(tweet.liked_by.includes(user.user.tag))
            setRetweeted(tweet.retweeted_by.includes(user.user.tag))
        } else if (tweet.userId) {
            setLikes(tweet.liked_by.length)
            setRetweets(tweet.retweeted_by.length)

        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.user, tweet])

    useEffect(() => {
        if (tweetId) {
            fetchTweetData(tweetId)
        }
        else if (tweetData.retweeted_tweet) {
            fetchTweetData(tweetData.retweeted_tweet)
        } else {
            setTweet(tweetData)
        }
    }, [])

    if (!tweet.userId) return

    if (tweet.id) {
        return <Loader />
    }

    return (
        <>
            {!isModal &&
                <Modal refToObject={replyRef} className={'tweet-modal'} ref={closeRef}>
                    <Tweet tweetData={tweet} isParent isModal />
                    <TweetRep parentId={id} parentName={tweet.userTag} ancestorUser={tweet.parent_tweet_user} closeRef={closeRef} isModaled />
                </Modal>}
            <UserPreview
                profile={profile}
                handlePinned={handlePinned}
                pinned={pinned}
                bookmarked={bookmarked}
                handleBookmark={handleBookmark}
                hasOptions={true}
                className={isParent ? "tweet tweet-parent" : 'tweet'}
                path={`/${tweet.userTag}/status/${(id || tweetId)}`}
                id={tweet.userId}
                time={tweet.created_at}
                retweeted_by={(tweetData && tweetData.retweeted_tweet) ? { tag: tweetData.userTag, name: tweetData.userName } : null}
                isModal={isModal}>

                {(tweet.parent_tweet_user && (index === 0)) && (
                    <div className="tweet-replied">
                        Replying to <a href={`#/${tweet.parent_tweet_user}`} className="tag">@{tweet.parent_tweet_user}</a>
                    </div>
                )}
                <div className="tweet-content" ref={ref}>{HTMLReactParser(tweet.content)}</div>
                {tweet.media_url && tweet.media_url.length > 0 && <div className="tweet-media">
                    {tweet.media_url.map(media => (
                        <div className="tweet-media-wrapper">
                            <img src={media} alt="Tweet media" key={media} />
                        </div>
                    ))}
                </div>}
                {!isModal && <div className="tweet-interact">
                    <div className="comment" onClick={handleReply} ref={replyRef}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                        {tweet.replies_count || ''}
                    </div>
                    <div onClick={handleRetweet} class={retweeted ? "retweeted retweet" : "retweet"}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                        {retweets + (+retweeted) || ''}
                    </div>
                    <div onClick={handleLike} class={liked ? 'liked like' : 'like'}>
                        {liked ? <div class="liked like-button">
                            <div class="heart-bg">
                                <div class={!liked ? "heart-icon" : "liked heart-icon"}></div>
                            </div>
                        </div> : <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>}
                        {likes + (+liked) || ''}
                    </div>
                </div>}
            </UserPreview>

        </>
    )
}

export default Tweet