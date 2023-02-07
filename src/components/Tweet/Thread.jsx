import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import Tweet from "./Tweet"

function Thread({thread}) {
    const [threadTweets, setThreadTweets] = useState({})

    const fetchThreadTweets = async (id) => {
        if (!id) return
        try {
            let tweetData = await getDoc(doc(getFirestore(), 'tweets', id))
            setThreadTweets(prevState => ({ ...prevState, [id]: { data: tweetData.data(), id } }))

            onSnapshot(doc(getFirestore(), 'tweets', id), (data) => {
                setThreadTweets(prevState => ({ ...prevState, [id]: { data: data.data(), id } }))
            })
            fetchThreadTweets(tweetData.data().thread_children[0])
        } catch (error) {
            console.error('Error fetching parent tweet', error)
        }
    }


    useEffect(()=>{
        fetchThreadTweets(thread)
    }, [])

    return (
        <>
            {
                Object.keys(threadTweets).sort((a, b) => {
                    return threadTweets[a].data.created_at - threadTweets[b].data.created_at
                })
                    .map((key, index, arr) => (
                        <Tweet tweetData={threadTweets[key].data} id={threadTweets[key].id} isParent={!(index === arr.length - 1)} index={index} key={key} />
                    ))
            }
        </>
    )
}

export default Thread