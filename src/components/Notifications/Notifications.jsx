import { NavLink, Route, Routes, useParams } from 'react-router-dom'
import RightBar from '../Home/RightBar'
import '../../assets/css/Notifications.css'
import All from './All'
import Mentions from './Mentions'

function Notifications() {
    const url = useParams()
    return (
        <>
            <main className='notification-main'>
                <div className="notification-header">
                    <h2 className='notification-title'>Notifications</h2>
                    <div className="profile-navbar">
                        <NavLink to={`.`} end={`${url.profileTag}`} className='profile-link'><span className="link-wrapper">All</span></NavLink>
                        <NavLink to={`./mentions`} className='profile-link'><span className="link-wrapper">Mentions</span></NavLink>
                    </div>
                </div>
                <Routes>
                    <Route path={'/'} element={<All />} />
                    <Route path={'/mentions'} element={<Mentions />} />
                </Routes>
            </main>
            <RightBar />
        </>
    )
}

export default Notifications