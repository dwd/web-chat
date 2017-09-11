import React from 'react';
import Moment from 'react-moment';
import ReactTooltip from 'react-tooltip'
import Highlighter from 'react-highlight-words';

class Message extends React.Component {

    renderMessage() {

        let msg = this.props.message;

        console.log(msg)

        if(msg.type && msg.type === 'status') {
            return this.renderStatus();
        } else if(msg.subject) {
            return this.renderTopic();
        } else {
            return this.renderChatMessage();
        }
        
    }

    renderChatMessage() {

        let isSelf = (this.props.message.from.resource === this.props.currentNickname);

        return (
            <div className={"chat " + (isSelf ? 'self' : '')}>
                <span className="author">{this.props.message.from.resource}</span>
                <Moment format="h:mm A" data-tip={this.props.message.time}>{this.props.message.time}</Moment>
                <ReactTooltip effect="solid" delayShow={300} offset={{right: 20}} />
                <p>
                    <Highlighter
                    highlightClassName='highlight'
                    searchWords={['surevine']}
                    textToHighlight={this.props.message.body}
                    />
                </p>
            </div>
        );
    }

    renderStatus() {
        return (
            <div className="status">
                <p>{this.props.message.subject}</p>
            </div>
        );
    }

    renderTopic() {
        return (
            <div className="topic">
                <p><span>Room topic: </span> {this.props.message.subject}</p>
            </div>
        );
    }

    render() {
        return (
            <div className="Message">
                { this.renderMessage() }
            </div>
        );
    }

}

export default Message;