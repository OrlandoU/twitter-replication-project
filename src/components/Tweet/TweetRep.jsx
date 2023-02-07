import EmojiPicker from "emoji-picker-react"
import { useContext, useEffect, useRef, useState } from "react"
import twemoji from "twemoji"
import { CreateTweetContext } from "../../Contexts/CreateTweetContexts"
import { UserContext } from "../../Contexts/UserContext"

function TweetRep({ parentId = null, parentName = null, ancestorUser = null }) {
    const [emojiModal, setEmojiModal] = useState(false)
    const [clicked, setClicked] = useState(false)
    const user = useContext(UserContext)
    const textareaRef = useRef()
    const savedSelectionRef = useRef(null);
    const [files, setFiles] = useState([])
    const [tweetContent, setTweetContent] = useState('')
    const createTweet = useContext(CreateTweetContext)

    const handleEmojiClick = (e) => {
        e.stopPropagation()
        setEmojiModal(true)
    }

    const handleCursor = (event) => {
        if (event.target.tagName === 'IMG') {
            const imageRect = event.target.getBoundingClientRect();
            const mouseX = event.clientX;

            const range = document.createRange();
            if (mouseX - imageRect.left < imageRect.width / 2) {
                range.setStartBefore(event.target);
            } else {
                range.setStartAfter(event.target);
            }
            range.collapse(true);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            textareaRef.current.focus();
        }
    }

    const handleP = (e) => {
        console.log(e.nativeEvent)
        const mentions = e.target.innerHTML.match(/^@\w+/g);

        if (!mentions) {
            return;
        }

        mentions.forEach(function (mention) {
            const link = document.createElement('a');
            link.href = '/' + mention.slice(1);
            link.innerHTML = mention;
            link.contentEditable = true;

            link.addEventListener('input', function () {
                link.href = '/' + link.innerHTML.slice(1);
            });

            e.target.innerHTML = e.target.innerHTML.replace(mention, link.outerHTML);
        });

        const lastMention = mentions[mentions.length - 1];
        const link = e.target.querySelector('a[href="/' + lastMention.slice(1) + '"]');

        const range = document.createRange();
        const selection = window.getSelection();

        range.setStart(link.firstChild, 1);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        savedSelectionRef.current = window.getSelection().getRangeAt(0).cloneRange();
        setTweetContent(e.target.innerHTML)
    }

    const handleClick = async () => {
        if (!tweetContent) return
        await createTweet(tweetContent, files, parentId, parentName, ancestorUser)
        textareaRef.current.textContent = ''
        setFiles('')
        setTweetContent('')
    }

    const handleFile = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            setFiles(prevState => [
                ...prevState,
                e.target.files[i]
            ])
        }
    }

    console.log(tweetContent)

    const handleEmoji = ((emoji) => {
        const selection = window.getSelection();
        const range = savedSelectionRef.current.cloneRange();

        const emojiContainer = document.createElement("span");
        emojiContainer.innerHTML = twemoji.parse(emoji.emoji);

        range.insertNode(emojiContainer);
        range.setStartAfter(emojiContainer);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        setTweetContent(textareaRef.current.innerHTML)
    })



    const handleFocus = () => {
        setClicked(true)
    }

    useEffect(() => {
        let removeModal = () => {
            setEmojiModal(false)
        }
        window.addEventListener('click', removeModal)

        return () => { window.removeEventListener('click', removeModal) }
    }, [])

    return (
        <>
            {(clicked && parentId) &&
                <div className="tweet-replied" style={{ padding: '12px 0px 0px 72px' }}>
                    Replying to <a href="youtube.com">{parentName}</a>
                </div>}
            {user.user && <div className={!parentId ? "tweet home-write" : "tweet reply-write"}>
                <div className="side-tweet">
                    <img src={user.user.profile_pic} className="tweet-profile-pic" alt="" />
                </div>
                <div className="tweet-write">
                    <p ref={textareaRef} className={!tweetContent ? 'empty-tweet tweet-write-content' : 'tweet-write-content'} onInput={handleP} onClick={handleCursor} onFocus={handleFocus} contentEditable onBlur={handleP} ></p>
                    {files.length > 0 && <div className="tweet-media">
                        {files.map(media => (
                            <div className="tweet-media-wrapper">
                                <img src={URL.createObjectURL(media)} alt="Tweet media" key={media} />
                            </div>
                        ))}
                    </div>}
                    {(clicked || !parentId) &&
                        <div className="tweet-write-options">
                            <div className="write-left-options">
                                <label htmlFor="media-tweet" className='media-tweet'>
                                    <input type="file" id='media-tweet' style={{ display: 'none' }} multiple onChange={handleFile} />
                                    <svg className='sub-options' viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                                </label>
                                <label htmlFor="emoji-tweet" className='media-tweet' onClick={handleEmojiClick}>
                                    {emojiModal && <EmojiPicker lazyLoadEmojis id='emoji-tweet' onEmojiClick={handleEmoji} className='emoji-modal' emojiStyle="twitter" />}
                                    <svg className='sub-options' viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"></path></g></svg>
                                </label>
                            </div>
                            <div className="write-right-options">
                                <button onClick={handleClick} className={!tweetContent ? 'disabled home-tweet-button' : 'home-tweet-button'}>{!parentId ? 'Tweet' : 'Reply'}</button>
                            </div>
                        </div>}
                </div>
            </div>}
        </>
    )
}

export default TweetRep