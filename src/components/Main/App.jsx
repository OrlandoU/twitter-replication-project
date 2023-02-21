import '../../assets/css/App.css'
import { Route, Routes, useLocation } from 'react-router-dom';
import Bookmarks from '../Bookmarks/Bookmarks';
import Explore from '../Explore/Explore';
import Home from '../Home/Home';
import Messages from '../Messages/Messages';
import Notifications from '../Notifications/Notifications';
import Profile from '../Profile/Profile';
import SideBar from './SideBar';
import { useEffect, useState } from 'react';
import { UserContext } from '../../Contexts/UserContext';
import { browserSessionPersistence, getAuth, setPersistence, signOut } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { addDoc, arrayUnion, collection, doc, getDoc, getFirestore, increment, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import TweetExp from '../Tweet/TweetExp';
import stopWords from '../../Stop-Words'
import { CreateTweetContext } from '../../Contexts/CreateTweetContexts';
import Query from '../query/Query';
import Settings from '../Settings/Settings';
import { Popup } from '../../Contexts/PopupContext';
import { ThemeContext } from '../../Contexts/ThemeContext';
import { ColorContext } from '../../Contexts/ColorContext';


function App() {
  const [user, setUser] = useState()
  const [theme, setTheme] = useState(localStorage.getItem('theme-tw') || 'default')
  const [color, setColor] = useState(localStorage.getItem('color-tw') || 'blue-color')
  const location = useLocation()
  const [popup, setPopup] = useState()
  const [visible, setVisible] = useState()

  const createTweet = async (content = "Howdy shawty", files, parentId = null, parent_tweet_name = null, ancestorUser = null, mentions) => {
    let keywords = content.split(" ").filter(word => /^[a-zA-Z0-9]+$/.test(word))
    let substring = keywords.map(word => word.split('').map((el, index) => word.slice(0, index + 1).toLowerCase()))
    substring = [].concat(...substring)
    let tweet
    try {
      tweet = await addDoc(collection(getFirestore(), 'tweets'), {
        userId: user.id,
        userTag: user.tag,
        media_url: [],
        hasMedia: files.length > 0,
        parent_tweet: parentId,
        parent_tweet_user: parent_tweet_name,
        search_substring: substring,
        thread_children: [],
        thread_size: 0,
        retweeted_by: [],
        viewers: [],
        mentions: mentions.map(mention => mention.id),
        views: 0,
        liked_by: [],
        likes: 0,
        replied_by: [],
        replies_count: 0,
        bookmarked_by: [],
        content: content,
        created_at: new Date().getTime(),
        keywords_arr: keywords,
        pinned: false,
      })
      await setDoc(doc(getFirestore(), 'notifications', tweet.id + '-likes'), {
        tweetId: tweet.id,
        tweetContent: content,
        userTag: user.tag,
        type: 'likes',
        text: parentId ? 'liked your Reply' : 'liked your Tweet',
        users: [],
        viewed: false,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      })
      await setDoc(doc(getFirestore(), 'notifications', tweet.id + '-retweets'), {
        tweetId: tweet.id,
        tweetContent: content,
        userTag: user.tag,
        viewed: false,
        type: 'retweets',
        text: parentId ? 'Retweeted your Reply' : 'Retweeted your Tweet',
        users: [],
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      })
      if (parentId) {
        await updateDoc(doc(getFirestore(), 'tweets', parentId), {
          replied_by: arrayUnion(user.tag),
          thread_children: (parent_tweet_name === user.tag || ancestorUser === user.tag) ? arrayUnion(tweet.id) : arrayUnion()
        })
        if (parent_tweet_name !== user.tag) {
          await setDoc(doc(getFirestore(), 'notifications', tweet.id + parent_tweet_name), {
            userTag: parent_tweet_name,
            type: 'mention',
            viewed: false,
            tweetId: tweet.id,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime()
          })
        }
      }

      await updateDoc(doc(getFirestore(), 'users', user.id), {
        tweets_count: increment(1)
      })

      for (let file of files) {
        let filePath = `tweet-media/${user.id}/${file.name}`;
        let newImageRef = ref(getStorage(), filePath);
        let fileSnapshot = await uploadBytesResumable(newImageRef, file);

        let publicImageUrl = await getDownloadURL(newImageRef);

        // 4 - Update the chat message placeholder with the image's URL.
        await updateDoc(tweet, {
          media_url: arrayUnion(publicImageUrl),
          storageUri: arrayUnion(fileSnapshot.metadata.fullPath),

        });
      }
    } catch (error) {
      console.error('Error creating tweet', error)
    }



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

    substring.forEach(async substring => {
      try {
        await updateDoc(doc(getFirestore(), 'trends', substring), {
          count: increment(1)
        })
      } catch (error) {
        console.error('Updating substring in existence', error)
      }
    })

    updateParentTweets(parentId)
    return tweet
  }

  let size = 1
  const updateParentTweets = async (id) => {
    if (!id) return
    try {
      let tweetData = await getDoc(doc(getFirestore(), 'tweets', id))
      await updateDoc(tweetData.ref, {
        replies_count: increment(1),
        thread_size: tweetData.data().thread_children.length && tweetData.data().thread_size < size ? size++ : tweetData.data().thread_size
      })
      updateParentTweets(tweetData.data().parent_tweet)
    } catch (error) {
      console.error('Error fetching parent tweet', error)
    }
  }

  useEffect(() => {
    if (popup)
      setVisible(true)
    let timer = setTimeout(() => {
      setVisible(false)
      setPopup()
      clearTimeout(timer)
    }, 4000)
  }, [popup])

  useEffect(() => {
    setPersistence(getAuth(), browserSessionPersistence)
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        const q = query(collection(getFirestore(), 'users'), where('id', '==', getAuth().currentUser.uid))
        getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid)).then((userData) => {
          if (!userData.data()) {
            signOut(getAuth())
            return
          }
          setUser(userData.data())
        })
        onSnapshot(q, (data) => setUser(data.docs[0].data()))
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage, errorCode)
      });

  }, [])

  return (
    <div className={"app-wrap " + theme + ' ' + color}>
      <div className="App ">
        <ColorContext.Provider value={setColor}>
          <ThemeContext.Provider value={setTheme}>
            <Popup.Provider value={setPopup}>
              <UserContext.Provider value={{ user, setUser }}>
                <CreateTweetContext.Provider value={createTweet}>
                  <SideBar />
                  {(visible && popup) && <span className='popup'>{popup}</span>}
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/explore' element={<Explore />} />
                    <Route path='/notifications/*' element={<Notifications />} />
                    <Route path='/messages/*' element={<Messages />} />
                    <Route path='/bookmarks' element={<Bookmarks />} />
                    <Route path='/settings/*' element={<Settings />} />
                    <Route path='/query/:query/*' element={<Query />} />
                    <Route path='/:profileTag/*' element={<Profile />} />
                    <Route path='/:profileName/status/:tweetId' element={<TweetExp key={location.pathname} />} />
                  </Routes>
                </CreateTweetContext.Provider>
              </UserContext.Provider>
            </Popup.Provider>
          </ThemeContext.Provider>
        </ColorContext.Provider>
      </div>
    </div>
  );
}

export default App;
