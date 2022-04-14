import * as React from 'react';

import Popover from '@material-ui/core/Popover';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/ChatTwoTone';
import { Chat } from '@progress/kendo-react-conversational-ui';

import Lottie from 'react-lottie';
import io from 'socket.io-client'

import chatingAnimiation from './chating.json';
import agentAnimation from './agent.json';

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



class App extends React.Component {
  constructor(props) {
    super(props);
    this.user = {
      id: 1,
      avatarUrl: "https://via.placeholder.com/24/008000/008000.png"
    };
    this.bot = { id: 0 };
    this.state = {
      mode: "bot",
      isLoading: false,
      trasferToAgent: false,
      connectedToAgent: false,
      messagesCache: null,
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

  addNewMessage = async (event) => {

    this.setState((prevState) => ({
      isLoading: true,
      messages: [
        ...prevState.messages,
        event.message
      ]
    }));

    if (this.state.mode === "bot") {
      const botResponse = await fetch(`http://localhost:3000/api/chat?text=${encodeURIComponent(event.message.text)}`)
      .then(response => response.text())
      .catch(e => console.log(e))

      let botResponce = Object.assign({}, event.message);
      botResponce.text = botResponse;
      botResponce.author = this.bot;

      const trasferToAgent = botResponce.text === "transferring to agent" ? true : false

      this.setState(prevState => ({
        isLoading: false,
        messagesCache: trasferToAgent ? [
          ...prevState.messages,
          botResponce
        ] : null,
        messages: trasferToAgent ? [] : [
          ...prevState.messages,
          botResponce
        ],
        trasferToAgent
      }));
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
      <div style={{ position: "absolute", bottom: 200, left: 75, textAlign: "center" }}>
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

    fetch('http://localhost:3000/api/socketServer').finally(() => {
      const socket = io('http://localhost:3000')
      this.socket = socket;

      socket.on('connect', () => {
         
          socket.emit('client:register', this.user);

          this.setState({
            connectedToAgent: true
          });
      })

      socket.on('hello', data => {
          console.log('hello', data)
      })

      socket.on('a user connected', () => {
          console.log('a user connected')
      })

      socket.on('disconnect', () => {
          console.log('disconnect')
      })
  })


    
  }

  render() {

    const { anchorEl, isLoading, trasferToAgent, messages, connectedToAgent } = this.state;

    if (trasferToAgent === true && connectedToAgent === false) {
      console.log("connecting")
      this.connectedToLiveAgent();
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
      <div>

        <Fab color="primary" aria-label="add" aria-describedby={id} onClick={this.handleClick} style={{ position: "absolute", bottom: 10, right: 10 }}>
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

          <Chat user={this.user}
            messages={messages}
            onMessageSend={this.addNewMessage}
            placeholder={"Type a message..."}
            width={350}
          >

          </Chat>
        </Popover>
      </div>
    );
  }
}

export default App