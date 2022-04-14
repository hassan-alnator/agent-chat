import * as React from 'react';

import Popover from '@material-ui/core/Popover';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/ChatTwoTone';
import { Chat } from '@progress/kendo-react-conversational-ui';
import Layout from '../components/Layout'
import Lottie from 'react-lottie';
import io from 'socket.io-client'

import chatingAnimiation from '../animations/chating.json';
import agentAnimation from '../animations/agent.json';

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

const AttachmentTemplate = (props) => {
    let attachment = props.item;
    return (
        <div className="k-card k-card-type-rich">
            <div className="k-card-body quoteCard">
                <img style={{ maxHeight: '250px' }} src={attachment.content} draggable={false} />
            </div>
        </div>
    )
}


const callPhone = () => {

    //return new Promise((resolve, reject) => {
    var url = "https://us-south.functions.cloud.ibm.com/api/v1/namespaces/bbseirani%40avertra.com_dev/actions/callNumber?blocking=true";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // xhr.timeout = 15000;
    xhr.setRequestHeader("Authorization", "Basic NjM1YmUxZGUtODZlOS00NDNmLWIyZWYtYzMwMmRmMjk5MzA3Ok9PWkt3dmpEd3N3c2liQWJzbHU5UDVMM1I1MjVsZ0pMazdYQ2JTWnAwVzU1dWdyOGZlcHg2MEJYU2ZFR3c1ZVg=");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
            //resolve()
        }
    };

    xhr.send();

    //})
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.user = {
            id: 1,
            name: "Matt Daniels",
            avatarUrl: "https://media-exp1.licdn.com/dms/image/C4D03AQEYPCZBUukfbw/profile-displayphoto-shrink_200_200/0?e=1606348800&v=beta&t=jaGfAzSBHAl885nChPs1QqYEm6-akZ2SCUWc_MGOHsQ",
            accountNumber: "123123123"
        };
        this.bot = { id: 0, name: "ChatBot", avatarUrl: "https://png.pngtree.com/element_our/20190601/ourlarge/pngtree-robot-free-button-png-picture-image_1338309.jpg" };
        this.state = {
            mode: "bot",
            isLoading: false,
            trasferToAgent: false,
            connectedToAgent: false,
            userSocketRegistered: false,
            agent: false,
            messagesCache: null,
            showToolbar: false,
            messages: [
                {
                    author: this.bot,
                    suggestedActions: [
                        {
                            type: 'reply',
                            value: 'Bill Amount. '
                        }, {
                            type: 'reply',
                            value: 'Account Registration. '
                        }
                    ],
                    timestamp: new Date(),
                    text: "Hello, how can i help you today ?"
                }
            ],
            anchorEl: null
        };


    }

    handleInputChange = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onloadend = (event) => {
            let message = {
                author: this.user,
                text: '',
                attachments: [{
                    content: event.target.result,
                    contentType: 'image/'
                }]
            }
            this.setState((prevState) => ({
                messages: [
                    ...prevState.messages,
                    message
                ],
                showToolbar: false
            }));

            if (this.state.mode !== "bot") {
                this.socket.emit('user:agent:message', { agent: this.state.agent, user: this.user, message });
            }
        };
        reader.readAsDataURL(file);
    }

    Toolbar = () => {
        return (
            <span>
                <input type='file' onChange={this.handleInputChange} style={{ display: 'none' }} ref={el => this.fileUpload = el} />
                <button className="sendimage k-button k-button-icon" onClick={() => this.fileUpload.click()}>
                    <span className="k-icon k-i-image" />
                </button>
            </span>
        );
    }

    addNewMessage = async (event) => {

        this.setState((prevState) => ({
            isLoading: true,
            messages: [
                ...prevState.messages,
                event.message
            ]
        }));

        if (this.state.mode === "bot") {
            const botResponse = await fetch(`https://agent-chat.vercel.app/api/chat?text=${encodeURIComponent(event.message.text)}`)
                .then(response => response.json())
                .catch(e => console.log(e))

            let botResponce = Object.assign({}, event.message);
            botResponce.text = botResponse.text;
            botResponce.author = this.bot;

            const trasferToAgent = botResponce.text === "No worries. Volker is available and will be helping you shortly" ? true : false;

            const makeCall = botResponce.text === "Ok stand by while i transfer you to Erynn" ? true : false;

            if (makeCall) {
                try {
                    console.log("makeCall", makeCall)
                    callPhone();
                } catch (e) {
                    console.log(e)
                }
            }

            this.setState(prevState => ({
                isLoading: false,
                messages: [
                    ...prevState.messages,
                    botResponce
                ]
            }));

            if (trasferToAgent) {
                setTimeout(() => {
                    this.setState(prevState => ({
                        isLoading: false,
                        messagesCache: trasferToAgent ? [
                            ...prevState.messages,
                            // botResponce
                        ] : null,
                        messages: trasferToAgent ? [] : [
                            ...prevState.messages,
                            // botResponce
                        ],
                        trasferToAgent
                    }));
                }, 1500);
            }

        } else {

            let botResponce = Object.assign({}, event.message);
            botResponce.text = event.message.text;
            botResponce.author = this.bot;

            this.socket.emit('user:agent:message', { agent: this.state.agent, user: this.user, message: botResponce });

        }
    };



    setAnchorEl = (anchorEl) => this.setState({ anchorEl })

    handleClick = (event) => {
        this.setAnchorEl(event.currentTarget);
    };

    handleClose = () => {
        this.setAnchorEl(null);
    };

    renderLoading = () => {
        return (
            <div style={{ position: "absolute", bottom: 35, left: 125 }}>
                <Lottie options={createOptions(chatingAnimiation)}
                    height={100}
                    width={100}
                    isStopped={false}
                    isPaused={false}
                />
            </div>
        )
    }

    renderTrasferToAgent = () => {
        return (
            <div style={{ position: "absolute", bottom: 200, left: 140, textAlign: "center" }}>
                <Lottie options={createOptions(agentAnimation)}
                    height={200}
                    width={200}
                    isStopped={false}
                    isPaused={false}
                />

                <p style={{ fontSize: 11 }}>Connecting With An Agent ...</p>
            </div>
        )
    }


    connectedToLiveAgent = () => {


        const socket = io('https://websocket.avertra.dev')
        this.socket = socket;

        socket.on('connect', () => {

            socket.emit('client:register', { user: this.user, history: this.state.messagesCache });

            this.setState({
                userSocketRegistered: true,
                mode: "live"
            });

            socket.on('agent:accepted', agent => {
                if (!this.state.agent) {
                    let botResponce = {};
                    botResponce.text = `Connected with ${agent.name}`;
                    botResponce.author = agent;
                    agent.avatarUrl = "https://i.ibb.co/jZm5kqb/Screen-Shot-2020-10-06-at-4-01-15-PM.png"

                    this.bot = agent;
                    this.setState(prevState => ({
                        connectedToAgent: true,
                        messages: [
                            ...prevState.messages,
                            botResponce
                        ],
                        agent
                    }));
                }
            });

            this.socket.on('message', ({ agent, user, message }) => {

                let botResponce = Object.assign({}, message);;
                botResponce.text = message.text;
                botResponce.author = this.bot;
                botResponce.timestamp = new Date();

                this.setState(prevState => ({
                    isLoading: false,
                    messages: [
                        ...prevState.messages,
                        botResponce
                    ]
                }));

            });

        });

        socket.on('disconnect', () => {
            console.log('disconnect')
        });

    }

    render() {

        const { anchorEl, isLoading, trasferToAgent, messages, connectedToAgent, userSocketRegistered } = this.state;

        if (trasferToAgent === true && userSocketRegistered === false && connectedToAgent === false) {
            console.log("connecting to socket Server")
            this.connectedToLiveAgent();
        }

        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;

        return (
            <Layout>

                <Fab color="primary" aria-label="add" aria-describedby={id} onClick={this.handleClick} style={{ position: "absolute", bottom: 10, right: 50 }}>
                    <AddIcon />
                </Fab>

                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={this.handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    {isLoading && this.renderLoading()}
                    {trasferToAgent && !connectedToAgent && this.renderTrasferToAgent()}

                    <Chat
                        user={this.user}
                        messages={messages}
                        onMessageSend={this.addNewMessage}
                        placeholder={"Type a message..."}
                        width={480}
                        attachmentTemplate={AttachmentTemplate}
                        showToolbar={this.state.showToolbar}
                        onToolbarActionExecute={e => this.setState({ showToolbar: !this.state.showToolbar })}
                        toolbar={<this.Toolbar />}
                    >

                    </Chat>
                </Popover>
            </Layout>
        );
    }
}

export default App