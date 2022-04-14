import * as React from 'react';
import { Chat } from '@progress/kendo-react-conversational-ui';

import Notifier from "react-desktop-notification"


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


class Messanger extends React.Component {
    constructor(props) {
        super(props);
        this.user = props.agent;
        this.bot = props.user;
        this.state = {
            messages: props.history,
            socketListerSet: false,
            showToolbar: false,
        };
    }
    componentDidMount() {

        const { user, agent, history } = this.props;

        this.user = agent;
        this.bot = user;

        history.map(msg => {
            let botResponce = Object.assign({}, msg);
            botResponce.text = msg.text;
            botResponce.author = this.bot;

            this.setState(prevState => ({
                messages: [
                    ...prevState.messages,
                    botResponce
                ]
            }));
        })


    }

    handleInputChange = (e) => {
        const { socket, user, agent } = this.props;

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
                socket.emit('agent:user:message', {
                    user,
                    agent,
                    message
                });
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

    addNewMessage = (event) => {

        const { socket, user, agent } = this.props;

        let botResponce = Object.assign({}, event.message);
        botResponce.text = event.message.text;
        botResponce.author = this.user;



        this.setState(prevState => ({
            messages: [
                ...prevState.messages,
                botResponce
            ]
        }));


        socket.emit('agent:user:message', {
            user,
            agent,
            message: botResponce
        });

    };


    render() {
        const { messages, socketListerSet } = this.state;
        const { history, socket, user, agent } = this.props;

        this.user = agent;
        this.bot = user;

        if (socket && !socketListerSet) {
            
            this.setState({
                socketListerSet: true
            });

            socket.on('message', ({ agent, user, message }) => {
                console.log("incoming msg")
                let botResponce = Object.assign({}, message);
                botResponce.text = message.text;
                botResponce.author = this.bot;
                botResponce.timestamp = new Date();
                Notifier.start("A New Message",`${user.name}: ${message.text}`,"#","https://avertra.com/wp-content/uploads/2019/10/avertranegro.jpg", "chat");

                this.setState(prevState => ({
                    messages: [
                        ...prevState.messages,
                        botResponce
                    ]
                }));

            });
        }

        const listOfMessages = [
            ...history.map(msg => ({ ...msg, timestamp: new Date() })),
            ...messages
        ]
        console.log(listOfMessages)
        return (
            <div style={{flex:3, paddingRight:5, paddingLeft: 5}}>
                <Chat user={this.user}
                    messages={[...listOfMessages]}
                    onMessageSend={this.addNewMessage}
                    placeholder={"Type a message..."}
                    width={"100%"}
                    attachmentTemplate={AttachmentTemplate}
                    showToolbar={this.state.showToolbar}
                    onToolbarActionExecute={e => this.setState({ showToolbar: !this.state.showToolbar })}
                    toolbar={<this.Toolbar />}
                    >
                </Chat>
            </div>
        );
    }
}

export default Messanger;