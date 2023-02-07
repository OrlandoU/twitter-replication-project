import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../Loader"

function Profile(){
    const [user, setUser] = useState({})
    const url = useParams()

    const fetchUser = async () => {
        const user = await getDocs(query(collection(getFirestore(), 'users'), where('tag', '==', url.profileTag)))
        setUser(user.docs[0].data())
    }
    
    useEffect(()=>{
        fetchUser()
    },[])
    if(!user.name){
        return (
            <main><Loader /></main>
        )
    }


    return (
        <main>
            <div className="banner"></div>
            <div className="profile">
                <div className="profile-pic">
                    <img src={user.profile_pic} alt="" />
                    <button className="edit-profile"></button>
                </div>
                <div className="profile-ids">
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-tag">@{user.tag}</div>
                </div>
                <div className="profile-bio"></div>
                <div className="profile-creation-date"></div>
                <div className="profile-track">
                    <div className="profile-following"></div>
                    <div className="profile-followers"></div>
                </div>
            </div>
        </main>
    )
}

export default Profile