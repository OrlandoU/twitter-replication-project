import '../../assets/css/App.css'
import { Route, Routes, useLocation } from 'react-router-dom';
import Bookmarks from '../Bookmarks/Bookmarks';
import Explore from '../Explore/Explore';
import Home from '../Home/Home';
import Messages from '../Messages/Messages';
import Notifications from '../Notifications/Notifications';
import Profile from '../Profile/Profile';
import SideBar from './SideBar';
import RightBar from './RightBar';
import { useEffect, useState } from 'react';
import { UserContext } from '../../Contexts/UserContext';
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { addDoc, collection, doc, getDoc, getFirestore, increment, setDoc, updateDoc } from 'firebase/firestore';
import TweetExp from '../Tweet/TweetExp';
import stopWords from '../../Stop-Words'
import { CreateTweetContext } from '../../Contexts/CreateTweetContexts';


function App() {
  const [user, setUser] = useState()
  const location = useLocation()

  const createTweet = async (content = "Howdy shawty", file, parentId = null, parent_tweet_name = null) => {
    try {
      const tweet = await addDoc(collection(getFirestore(), 'tweets'), {
        userId: user.tag,
        username: user.name,
        media_url:null,
        user_profile_pic: user.profile_pic,
        parent_tweet: parentId,
        parent_tweet_user: parent_tweet_name,
        direct_child_tweet: null,
        retweeted_by: [],
        viewers: [],
        liked_by: [],
        replied_by: [],
        replies_count: 0,
        content: content,
        created_at: new Date().getTime(),
        keywords_arr: content.split(' ').map(word => word.toLowerCase())
      })

      if(file){

        
        const filePath = `tweet-media/${tweet.id}/${file.name}`;
        const newImageRef = ref(getStorage(), filePath);
        const fileSnapshot = await uploadBytesResumable(newImageRef, file);
        
        const publicImageUrl = await getDownloadURL(newImageRef);
        
        // 4 - Update the chat message placeholder with the image's URL.
        await updateDoc(tweet, {
          media_url: publicImageUrl,
          storageUri: fileSnapshot.metadata.fullPath
        }); 
      }
    } catch (error) {
      console.error('Error creating tweet', error)
    }


    let keywords = content.split(' ').map(word => word.toLowerCase())
    keywords.forEach(async keyword => {
      if (stopWords.includes(keyword)) {
        return
      }
      try {
        await updateDoc(doc(getFirestore(), 'trends', keyword), {
          count: increment(1)
        })
      } catch (error) {
        await setDoc(doc(getFirestore(), 'trends', keyword), {
          count: 1
        })
      }

    })
    updateParentTweets(parentId)
  }


  const updateParentTweets = async (id) => {
    if (!id) return
    try {
      let tweetData = await getDoc(doc(getFirestore(), 'tweets', id))
      updateDoc(doc(getFirestore(), 'tweets', id), {
        replies_count: increment(1)
      })
      updateParentTweets(tweetData.data().parent_tweet)
    } catch (error) {
      console.error('Error fetching parent tweet', error)
    }
  }

  useEffect(() => {
    setPersistence(getAuth(), browserSessionPersistence)
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid)).then((userData) => {
          setUser(userData.data())
        })
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage, errorCode)
      });
  }, [])

  return (
    <div className="App">
      <UserContext.Provider value={{ user, setUser }}>
        <CreateTweetContext.Provider value={createTweet}>
          <SideBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/explore' element={<Explore />} />
            <Route path='/notifications' element={<Notifications />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/bookmarks' element={<Bookmarks />} />
            <Route path='/:profileName' element={<Profile />} />
            <Route path='/:profileName/status/:tweetId' element={<TweetExp key={location.pathname} />} />
          </Routes>
          <RightBar />
        </CreateTweetContext.Provider>
      </UserContext.Provider>

    </div>
  );
}

export default App;
