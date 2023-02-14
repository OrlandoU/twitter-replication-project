import HTMLReactParser from "html-react-parser"
import { useContext } from "react"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"

function Message({ message }) {
    const user = useContext(UserContext)
    if (message.is_header) {
        return (
            <UserPreview id={message[user.user.id]} className={'message-first'} isFirstMessage>

            </UserPreview>
        )
    }
    return (
        <div className={message.user === user.user.id ? 'message-mine' : "message-other"}>
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