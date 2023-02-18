import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import { arrayRemove, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore"
import { useRef, useState } from "react"
import { useContext } from "react"
import { UserContext } from "../../Contexts/UserContext"
import { Popup } from "../../Contexts/PopupContext"
import Loader from "../Loader"
import Modal from "../Modal"
import { useNavigate } from "react-router-dom"

function Account() {
    const [progress, setProgress] = useState(0)
    const navigate = useNavigate()
    const user = useContext(UserContext).user
    const popup = useContext(Popup)
    const deleteRef = useRef()

    const getFormattedDate = (time) => {
        const date = new Date(time); // replace with your desired date
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);

        return formattedDate
    }

    const getFormattedTime = (time) => {
        const currentDate = new Date(time);

        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // "0" should be "12"

        minutes = minutes < 10 ? '0' + minutes : minutes;

        const formattedTime = hours + ':' + minutes + ' ' + ampm;
        return formattedTime;
    }

    const handleResetPassword = async () => {
        popup("We've sent you an email with instructions on how to reset your password")
        await sendPasswordResetEmail(getAuth(), getAuth().currentUser.email || user.email)
    }

    const handleDelete = async () => {
        setProgress(0.2)
        //Removing Chats and Messages
        const chats = await getDocs(query(collection(getFirestore(), 'chats'), where('participants', 'array-contains', user.id)));
        // Delete each document in the collection
        setProgress(.3)
        for (const doc of chats.docs) {
            const messages = await getDocs(query(collection(getFirestore(), 'messages'), where('chat_id', '==', doc.id)))
            for(const message of messages.docs){
                await deleteDoc(message.ref)
            }
            await deleteDoc(doc.ref);
        }
        setProgress(.4)
        const tweets = await getDocs(query(collection(getFirestore(), 'tweets'), where('userId', '==', user.id)))
        for (const doc of tweets.docs) {
            let tweetData = doc.data()
            if (!tweetData.replies_count) {
                await deleteDoc(doc.ref)
            } else {
                await setDoc(doc.ref, {
                    parent_tweet: tweetData.parent_tweet,
                    parent_tweet_user: tweetData.parent_tweet_user,
                    deleted: true,
                    text: 'Account deleted, tweet not longer available'
                })
            }
        }
        setProgress(.6)
        const mentions = await getDocs(query(collection(getFirestore(), 'tweets'), where('mentions', 'array-contains', user.tag)))
        for (const doc of mentions.docs) {
            let regex = new RegExp(`<a\\b[^>]*href="#/${user.tag}"[^>]*>(.*?)<\\/a>`, 'gi')
            let content = doc.data().content.replace(regex, user.tag)
            await updateDoc(doc.ref, {
                content: content,
                mentions: arrayRemove(user.tag)
            })
        }

        const notifications = await getDocs(query(collection(getFirestore(), 'notifications'), where('userTag', '==', user.tag)))
        for(const noti of notifications.docs){
            await deleteDoc(noti.ref)
        }
        setProgress(1)
        let userRef = await getDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid))
        await deleteDoc(userRef.ref)
        await getAuth().currentUser.delete()
        navigate('/')
    }

    if (!user) {
        return <Loader />
    }

    return (
        <main className="main-setting">
            <Modal refToObject={deleteRef} className={'delete-modal'}>
                <h2>Delete Account</h2>
                <p>Are you sure you want to delete your account? This action cannot be undone. Click the button below to permanently delete your profile, tweets, media, and followers.</p>
                <button className="reset-password delete small" onClick={handleDelete}>Delete Account</button>
                <div className="loadBar-modal" style={{ transform: `scaleX(${progress})` }}></div>
            </Modal>
            <h2 className="sticky">Your Account</h2>
            <p>See information about your account, change your password, or learn about your account deactivation options</p>

            <section className="account-information">
                <h3>Account Information</h3>
                <div className="account-subsection">
                    <span>Name</span>
                    <span>{user.name}</span>
                </div>
                <div className="account-subsection">
                    <span>Username</span>
                    <span>{user.tag}</span>
                </div>
                <div className="account-subsection">
                    <span>Email</span>
                    <span>{getAuth().currentUser.email}</span>
                </div>
                <div className="account-subsection">
                    <span>Account Creation</span>
                    <span>{getFormattedDate(user.created_at) + ' - ' + getFormattedTime(user.created_at)}</span>
                </div>
                <div className="account-subsection">
                    <span>Birth Date</span>
                    <span>{getFormattedDate(user.date)}</span>
                </div>
                <div className="account-subsection">
                    <span>Location</span>
                    <span>{user.location || 'Not Set'}</span>
                </div>
                <div className="account-subsection">
                </div>
            </section>
            <section className="account-information">
                <h3>Password Reset</h3>
                <p>Forgot your password? Click here to reset it via email. We'll send you a link to reset your password to the email address associated with your account. Check your inbox for further instructions and be sure to check your spam folder if you don't see the email within a few minutes.</p>
                <button className="reset-password" onClick={handleResetPassword}>Send Password Reset Email</button>
            </section>
            <section className="account-information">
                <h3>Delete Account</h3>
                <p>Are you sure you want to delete your Twitter account? Once your account is deleted, your profile, tweets, media, and followers will be permanently removed. Please note that this action cannot be undone. To proceed with the account deletion, click the button below.</p>
                <button className="reset-password delete" ref={deleteRef}>Delete Account</button>
            </section>
        </main>
    )
}

export default Account