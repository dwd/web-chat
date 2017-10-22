import { delay } from "redux-saga";
import { all, call, put, race, select, take, takeEvery } from "redux-saga/effects";
import find from "lodash/find";

import { makeChannel } from "../_helpers";

import { 
    SEND_FILE,
    receivedFile,
    receivedFileMeta
} from '../../ducks/files';
import {
    JOINED_ROOM,
    LEAVE_ROOM
} from '../../ducks/rooms';

function* watchJoinRoom(client) {

    yield takeEvery(JOINED_ROOM, function* subscribeToRoomFileNodes(action) {

        let contentNode = 'snippets/' + action.payload.jid + '/content';
        let metaNode = 'snippets/' + action.payload.jid + '/summary';

        // TODO refactor this
        let contentNodeExists = yield call(getNode, client, contentNode);
        if(!contentNodeExists) {
            let createResponse = yield call(createFileNode, client, contentNode);
            if(createResponse.error) {
                // TODO handle error
            }
        }
        let metaNodeExists = yield call(getNode, client, metaNode);
        if(!metaNodeExists) {
            let createResponse = yield call(createFileNode, client, metaNode);
            if(createResponse.error) {
                // TODO handle error
            }
        }

        const subscriptions = yield fetchSubscriptions(client);
        let alreadySubscribedContent = find(subscriptions, function(sub) {
            return sub.node === contentNode;
        });
        let alreadySubscribedMeta = find(subscriptions, function(sub) {
            return sub.node === metaNode;
        });    
        
        const userJid = yield select(state => state.client.jid.bare);

        if(!alreadySubscribedContent) {
            client.subscribeToNode('pubsub.'+window.config.xmppDomain, {
                node: contentNode,
                jid: userJid
            });
        }

        if(!alreadySubscribedMeta) {
            client.subscribeToNode('pubsub.'+window.config.xmppDomain, {
                node: metaNode,
                jid: userJid
            });
        }

    });

}

function* watchLeaveRoom(client) {

    yield takeEvery(LEAVE_ROOM, function* unsubscribeFromRoomFileNodes(action) {

        let contentNode = 'snippets/' + action.payload.jid + '/content';
        let metaNode = 'snippets/' + action.payload.jid + '/summary';
        const userJid = yield select(state => state.client.jid.bare);
        
        client.unsubscribeFromNode('pubsub.'+window.config.xmppDomain, {
            node: contentNode,
            jid: userJid
        });

        client.unsubscribeFromNode('pubsub.'+window.config.xmppDomain, {
            node: metaNode,
            jid: userJid
        });

    });

}

function* fetchSubscriptions(client) {
    const response = yield call([client, client.getSubscriptions], 'pubsub.'+window.config.xmppDomain);
    return response.pubsub.subscriptions.list;
}

function* getNode(client, node) {

    try {
        let response = yield call([client, client.getItem], 'pubsub.'+window.config.xmppDomain, node);
        return response.pubsub.retrieve.node;
    }
    catch(error) {
        console.log('error retrieving node', error);
        return null;
    }

}

function* createFileNode(client, node) {
    try {
        return yield call([client, client.createNode], 'pubsub.'+window.config.xmppDomain, node);
    }
    catch(error) {
        return error;
    }  
}

function* sendFile(client) {

    const successChannel = makeChannel(client, {
        "pubsub:event": (emit, msg) => {
            emit(msg)
        },
    });

    yield takeEvery(SEND_FILE, function* uploadFile(action) {

        let contentNode = 'snippets/' + action.payload.roomJid + '/content';
        let metaNode = 'snippets/' + action.payload.roomJid + '/summary';

        yield call([client, client.publish], 
            'pubsub.'+window.config.xmppDomain, 
            contentNode, 
            {
                json: {
                    data: action.payload.content
                } 
            }
        );

        // TODO need to get the ID of the published item so we can affiliate the meta...

        // TODO handle errors etc


        // TODO submit with SPECIFIC ID which matches the previous...

        yield call([client, client.publish], 
            'pubsub.'+window.config.xmppDomain, 
            metaNode, 
            {
                json: buildContentMeta(action.payload.meta)
            }
        );    

    });

}

function buildContentMeta(meta) {
    return {
        name: meta.name,
        size: meta.size,
        type: meta.type,
        lastModified: meta.lastModified
    };
}

function* watchForFiles(client) {
    
    const channel = makeChannel(client, {
        "pubsub:event": (emit, msg) => {
            emit(msg);
        }
    });

    yield takeEvery(channel, function* eachForm(msg) {

        let updateEvent = msg.event.updated;

        if(!updateEvent.node.startsWith('snippets/')) {
            console.log('doing nothing as not a file node');
            return;
        }

        if(updateEvent.node.endsWith('/content')) {

            // TODO replace with regex
            let roomJid = updateEvent.node.replace("snippets/", "").replace("/content", "");

            console.log('going to call action', updateEvent)

            yield put(receivedFile(roomJid, updateEvent.published[0].id, updateEvent.published[0].json.data));

        } else if(msg.event.updated.node.endsWith('/summary')) {

            let roomJid = msg.event.updated.node.replace("snippets/", "").replace("/summary", "");

            // receivedFileMeta(roomJid, ???)
        }




    });
}


export default function*(client) {
  yield all([
      sendFile(client), 
      watchForFiles(client), 
      watchJoinRoom(client),
      watchLeaveRoom(client)
  ]);
}
