import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/Layout';
import Messenger from "../components/Messanger";
import RequestCard from "../components/RequestCard";
import WikiCard from "../components/WikiCard"
import SearchBox from "../components/SearchBox"
const sampleRequests = [
    { "id": 3, "name": "Matt Daniels", "avatarUrl": "https://media-exp1.licdn.com/dms/image/C4D03AQEYPCZBUukfbw/profile-displayphoto-shrink_200_200/0?e=1606348800&v=beta&t=jaGfAzSBHAl885nChPs1QqYEm6-akZ2SCUWc_MGOHsQ", "history": [], "status": "inactive" },
    { "id": 4, "name": "Matt Daniels", "avatarUrl": "https://media-exp1.licdn.com/dms/image/C4D03AQEYPCZBUukfbw/profile-displayphoto-shrink_200_200/0?e=1606348800&v=beta&t=jaGfAzSBHAl885nChPs1QqYEm6-akZ2SCUWc_MGOHsQ", "history": [], "status": "inactive" }
]

const snippets = [
    { text: "Hello , How Can I Help You Today ?" },
    { text: "Am Sorry, I understand your frustration !" }
]

const agent = {
    id: 2,
    avatarUrl: "https://pbs.twimg.com/profile_images/1005015781200093184/c8hbxsYL.jpg",
    name: "Hasan Alnatour"
}

let activeSocket = false;

export default () => {
    const [activeUser, setActiveUser] = useState(false);
    const [userRequests, setUserRequests] = useState([...sampleRequests]);
    const [userHistory, setUserHistory] = useState([]);


    useEffect(() => {

        const socket = io("https://websocket.avertra.dev")

        socket.on('connect', () => {
            console.log('connect')
            activeSocket = socket;
            socket.emit('agent:register', agent)
        })

        socket.on('client:agent:request', ({ user, history }) => {
            console.log('new client:agent:request');
            setUserRequests([...userRequests, { ...user, history, status: "active" }]);
        })



        socket.on('disconnect', () => {
            console.log('disconnect')
            activeSocket = false
        })
    }, [])


    const acceptUserRequest = (user) => {
        console.log("activeSocket", activeSocket)
        if (activeSocket) {
            console.log(user)
            activeSocket.emit("agent:client:accept", { user, agent });
            setActiveUser(user);
            setUserHistory(user.history)
            setUserRequests([...userRequests.filter(ur => ur.status !== "active"), { ...user, status: "inactive" }]);
        } else {
            console.log("not connected");
        }
    }

    return (
        <Layout>

            {
                userRequests.map((requests, index) => {
                    return <div key={`request-${index}`} >
                        <RequestCard {...requests} onAccept={() => acceptUserRequest(requests)} />
                    </div>
                })
            }

            <div style={{ clear: "both" }}></div>
            <div style={{ display: "flex", background: "#eee", padding: 5 }}>
                <div style={{
                    flex: 1, border: "1px solid #64b5f6",
                    borderRadius: 15,
                    padding: 10
                }}>
                    <Typography variant="h5" component="h2" style={{ color: "#64b5f6", fontWeight: 100, marginBottom: 15, fontSize: "1.2rem" }}>
                        Scripts Toolbox
                    </Typography>



                    {snippets.map(snip => <WikiCard {...snip} />)}

                </div>
                <Messenger user={activeUser} agent={agent} history={userHistory} socket={activeSocket} />
                <div style={{
                    flex: 1, border: "1px solid #26a69a",
                    borderRadius: 15,
                    padding: 10
                }}>

                    <Typography variant="h5" component="h2" style={{ color: "#26a69a", fontWeight: 100, marginBottom: 15, fontSize: "1.2rem" }}>
                        Wiki
                    </Typography>

                    <SearchBox />

                </div>
            </div>
        </Layout>
    )
}