import { Route, Routes } from "react-router-dom"
import '../../assets/css/Settings.css'
import Account from "./Account"
import AllSettings from "./AllSettings"
import Display from "./Display"

function Settings() {
    return (
        <>
            <AllSettings />
            <Routes>
                <Route path="/account" element={<Account />}/>
                <Route path="/display" element={<Display />} />
            </Routes>
        </>
    )
}

export default Settings