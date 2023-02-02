import { useContext, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { CreateTweetContext } from "../../Contexts/CreateTweetContexts"

function TweetRep({user}){   
    const [file, setFile] = useState()
    const [tweetContent, setTweetContent] = useState()
    const createTweet = useContext(CreateTweetContext)

    const updateTweetContent = (e) => {
        setTweetContent(e.currentTarget.value)
    }

    const handleClick = () => {
        createTweet(tweetContent)
        setFile('')
        setTweetContent('')
    }

    const handleFile = (e) => {
        console.log(e)
        setFile(e.currentTarget.value)
    }

    return(
        <div className="tweet home-write">
            <div className="side-tweet">
                <img src={user.profile_pic} className="tweet-profile-pic" alt="" />
            </div>
            <div className="tweet-write">
                <ReactTextareaAutosize placeholder='Whats happening?' onInput={updateTweetContent} value={tweetContent} className={'tweet-write-content'} />
                <div className="tweet-write-options">
                    <div className="write-left-options">
                        <label htmlFor="media-tweet" className='media-tweet'>
                            <input type="file" id='media-tweet' style={{ display: 'none' }} onChange={handleFile}/>
                            <svg className='sub-options' viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                        </label>
                    </div>
                    <div className="write-right-options">
                        <button onClick={handleClick} className={!tweetContent ? 'disabled home-tweet-button' : 'home-tweet-button'}>Tweet</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetRep