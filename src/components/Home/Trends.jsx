import { collection, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore"
import { useEffect } from "react"
import { useState } from "react"
import { Link } from "react-router-dom"

function Trends(){
    const [trends, setTrends] = useState([])

    const fetchTrends = async () => {
        const q = query(collection(getFirestore(), 'trends'), orderBy('count', 'desc'), limit(6))
        const docs = await getDocs(q)
        setTrends(docs.docs)
    }

    useEffect(()=>{
        fetchTrends()
    })

    return (
        <div className="trends">
            <h2 className="title">Trending</h2>
            {trends.map(trend=>(
                <Link to={`/query/${trend.id}`} className={'trend'}>
                    <div className="trend-name">{trend.id}</div>
                    <div className="trend-count">{trend.data().count} {trend.data().count > 1 ?'Tweets': 'Tweet'}</div>
                </Link>
            ))}
        </div>
    )
}

export default Trends