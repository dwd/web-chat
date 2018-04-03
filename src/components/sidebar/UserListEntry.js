import FontAwesome from 'react-fontawesome';
import React from 'react';

export var UserListEntry = ({roomJid, roomLocal, unread, active, onclick}) => {
    return <li>
        <a onClick={onclick} className={(active) ? "active" : ""}>
            <FontAwesome name='user' /><span className="local">{roomLocal}</span>
            { unread && (
                <span className="unread badge">{unread}</span>
            )} 
            {/* <span className="domain">@{room.jid.domain}</span> */}
        </a>
    </li>
}

export default UserListEntry
