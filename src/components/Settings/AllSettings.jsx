import { getAuth } from "firebase/auth"
import { NavLink } from "react-router-dom"

function AllSettings() {

    return (
        <div className="chats">
            <div className="chats-head">
                <h2>Settings</h2>
            </div>

            <div className="settings">
                {getAuth().currentUser &&
                    <NavLink to='/settings/account' className="setting account">
                        <div className="setting-name">
                            Your Account
                        </div>
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="setting-button"><g><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"></path></g></svg>
                    </NavLink>
                }
                <NavLink to='/settings/display' className="setting account">
                    <div className="setting-name">
                        Display
                    </div>
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="setting-button"><g><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"></path></g></svg>
                </NavLink>
            </div>
        </div>
    )
}

export default AllSettings