import { collection, getDocs, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../Loader"
import Message from "./Message"
import MessageBox from "./MessageBox"

function Chat() {
    const [messages, setMessages] = useState([])
    const [loaded, setLoaded] = useState(false)
    const url = useParams()

    const fetchMessages = async (id) => {
        const q = query(collection(getFirestore(), 'messages'), where('chat_id', '==', id), orderBy('created_at', 'desc'))
        const resp = await getDocs(q)
        setMessages([...resp.docs.reverse()])
        onSnapshot(q, (data) => {
            setMessages([...data.docs.reverse()])
        })
        setLoaded(true)
    }

    const loadModal = () => {
        document.getElementById('newMesRef').click()
    }

    useEffect(() => {
        setMessages([])
        fetchMessages(url.chatId)
    }, [])

    return (
        <main className={!loaded || !url.chatId ? "messages-main center" : 'messages-main'}>
            {loaded || !url.chatId ?
                <>
                    {url.chatId ?
                        <>
                            <div className="messages-container">
                                {messages.map((message, index, array) => (
                                   <Message message={message.data()} nextDate={array[index + 1] ? array[index + 1].data().created_at : null} messageRef={message.ref}/>
                                ))}
                            </div>
                            <div className="message-input-container">
                                <MessageBox />
                            </div>
                        </>
                        :
                        <div className="chat-placeholder">
                            <div className="chat-placeholder-header">Select a message</div>
                            <p>Drop a line, share Tweets and more with private conversations between you and others on Twitter. </p>
                            <button className="tweet-button chat-new-message" onClick={loadModal}>New Message</button>
                        </div>}
                </>
                : <Loader />}
        </main>
    )
}

export default Chat