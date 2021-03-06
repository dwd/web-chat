import React from 'react';
import { connect } from "react-redux";
import Spinner from 'react-spinkit';

import history from '../history';

import { receivedMessage } from '../ducks/messages';
import { receivedPresenceAvailable, receivedPresenceUnavailable } from '../ducks/presence';
import { joinRoom, topicUpdated, showRoom, hideRoom, hideModal, leaveRoom } from '../ducks/rooms';
import { addBookmark, removeBookmark } from '../ducks/bookmarks';
import { loadSettings } from '../ducks/settings';

import { 
    getRoomInfo, 
    getRoomMessages, 
    getRoomMembers,
    getRoomForms, 
    getRoomFiles,
    isRoomBookmarked } from '../selectors';

import RoomHeader from '../components/room/RoomHeader';
import RoomSidebar from '../components/room/RoomSidebar';
import MessageList from '../components/room/MessageList';
import MessageForm from '../components/room/MessageForm';
import ViewFormModal from '../components/modals/ViewFormModal';
import ViewFileModal from '../components/modals/ViewFileModal';

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roomJid: props.match.params.jid,
            showRoomSidebar: false,
            showParticipantsList: false,
            showFormsList: false,
            showFilesList: false,
        };
    }

    componentDidMount() {

        this.props.loadSettings();

        if(this.state.roomJid) {
            this.props.showRoom(this.state.roomJid, this.props.nickname);
        }

    }

    componentWillUnmount() {
        this.props.hideRoom(this.state.roomJid);
    }

    componentWillUpdate(nextProps, nextState) {
        if(nextProps.match.params.jid !== this.state.roomJid) {

            // Close sidebar when joining new room /
            // room we're not connected to
            if(!nextProps.room.joined) {
                this.hideSidebar();
            }

            this.setState(function(prevState, props) {
                return {
                    ...prevState,
                    roomJid: nextProps.match.params.jid
                };
            });

            this.props.showRoom(nextProps.match.params.jid, this.props.nickname);
        }
    }

    render() {
        return (
        <div className={"Room" + (this.state.showRoomSidebar ? ' sidebar' : '')}>

            <RoomHeader 
                jid={this.props.room.jid} 
                bookmarked={this.props.bookmarked}
                topic={this.props.room.topic} 
                members={this.props.members}
                forms={this.props.forms}
                files={this.props.files}
                toggleBookmark={this.toggleBookmark}
                toggleSidebarSection={this.toggleSidebarSection}
                leaveRoom={this.leaveRoom} />

            <div className="roomContent">

            { (this.props.room.joined) ? (
    
                <MessageList currentNickname={this.state.nickname} messages={this.props.messages}></MessageList>

            ) : (

                <div className="roomError">
                { (this.props.room.error) ? (
                    this.renderError(this.props.room.error)
                ) : (
                    <Spinner className="loading" name="folding-cube" color="#8190B0"/>
                )}
                </div>

            )}

                <MessageForm enabled={this.props.room.joined} roomJid={this.props.room.jid}></MessageForm>

            </div>

            { this.state.showRoomSidebar && (
                
                <RoomSidebar 
                    hideSidebar={this.hideSidebar}
                    showParticipantsList={this.state.showParticipantsList}
                    showFormsList={this.state.showFormsList}
                    showFilesList={this.state.showFilesList}
                    members={this.props.members}
                    forms={this.props.forms}
                    files={this.props.files} />
            )}

            <ViewFormModal form={this.props.room.activeForm} isOpen={this.props.room.showFormModal} onClose={this.hideModal.bind(this)} />
            <ViewFileModal room={this.props.room} file={this.props.room.activeFile} isOpen={this.props.room.showFileModal} onClose={this.hideModal.bind(this)} />

        </div>
        );
    }

    renderError(error) {
        switch(error.condition) {
            case "not-authorized":
                return (
                    <div className="roomErrorWrapper">
                        <h5>Authentication Error</h5>
                        <p>Incorrect password provided. Please try again.</p>
                    </div>
                );
            default:
                return null;
        }
    }

    hideSidebar = e => {
        if(e) {
            e.preventDefault();
        }
        this.setState({ 
            showRoomSidebar: false,
            showParticipantsList: false,
            showFormsList: false,
            showFilesList: false
        })
    };

    toggleBookmark = e => {
        e.preventDefault();
        if(this.props.bookmarked) {
            this.props.removeBookmark(this.props.room.jid);
        } else {
            this.props.addBookmark(this.props.room.jid);
        }
    };

    toggleSidebarSection = section => {

        if(!this.props.room.joined) {
            return;
        }

        let sectionProperty = '';
        switch(section) {
            case "files":
                sectionProperty = 'showFilesList';
                break;
            case "forms":
                sectionProperty = 'showFormsList';
                break;
            case "participants":
                sectionProperty = 'showParticipantsList';
                break;
            default:
                return;
        }

        this.setState(function(prevState, props) {
            
            let showSidebar = false;
            if(!prevState[sectionProperty]) {
                showSidebar = true;
            }

            let sidebarState = {
                ...prevState,
                showRoomSidebar: showSidebar,
                showParticipantsList: false,
                showFormsList: false,
                showFilesList: false
            };
            sidebarState[sectionProperty] = !prevState[sectionProperty];

            return sidebarState;
        });

    }

    hideModal = () => {
        this.props.hideModal(this.props.room.jid);
    }

    leaveRoom = e => {
        e.preventDefault();
        this.props.leaveRoom(this.state.roomJid);
        history.push('/');
    }

}

const mapStateToProps = (state, props) => ({
  room: getRoomInfo(state, { roomJid: props.match.params.jid }),
  rooms: state.rooms,
  nickname: state.user.nickname,
  bookmarked: isRoomBookmarked(state, { roomJid: props.match.params.jid }),
  messages: getRoomMessages(state, { roomJid: props.match.params.jid }),
  members: getRoomMembers(state, { roomJid: props.match.params.jid }),
  forms: getRoomForms(state, { roomJid: props.match.params.jid }),
  files: getRoomFiles(state, { roomJid: props.match.params.jid })
});

const mapDispatchToProps = (dispatch, props) => {
  return {
    addBookmark: (jid) => dispatch(addBookmark(jid)),
    removeBookmark: (jid) => dispatch(removeBookmark(jid)),
    showRoom: (jid, nickname) => dispatch(showRoom(jid, nickname)),
    hideRoom: (jid) => dispatch(hideRoom(jid)),
    hideModal: (jid) => dispatch(hideModal(jid)),
    joinRoom: (jid, nickname, password) => dispatch(joinRoom(jid, nickname, password)),
    leaveRoom: (jid) => dispatch(leaveRoom(jid)),
    loadSettings: () => dispatch(loadSettings()),
    receivedMessage: (msg) => dispatch(receivedMessage(msg)),
    topicUpdated: (msg) => dispatch(topicUpdated(msg)),
    receivedPresenceAvailable: (presence) => dispatch(receivedPresenceAvailable(presence)),
    receivedPresenceUnavailable: (presence) => dispatch(receivedPresenceUnavailable(presence)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Room);