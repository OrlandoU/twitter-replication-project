import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../UserContext"
import Signin from "./Signin"
import '../../assets/css/RightBar.css'

function RightBar() {
    const [users, setUsers] = useState([])
    const userP = useContext(UserContext)

    const fetchUsers = async () => {
        const q = query(collection(getFirestore(), 'users'))
        const users = await getDocs(q)
        setUsers(users.docs)
    }

    const handleFollow = async (tag) => {
        try {
           const q = await query(collection(getFirestore(), 'relationships'), where('follower_id', '==' , userP.user.tag) , where('followed_id', '==', tag) )
           const rel = await getDocs(q)
           if(!rel.size){
            await addDoc(collection(getFirestore(), 'relationships'), {
                follower_id : userP.user.tag,
                followed_id: tag,
                created_at: new Date().getTime()
            })
           }
        } catch (error) {
            console.error('Error handling follow request', error)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <section className="right-bar">
            <Signin />
            {userP.user && users.map(user => (
                user.data().tag !== userP.user.tag && (
                    <span>
                        <div className="username">{user.data().name}</div>
                        <button onClick={()=>handleFollow(user.data().tag)}>Follow</button>
                    </span>
                )
            ))}
        </section>
    )
}
export default RightBar