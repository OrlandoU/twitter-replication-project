import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, increment, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/UserContext"
import Signin from "../Main/Signin"
import '../../assets/css/RightBar.css'
import UserPreview from "../Main/UserPreview"

function RightBar() {
    const [users, setUsers] = useState([])
    const userP = useContext(UserContext)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchUsers = async (user) => {
        const q = query(collection(getFirestore(), 'users'), where('id', '!=', user.id), orderBy('id'), orderBy('followers_count', 'desc'))
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
                await updateDoc(doc(getFirestore(), 'users', userP.user.id),
                    { following_count: increment(1) }
                )
            }
            else {
                await updateDoc(userRef.ref, {
                    followers: arrayRemove(userP.user.tag),
                    followers_count: increment(-1)
                })
                await updateDoc(doc(getFirestore(), 'users', userP.user.id),
                    { following_count: increment(-1) }
                )
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
            <div className="who-to-follow">
                <h2 className="title">Who to Follow</h2>
                {userP.user && users.map(user => (
                    <UserPreview data={user.data()}>
                        <button className="follow-button" onClick={()=>handleFollow(user)}>Follow</button>
                    </UserPreview>
                ))}
            </div>
        </section>
    )
}
export default RightBar