import RightBar from "../Home/RightBar"
import Trends from "../Home/Trends"
import '../../assets/css/Explore.css'
import Home from "../Home/Home"

function Explore() {
    return (
        <>
            <main className="explore-main">
                <Trends/>
                <Home onExplore/>
            </main>
            <RightBar onExplore/>
        </>
    )
}

export default Explore