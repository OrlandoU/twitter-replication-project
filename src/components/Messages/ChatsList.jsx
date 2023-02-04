import { addDoc, collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"

function ChatsList() {
    const [chats, setChats] = useState([])
    const [input, setInput] = useState('')
    const [queried, setQueried] = useState([])
    const id = useContext(UserContext).id

    const createChat = async (receiverId) => {
        let chatId = [id, receiverId].sort().join('-')
        try {
            setDoc(doc(getFirestore(), 'chats', chatId), {
                [id]: receiverId,
                [receiverId]: id
            })
        } catch (error) {
            console.error('Error creating chat', error)
        }
    }


    const fetchChats = async (id) => {
        const q = query(collection(getFirestore(), 'chats'), where(id, '!=', false))
        const data = await getDocs(q)
        setChats(data.docs)
    }

    const fetchUsers = async (user) => {
        const q = query(collection(getFirestore(), 'users'), where('name_substring', 'array-contains', user.toLowerCase()))
        let users = await getDocs(q)
        setQueried(users.docs)
    }

    const handleChange = (e) =>{
        setInput(e.currentTarget.value)
    }

    useEffect(() => {
        if (id) {
            fetchChats(id)
        }
    }, [id])

    useEffect(()=>{
        fetchUsers(input)
    },[input])


    return (
        <section className="chats">
            <input type="text" value={input} onChange={handleChange}/>
            <div className="chat-searched">
                {queried.map(query=>(
                    <UserPreview 
                    id={query.data().id}/>
                ))}
            </div>
            {chats.map(chat => {
                return (
                    <div key={chat.data().id} >
                        <UserPreview 
                        path={`/messages/chat/${[id, chat.data().id].sort().join('-')}`} 
                        key={chat.data().id}
                        id={chat.data()[id]}
                        className='tweet'
                        time={chat.data().updated_at}>

                        </UserPreview>
                        <button onClick={() => createChat(chat.data().id)}>Generate Chat</button>
                    </div>
                )
            })}
        </section>
    )
}

export default ChatsList