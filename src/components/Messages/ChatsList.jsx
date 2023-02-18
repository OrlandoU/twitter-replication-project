import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"
import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"
import Loader from '../Loader'
import Modal from "../Modal"
import { useNavigate } from "react-router-dom"

function ChatsList() {
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [input, setInput] = useState('')
    const [queried, setQueried] = useState([])
    const [loaded, setLoaded] = useState(false)
    const user = useContext(UserContext)
    const newMesRef = useRef()

    const createChat = async (receiverId) => {
        let chatId = [user.user.id, receiverId].sort().join('-')
        try {
            let testChat = await getDoc(doc(getFirestore(), 'chats', chatId))
            if (testChat.data()) {
                redirectToChat(chatId)
                return
            }
            await setDoc(doc(getFirestore(), 'chats', chatId), {
                [user.user.id]: receiverId,
                [receiverId]: user.user.id,
                participants: [receiverId, user.user.id],
                last_message: '',
            })
            let timestamp = new Date().getTime()
            await addDoc(collection(getFirestore(), 'messages'), {
                chat_id: chatId,
                is_header: true,
                created_at: timestamp,
                [user.user.id]: receiverId,
                [receiverId]: user.user.id,
            })
            redirectToChat(chatId)
        } catch (error) {
            console.error('Error creating chat', error)
        }
    }

    const redirectToChat = (chatId) => {
        document.querySelector('.modal-container.message').click()
        navigate(`/messages/${chatId}`)
    }

    const loadModal = () => {
        newMesRef.current.click()
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



    return (
        <section className="chats">
            <Modal refToObject={newMesRef} isMessage className={'signin message'}>
                <label htmlFor="new-message" className="new-message-input-container">
                    <input type="text" id="new-message" value={input} onChange={handleChange} placeholder='Search people'/>
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="message-search-svg"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>
                </label>
                <div className="chat-searched">
                    {queried.map(query => (
                        query.data().id !== user.user.id
                        && <UserPreview
                            id={query.data().id} className={'tweet'} cb={createChat} key={query.data().id} />
                    ))}
                </div>
            </Modal>
            <div className="chats-head">
                <h2>Messages</h2>
                <label htmlFor="emoji-tweet" className='media-message chat' ref={newMesRef} id={'newMesRef'}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="sub-options chat"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V12h-2v-1.537l-8 3.635-8-3.635V18.5c0 .276.224.5.5.5H13v2H4.498c-1.381 0-2.5-1.119-2.5-2.5v-13zm2 2.766l8 3.635 8-3.635V5.5c0-.276-.224-.5-.5-.5h-15c-.276 0-.5.224-.5.5v2.766zM19 18v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z"></path></g></svg>
                </label>
            </div>
            {!loaded &&
                <div className="align-loader">
                    <Loader />
                </div>}


            {(chats.length === 0 && loaded) &&
                <div className="chats-placeholder">
                    <div className="chats-placeholder-header">Welcome to your inbox!</div>
                    <p>Drop a line, share Tweets and more with private conversations between you and others on Twitter. </p>
                    <button className="tweet-button chat-new-message" onClick={loadModal}>Write a message</button>
                </div>}
            {chats.map(chat => {
                return (
                    <div key={chat.id} >
                        <UserPreview
                            path={`/messages/${chat.id}`}
                            id={chat.data()[user.user.id]}
                            className='tweet'
                            time={chat.data().updated_at}>
                                <div className="chat-last-message">{chat.data().last_message}</div>
                        </UserPreview>
                    </div>
                )
            })}
        </section>
    )
}

export default ChatsList