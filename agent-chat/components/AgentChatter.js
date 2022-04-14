import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Typography from '@material-ui/core/Typography';
import Notifier from "react-desktop-notification"

import Layout from '../components/Layout';
import Messenger from "../components/Messanger";
import RequestCard from "../components/RequestCard";
import WikiCard from "../components/WikiCard"
import SearchBox from "../components/SearchBox"

import Lottie from 'react-lottie';

import connectAnimiation from '../animations/connect';
import connectTheDots from '../animations/24072-connecting-the-dots.json'


const accStyle = {
    textAlign: "center",
    background: "lightblue",
    padding: "0.5rem",
    marginRight: "0.5rem",
    marginLeft: "0.5rem",
    borderRadius: "5px"
} 

const createOptions = (animation) => {
    return ({
        loop: true,
        autoplay: true,
        animationData: animation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    });
}


const sampleRequests = [
    // { "id": 3, "name": "Matt Daniels", "avatarUrl": "https://media-exp1.licdn.com/dms/image/C4D03AQEYPCZBUukfbw/profile-displayphoto-shrink_200_200/0?e=1606348800&v=beta&t=jaGfAzSBHAl885nChPs1QqYEm6-akZ2SCUWc_MGOHsQ", "history": [], "status": "inactive" },
    // { "id": 4, "name": "Matt Daniels", "avatarUrl": "https://media-exp1.licdn.com/dms/image/C4D03AQEYPCZBUukfbw/profile-displayphoto-shrink_200_200/0?e=1606348800&v=beta&t=jaGfAzSBHAl885nChPs1QqYEm6-akZ2SCUWc_MGOHsQ", "history": [], "status": "inactive" }
]

const snippets = [
    { text: "Hello , How Can I Help You Today ?" },
    { text: "Am Sorry, I understand your frustration !" }
]

const agent = {
    id: 2,
    avatarUrl: "https://i.ibb.co/jZm5kqb/Screen-Shot-2020-10-06-at-4-01-15-PM.png",
    name: "Volker"
}

let activeSocket = false;

export default function AgentChatter() {
    const [activeUser, setActiveUser] = useState(false);
    const [userRequests, setUserRequests] = useState([...sampleRequests]);
    const [userHistory, setUserHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {

        const socket = io("https://websocket.avertra.dev")

        socket.on('connect', () => {
            console.log('connect')
            activeSocket = socket;
            socket.emit('agent:register', agent)
        })

        socket.on('client:agent:request', ({ user, history }) => {
            console.log('new client:agent:request', user);
            setUserRequests([...userRequests, { ...user, history, status: "active" }]);
            Notifier.start("Incoming Chat Request",user.name,"#","https://avertra.com/wp-content/uploads/2019/10/avertranegro.jpg", "chat");

        })



        socket.on('disconnect', () => {
            console.log('disconnect')
            activeSocket = false
        })

        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
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
    if (isLoading) {
        return <center>
            <br /><br /><br /><br /><br /><br /><br /><br /><br />
            <Lottie options={createOptions(connectAnimiation)}
                height={300}
                width={300}
                isStopped={false}
                isPaused={false}
            />
        </center>
    }
    return (
        <Layout>

            {
                userRequests.length === 0 && <Lottie options={createOptions(connectTheDots)}
                    height={100}
                    width={500}
                    isStopped={false}
                    isPaused={false}
                />
            }

            {

                userRequests.map((requests, index) => {
                    return <div key={`request-${index}`} >
                        <RequestCard {...requests} onAccept={() => acceptUserRequest(requests)} />
                    </div>
                })
            }

            <div style={{ clear: "both" }}></div>
            {activeUser && <p style={accStyle}> Account # <b>{activeUser.accountNumber}</b></p>}
            <div style={{ clear: "both" }}></div>
            <div style={{ background: "#eee", padding: 5, display: isLoading ? "none" : "flex" }}>
           
                {/*<div style={{
                    flex: 1, border: "1px solid #64b5f6",
                    borderRadius: 15,
                    padding: 10
                }}>
                    <Typography variant="h5" component="h2" style={{ color: "#64b5f6", fontWeight: 100, marginBottom: 15, fontSize: "1.2rem" }}>
                        Scripts Toolbox
                    </Typography>



                    {snippets.map(snip => <WikiCard {...snip} />)}

            </div>*/}
                <Messenger user={activeUser} agent={agent} history={userHistory} socket={activeSocket} />
                {/*<div style={{
                    flex: 1, border: "1px solid #26a69a",
                    borderRadius: 15,
                    padding: 10
                }}>

                    <Typography variant="h5" component="h2" style={{ color: "#26a69a", fontWeight: 100, marginBottom: 15, fontSize: "1.2rem" }}>
                        Wiki
                    </Typography>

                    <SearchBox />

            </div>*/}
            </div>
        </Layout>
    )
};