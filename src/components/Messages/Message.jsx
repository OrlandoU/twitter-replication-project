import { arrayUnion, updateDoc } from "firebase/firestore"
import HTMLReactParser from "html-react-parser"
import { useRef, useState } from "react"
import { useEffect } from "react"
import { useContext } from "react"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"
import Opt from "../Opt"

function Message({ message, nextDate, messageRef }) {
    const optionRef = useRef()
    const [date, setDate] = useState()
    const user = useContext(UserContext)
    const isClose = () => {
        return nextDate ? ((nextDate - message.created_at) < 60000) : false
    }

    const parseDate = (time) => {
        // create a new Date object for the message
        const messageDate = new Date(time); // replace with the actual message date/time

        // get the current date and time
        const now = new Date();

        // determine if the message was sent on the same day as today
        const isToday = messageDate.getDate() === now.getDate() &&
            messageDate.getMonth() === now.getMonth() &&
            messageDate.getFullYear() === now.getFullYear();

        // determine if the message was sent yesterday
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const isYesterday = messageDate.getDate() === yesterday.getDate() &&
            messageDate.getMonth() === yesterday.getMonth() &&
            messageDate.getFullYear() === yesterday.getFullYear();

        // format the date and time based on the current date and the message date
        let formattedDateTime;
        if (isToday) {
            const hours = messageDate.getHours();
            const minutes = messageDate.getMinutes();
            const period = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
            formattedDateTime = formattedTime;
        } else if (isYesterday) {
            formattedDateTime = 'Yesterday';
        } else if (messageDate.getFullYear() === now.getFullYear()) {
            const month = messageDate.toLocaleString('default', { month: 'short' });
            const day = messageDate.getDate();
            const formattedDate = `${month} ${day}`;
            const hours = messageDate.getHours();
            const minutes = messageDate.getMinutes();
            const period = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
            formattedDateTime = `${formattedDate} ${formattedTime}`;
        } else {
            const month = messageDate.toLocaleString('default', { month: 'short' });
            const day = messageDate.getDate();
            const year = messageDate.getFullYear();
            const formattedDate = `${month} ${day}, ${year}`;
            const hours = messageDate.getHours();
            const minutes = messageDate.getMinutes();
            const period = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
            formattedDateTime = `${formattedDate} ${formattedTime}`;
        }

        setDate(formattedDateTime);

    }
    const handleDelete = async () => {
        updateDoc(messageRef, {
            deleted: arrayUnion(user.user.tag)
        })
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(HTMLReactParser(message.content))
    }

    useEffect(() => {
        parseDate(message.created_at)
    }, [])



    if (message.is_header) {
        return (
            <UserPreview id={message[user.user.id]} className={'message-first'} isFirstMessage>

            </UserPreview>
        )
    }
    if (message && message.deleted.includes(user.user.tag)) {
        return null
    }

    return (
        <div className={message.user === user.user.id ? 'message-mine' : "message-other"}>
            {message.media_url &&
                <div className="tweet-media-wrapper">
                    <img src={message.media_url} alt="Message media" />
                </div>
            }
            {message.content && <div className="message-content">{HTMLReactParser(message.content)}</div>}
            {(date && !isClose()) && <div className="message-date">{date}</div>}
            <div className="tweet-options message" ref={optionRef} onClick={(e) => e.stopPropagation()}>
                {message &&
                    <Opt triggerRef={optionRef}>
                        <div className="option Delete" onClick={handleDelete}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="option-svg"><g><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path></g></svg>
                            Delete for you
                        </div>
                        <div className="option" onClick={handleCopy}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="option-svg"><g><path d="M15 6v3h3v2h-3v3h-2v-3h-3V9h3V6h2zm4.5-4C20.88 2 22 3.12 22 4.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C7.12 18 6 16.88 6 15.5v-11C6 3.12 7.12 2 8.5 2h11zM8 15.5c0 .28.22.5.5.5h11c.28 0 .5-.22.5-.5v-11c0-.28-.22-.5-.5-.5h-11c-.28 0-.5.22-.5.5v11zm-4 4V8h-.5C2.67 8 2 8.67 2 9.5v10C2 20.88 3.12 22 4.5 22h10c.83 0 1.5-.67 1.5-1.5V20H4.5c-.28 0-.5-.22-.5-.5z"></path></g></svg>
                            Copy Message
                        </div>
                    </Opt>}
                <svg viewBox="0 0 24 24" aria-hidden="true" class="sub-options"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
            </div>
        </div>
    )
}

export default Message