import { NavLink, Route, Routes, useParams } from "react-router-dom"
import SearchBar from "../Home/SearchBar"
import Lastest from "./Lastest"
import People from "./People"
import Top from "./Top"

function Query(){
    const url = useParams()

    return (
        <main>
            <div className="notification-header">
                <SearchBar value={url.query}/>
                <div className="profile-navbar">
                    <NavLink to={`.`} end={`${url.profileTag}`} className='profile-link'><span className="link-wrapper">Top</span></NavLink>
                    <NavLink to={`./lastest`} className='profile-link'><span className="link-wrapper">Lastest</span></NavLink>
                    <NavLink to={`./people`} className='profile-link'><span className="link-wrapper">People</span></NavLink>
                    <NavLink to={`./photos`} className='profile-link'><span className="link-wrapper">Photos</span></NavLink>
                    <NavLink to={`./videos`} className='profile-link'><span className="link-wrapper">Videos</span></NavLink>
                </div>
            </div>
            <Routes>
                <Route path={'/'} element={<Top />} />
                <Route path={'/lastest'} element={<Lastest />} />
                <Route path={'/people'} element={<People />} />
                <Route path={'/photos'} element={<div></div>} />
                <Route path={'/videos'} element={<div></div>} />
            </Routes>
        </main>
    )
}

export default Query