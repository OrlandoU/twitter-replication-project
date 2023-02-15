import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, getFirestore, increment, orderBy, query, setDoc, updateDoc, user, where } from "firebase/firestore"
import { useEffect } from "react"
import { useContext } from "react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { UserContext } from "../../Contexts/UserContext"
import UserPreview from "../Main/UserPreview"

function People() {
    const url = useParams()
    const userP = useContext(UserContext)
    const [users, setUsers] = useState([])

    const fetchUsers = async () => {
        const q = query(collection(getFirestore(), 'users'), where('name_substring', 'array-contains', url.query.toLowerCase()), where('id', '!=', userP.user.id))
        const docs = await getDocs(q)
        setUsers(docs.docs)
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
                await setDoc(doc(getFirestore(), 'notifications', userRef.id + 'follow'), {
                    userTag: userData.tag,
                    type: 'likes',
                    viewed: false,
                    text: 'followed you',
                    users: [userRef.id],
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime()
                })
            }
            else {
                await updateDoc(userRef.ref, {
                    followers: arrayRemove(userP.user.tag),
                    followers_count: increment(-1)
                })
                await updateDoc(doc(getFirestore(), 'users', userP.user.id),
                    { following_count: increment(-1) }
                )
                await deleteDoc(doc(getFirestore(), 'notifications', userRef.id + 'follow'))
            }
        } catch (error) {
            console.error('Error handling follow request', error)
        }
    }

    const isFollowing = (userData) => {
        return userData.followers.includes(userP.user.tag)
    }

    useEffect(() => {
        if (userP.user) {

            fetchUsers()
        }
    }, [userP])

    return (
        users.map(user => (
            <UserPreview
                id={user.data().id} className={'tweet query'} path={'/' + user.data().tag} key={user.data().id}>
                <div className="query-user-follow">
                    <button className={isFollowing(user.data()) ? "unfollow-button" : "follow-button"} onClick={() => handleFollow(user)}>{isFollowing(user.data()) ? "Unfollow" : "Follow"}</button>
                </div>
                <div className="query-user-bio">
                    {user.data().bio}
                </div>
            </UserPreview>
        ))
    )
}

export default People