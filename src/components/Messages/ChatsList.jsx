import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"
import Loader from '../Loader'

function ChatsList() {
    const [chats, setChats] = useState([])
    const [input, setInput] = useState('')
    const [queried, setQueried] = useState([])
    const [loaded, setLoaded] = useState(false)
    const user = useContext(UserContext)

    const createChat = async (receiverId) => {
        console.log(user.user.id, receiverId)
        let chatId = [user.user.id, receiverId].sort().join('-')
        try {
            setDoc(doc(getFirestore(), 'chats', chatId), {
                [user.user.id]: receiverId,
                [receiverId]: user.user.id,
                participants: [receiverId, user.user.id]
            })
        } catch (error) {
            console.error('Error creating chat', error)
        }
    }


    const fetchChats = async (id) => {
        const q = query(collection(getFirestore(), 'chats'), where(id, '!=', false))
        const data = await getDocs(q)
        setChats(data.docs)
        setLoaded(true)
    }

    const fetchUsers = async (user) => {
        const q = query(collection(getFirestore(), 'users'), where('name_substring', 'array-contains', user.toLowerCase()))
        let users = await getDocs(q)
        setQueried(users.docs)
    }

    const handleChange = (e) => {
        setInput(e.currentTarget.value)
    }

    useEffect(() => {
        if (user.user) {
            fetchChats(user.user.id)
        }
    }, [user])

    useEffect(() => {
        fetchUsers(input)
    }, [input])

    if(!loaded){
        return <Loader /> 
    }


    return (
        <section className="chats">
            <input type="text" value={input} onChange={handleChange} />
            <div className="chat-searched">
                {queried.map(query => (
                    query.data().id !== user.user.id
                    && <UserPreview
                        id={query.data().id} className={'tweet'} cb={createChat} key={query.data().id}/>
                ))}
            </div>
            {chats.map(chat => {
                return (
                    <div key={chat.id} >
                        <UserPreview
                            path={`/messages/chat/${chat.id}`}
                            id={chat.data()[user.user.id]}
                            className='tweet'
                            time={chat.data().updated_at}>

                        </UserPreview>
                    </div>
                )
            })}
        </section>
    )
}

export default ChatsList