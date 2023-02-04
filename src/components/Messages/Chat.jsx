import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function Chat() {
    const [messageContent, setMessageContent] = useState('')
    const [messages, setMessages] = useState([])
    const url = useParams()

    const handleChange = (e) => {
        setMessageContent(e.currentTarget.value)
    }

    const createMessage = async () => {
        let timestamp = new Date().getTime()
        await addDoc(collection(getFirestore(), 'messages'), {
            chat_id: url.chatId,
            content: messageContent,
            created_at: timestamp
        })

        await updateDoc(doc(getFirestore(), 'chats', url.chatId),
            { updated_at: timestamp }
        )
    }

    const fetchMessages = async (id) => {
        const q = query(collection(getFirestore(), 'messages'), where('chat_id', '==', id), orderBy('created_at', 'desc'))
        const resp = await getDocs(q)
        setMessages([...resp.docs.reverse()])
        onSnapshot(q, (data) => {
            setMessages([...data.docs.reverse()])
        })
    }

    useEffect(() => {
        if (url.chatId) {
            setMessages([])
            fetchMessages(url.chatId)
        }
    }, [url.chatId])

    return (
        <main className="messages-main">
            <div className="messages-container">
                {messages.map(message => (
                    <div>
                        {message.data().content}
                    </div>
                ))}
            </div>
            <div className="message-input-container">
                <input value={messageContent} type="text" className="message-input" onChange={handleChange} />
                <button className="send-message" onClick={createMessage}>Send</button>
            </div>
        </main>
    )
}

export default Chat