import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    setDoc,
    doc,
    updateDoc,
    increment,
    onSnapshot,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import Tweet from '../Main/Tweet';
import '../../assets/css/Home.css'
import { UserContext } from '../../UserContext';
import stopWords from '../../Stop-Words'

function Home() {
    const [tweets, setTweets] = useState([])
    const user = useContext(UserContext).user

    const createTweet = async (content = "Howdy shawty", parentId = null, parent_tweet_name = null) => {
        try {
            await addDoc(collection(getFirestore(), 'tweets'), {
                userId: user.tag,
                username: user.name,
                user_profile_pic: 'https://cdn.britannica.com/91/181391-050-1DA18304/cat-toes-paw-number-paws-tiger-tabby.jpg',
                parent_tweet: parentId,
                parent_tweet_user: parent_tweet_name,
                direct_child_tweet: null,
                retweeted_by: [],
                viewers: [],
                liked_by: [],
                replied_by: [],
                replies_count:0,
                content: content,
                created_at: new Date().getTime(),
                keywords_arr: content.split(' ').map(word => word.toLowerCase())
            })
        } catch (error) {
            console.error('Error creating tweet', error)
        }


        let keywords = content.split(' ').map(word => word.toLowerCase())
        keywords.forEach(async keyword => {
            if(stopWords.includes(keyword) ){
                return 
            }
            try {
                await updateDoc(doc(getFirestore(), 'trends', keyword), {
                    count: increment(1)
                })
            } catch (error) {
                await setDoc(doc(getFirestore(), 'trends', keyword), {
                    count: 1
                })
            }
            
        })

        if(parentId){
            await updateDoc(doc(getFirestore(), 'tweets', parentId), {
                replies_count: increment(1)
            })
        }

    }

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
            <button onClick={()=>createTweet()}>Generate Tweet</button>
            {tweets.map(tweet => (
                <Tweet tweetData={tweet.data()} key={tweet.id} id={tweet.id} createTweet={createTweet}/>
            )
            )}
        </main>
    )
}

export default Home