import Chat from "./Chat"
import ChatsList from "./ChatsList"
import '../../assets/css/Messages.css'
import { Route, Routes, useLocation } from "react-router-dom"

function Messages() {
    const location = useLocation()

    return (
        <>
            <ChatsList />
            <Routes>
                <Route path="/:chatId?" element={<Chat key={location.pathname} />}/>
            </Routes>
            
        </>
    )
}
export default Messages