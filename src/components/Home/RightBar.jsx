import { arrayRemove, arrayUnion, collection, getDocs, getFirestore, increment, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import Signin from "../Main/Signin"
import '../../assets/css/RightBar.css'

function RightBar() {
    const [users, setUsers] = useState([])
    const userP = useContext(UserContext)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchUsers = async (user) => {
        const q = query(collection(getFirestore(), 'users'), where('followers', 'not-in', [user.tag]), orderBy('followers'))
        onSnapshot(q, (data) => setUsers(data.docs))
        const users = await getDocs(q)
        setUsers(users.docs)
    }

    const handleFollow = async (userRef) => {
        const userData = userRef.data()
        try {
            if (!userData.followers.includes(userP.user.tag)) {
                await updateDoc(userRef.ref, {
                    followers: arrayUnion(userP.user.tag),
                    followers_count: increment(1)
                })
            }
            else {
                await updateDoc(userRef.ref, {
                    followers: arrayRemove(userP.user.tag),
                    followers_count: increment(-1)
                })
            }
        } catch (error) {
            console.error('Error handling follow request', error)
        }
    }

    useEffect(() => {
        if (userP.user) {
            fetchUsers(userP.user)
        }
    }, [userP])



    return (
        <section className="right-bar">
            <Signin />
            {userP.user && users.map(user => (
                user.data().tag !== userP.user.tag && (
                    <span key={user.data().tag}>
                        <div className="username">{user.data().name}</div>
                        <button onClick={() => handleFollow(user)}>{user.data().followers.includes(userP.user.tag) ? 'Unfollow' : 'Follow'}</button>
                    </span>
                )
            ))}
        </section>
    )
}
export default RightBar