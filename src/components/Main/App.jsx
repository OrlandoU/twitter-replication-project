import '../../assets/css/App.css'
import { Route, Routes } from 'react-router-dom';
import Bookmarks from '../Bookmarks/Bookmarks';
import Explore from '../Explore/Explore';
import Home from '../Home/Home';
import Messages from '../Messages/Messages';
import Notifications from '../Notifications/Notifications';
import Profile from '../Profile/Profile';
import SideBar from './SideBar';
import Signin from './Signin';
import RightBar from './RightBar';
import { useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState()

  useEffect(()=>{
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
      });
  },[])

  return (
    <div className="App">
      <UserContext.Provider value={{user, setUser}}>
        <SideBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/bookmarks' element={<Bookmarks />} />
          <Route path='/:profileName' element={<Profile />} />
        </Routes>
        <RightBar />
      </UserContext.Provider>

    </div>
  );
}

export default App;
