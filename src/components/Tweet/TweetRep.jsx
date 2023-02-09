import EmojiPicker from "emoji-picker-react"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useContext, useEffect, useRef, useState } from "react"
import { Mention, MentionsInput } from "react-mentions"
import { CreateTweetContext } from "../../Contexts/CreateTweetContexts"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"

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

    const savePosition = () => {
        savedSelectionRef.current = textareaRef.current.selectionStart
    }

    const fetchUser = async (search, cb) => {
        const q = query(collection(getFirestore(), 'users'), where('tag_substring', 'array-contains', search))
        const users = await getDocs(q)
        cb(users.docs.map(user => {
            return { ...user.data(), id:user.data().tag, display: user.data().tag, originalId: user.data().id }
        }
        ))
    }

    const handleChange = (event, newValue, newPlainTextValue, mentions) => {
        console.log(mentions)
        setTweetContent(event.target.value)
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


    const handleEmoji = ((emoji) => {
        setTweetContent(prev=>{
            let newVal = [...prev].slice(0, savedSelectionRef.current).join('') + emoji.emoji + [...prev].slice(savedSelectionRef.current).join('')
            savedSelectionRef.current++
            return newVal
        })
    })

    const handleSuggestion = (entry) => {
        console.log(entry)
        return <UserPreview data={{...entry, id:entry.originalId}} className={'suggestion'} />
    }

    const handleDisplay = (id, display) => {
        return '@' + display
    }

    const handleContainer = (e)=>{
        return <div className="suggestion-container">{e}</div>
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
            {(parentId) &&
                <div className="tweet-replied" style={{ padding: '12px 0px 0px 72px' }}>
                    Replying to <a href={`#/${parentName}`} className="tag">@{parentName}</a>
                </div>}
            {user.user && <div className={!parentId ? "tweet tweet-wrapper home-write" : "tweet tweet-wrapper reply-write"}>
                <div className="side-tweet">
                    <img src={user.user.profile_pic} className="tweet-profile-pic" alt="" />
                </div>
                <div className="tweet-write" onClick={()=>textareaRef.current.focus()}>
                    <MentionsInput
                        value={tweetContent}
                        onChange={handleChange}
                        customSuggestionsContainer={handleContainer}
                        inputRef={textareaRef}
                        className='tweet-write-content'
                        placeholder={parentId ? "Write a message": "What's Happening?"}
                        onBlur={savePosition}
                        onClick={()=>setClicked(true)}>
                        <Mention
                            trigger="@"
                            data={fetchUser}
                            renderSuggestion={handleSuggestion}
                            displayTransform={handleDisplay}
                            className={'tag'}
                            markup={'<a href="#/__display__" class=tag>@__id__</a>'}
                        />
                    </MentionsInput>
                    {files.length > 0 && <div className="tweet-media">
                        {files.map(media => (
                            <div className="tweet-media-wrapper">
                                <img src={URL.createObjectURL(media)} alt="Tweet media" key={media} />
                            </div>
                        ))}
                    </div>}
                    {(!parentId || clicked) &&
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