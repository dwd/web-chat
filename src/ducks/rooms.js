import { makeConstant } from "./_helpers";

import forEach from "lodash/forEach";
import omit from "lodash/omit";

const constant = makeConstant("jchat/rooms");

export const JOIN_ROOM = constant("JOIN_ROOM");
export const JOINED_ROOM = constant("JOINED_ROOM");

export const LEAVE_ROOM = constant("LEAVE_ROOM");
export const LEFT_ROOM = constant("LEFT_ROOM");

export const TOPIC_UPDATED = constant("TOPIC_UPDATED");
export const CURRENT_ROOM = constant("CURRENT_ROOM");

export const joinRoom = (jid, nickname) => ({
  type: JOIN_ROOM,
  payload: { jid, nickname }
});

export const joinedRoom = (jid, nickname) => ({
  type: JOINED_ROOM,
  payload: { jid, nickname }
});

export const leaveRoom = (jid, nickname) => ({
  type: LEAVE_ROOM,
  payload: { jid, nickname }
});

export const leftRoom = (jid) => ({
  type: LEFT_ROOM,
  payload: { jid }
});


export const topicUpdated = (message) => ({
  type: TOPIC_UPDATED,
  payload: { message }
});

export const currentRoom = (jid, nickname) => ({
  type: CURRENT_ROOM,
  payload: {
    jid,
    nickname
  }
});

// reducer
export default (state = [], action) => {
  switch (action.type) {

    case JOINED_ROOM: {
      return {
        ...state,
        [action.payload.jid]: {
          jid: action.payload.jid,
          topic: "",
          nickname: action.payload.nickname,
          isCurrent: false
        }
      };
    }

    case LEFT_ROOM: {

      return omit(state, [ action.payload.jid ]);

    }

    case TOPIC_UPDATED: {

        const message = action.payload.message;

        // TODO ensure it exists
        const room = state[message.from.bare];

        return {
            ...state,
            [room.jid]: {
              ...room,
              topic: message.subject
            }
        }
      }

      case CURRENT_ROOM: {

        const room = state[action.payload.jid];
        if(!room) {
          return state;
        }

        forEach(state, function(room) {
          room.isCurrent = false;
        });

        return {
          ...state,
          [room.jid]: {
            ...room,
            isCurrent: true
          }
        };

      }

    default:
      return state;
  }
};
