import EmojiPicker from "emoji-picker-react"
import { addDoc, arrayUnion, collection, doc, getFirestore, updateDoc } from "firebase/firestore"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import twemoji from "twemoji"
import { UserContext } from "../../Contexts/UserContext"

function MessageBox() {
    const [emojiModal, setEmojiModal] = useState(false)
    const textareaRef = useRef()
    const [file, setFile] = useState(false)
    const url = useParams()
    const user = useContext(UserContext)
    const [messageContent, setMessageContent] = useState('')

    const createMessage = async () => {
        try {
            let timestamp = new Date().getTime()
            let message = await addDoc(collection(getFirestore(), 'messages'), {
                chat_id: url.chatId,
                content: messageContent,
                created_at: timestamp,
                user: user.user.id,
                media_url: null,
                storageUri: [],
            })
            await updateDoc(doc(getFirestore(), 'chats', url.chatId),
                {
                    updated_at: timestamp,
                    last_message: messageContent,
                }
            )

            if (file) {
                let filePath = `tweet-media/${message.id}/${file.name}`;
                let newImageRef = ref(getStorage(), filePath);
                let fileSnapshot = await uploadBytesResumable(newImageRef, file);

                let publicImageUrl = await getDownloadURL(newImageRef);

                // 4 - Update the chat message placeholder with the image's URL.
                await updateDoc(message, {
                    media_url: publicImageUrl,
                    storageUri: arrayUnion(fileSnapshot.metadata.fullPath)
                });
            }
        } catch (error) {
            console.error('Error creating message', error)
        }

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

    const handleKeyDown = (e) => {
        if (e.nativeEvent.key === 'Enter') {
            handleClick()
        } else {
            setMessageContent(e.target.innerHTML)
        }
    }

    const handleClick = async () => {
        if (!messageContent) return
        createMessage()
        textareaRef.current.textContent = ''
        setFile(false)
        setMessageContent('')
    }

    const handleFile = (e) => {
        console.log(e)
        setFile(e.target.files[0])
    }

    const handleEmoji = ((emoji) => {
        textareaRef.current.innerHTML += twemoji.parse(emoji.emoji)
        setMessageContent(textareaRef.current.innerHTML)
    })

    const handleEmojiClick = (e) => {
        e.stopPropagation()
        setEmojiModal(true)
    }

    const handleRemoveMedia = () => {
        setFile(false)
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
            <div className="message-write">
                {file && <div className="tweet-media">
                    <div className="tweet-media-wrapper">
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="message-media-remove" onClick={handleRemoveMedia}><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                        <img src={URL.createObjectURL(file)} alt="Tweet media" key={file} />
                    </div>
                </div>}
                <div className="message-write-options">
                    <div className="write-left-options">
                        <label htmlFor="media-tweet-message" className='media-message'>
                            <input type="file" id='media-tweet-message' className="input-file" onChange={handleFile} />
                            <svg className='sub-options' viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                        </label>
                        <label htmlFor="emoji-tweet" className='media-message' onClick={handleEmojiClick}>
                            {emojiModal && <EmojiPicker lazyLoadEmojis id='emoji-tweet' onEmojiClick={handleEmoji} className='emoji-modal-message' emojiStyle="twitter" />}
                            <svg className='sub-options' viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"></path></g></svg>
                        </label>
                    </div>
                    <p ref={textareaRef} className={!messageContent ? 'empty-message message-write-content' : 'message-write-content'} onClick={handleCursor} contentEditable onKeyUp={handleKeyDown}></p>
                    <div className="write-right-options">
                        <div className='media-message' onClick={handleClick}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" class={messageContent ? "sub-options" : "disabled-button sub-options"}><g><path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path></g></svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MessageBox