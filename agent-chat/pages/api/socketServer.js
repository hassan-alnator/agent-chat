import Server from 'socket.io'
import Cors from 'cors'

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

const cors = Cors({
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
})

const users = {};
const agents = {};
const chatRequests = [];

const connections = {};

const ioManager = (io) => {
    io.on('connection', socket => {

        ///////////////////////////////////
        /////// Client Listeners //////////
        ///////////////////////////////////

        socket.on('client:register', ({ user, history }) => {
            users[user.id] = { user, socket, history };
            chatRequests.push(user)

            const registerdAgents = Object.keys(agents);

            if (registerdAgents.length > 0) {
                agents[registerdAgents[registerdAgents.length - 1]].socket.emit('client:agent:request', { user, history })
            }
        });



        ///////////////////////////////////
        /////// Agents Listeners //////////
        ///////////////////////////////////

        socket.on('agent:register', agent => {
            console.log('agent:register', agent)
            agents[agent.id] = { agent, socket };
        });

        socket.on('agent:client:accept', ({ user, agent }) => {
            console.log("agent accepting request", user)
            const userSocket = users[user.id].socket;
            userSocket.emit('agent:accepted', agent);
        })

    })
}

const ioHandler = async (req, res) => {

    await await runMiddleware(req, res, cors);
    console.log("users", users)
    console.log("agents", agents)
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io')

        const io = new Server(res.socket.server)

        ioManager(io)

        res.socket.server.io = io
    } else {
        const io = res.socket.server.io
        ioManager(io)
        console.log('socket.io already running', res.socket.server.io)
    }
    res.end()
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default ioHandler