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

    useEffect(() => {
        if (url.chatId) {
            setMessages([])
            fetchMessages(url.chatId)
        }
    }, [url.chatId])

    return (
        <main className="messages-main">
            {loaded ?
                <>
                    <div className="messages-container">
                        {messages.map(message => (
                            <Message message={message.data()} />
                        ))}
                    </div>
                    <div className="message-input-container">
                        <MessageBox />
                    </div>
                </>
                :
                <Loader />}
        </main>
    )
}

export default Chat