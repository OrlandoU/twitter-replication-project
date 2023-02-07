import HTMLReactParser from "html-react-parser"
import { useContext } from "react"
import { UserContext } from "../../Contexts/UserContext"

function Message({ message }) {
    const user = useContext(UserContext)
    return (
        <div className={message.user === user.user.id? 'message-mine': "message-other"}>
            {message.media_url &&
                <div className="tweet-media-wrapper">
                    <img src={message.media_url} alt="Message media" />
                </div>
            }
            <div className="message-content">{HTMLReactParser(message.content)}</div>
        </div>
    )
}

export default Message