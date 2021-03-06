import React from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import UserInfo from '../header/UserInfo';
import RoomList from './RoomList';

import './Sidebar.css';

class Sidebar extends React.Component {

    render() {

        // if(!this.props.client.authenticated) {
        //     return null;
        // }

        return (
        <div className="Sidebar">

            {this.props.client.authenticated ? (

                <div className="sidebarWrapper">

                    <div className="App-header">
                        <UserInfo />
                    </div>

                    <RoomList />

                    <div className="footer">

                        <div className="controls">
                            <Link to={`/settings`}>
                                <FontAwesome name='cog' className="icon" />
                                Settings
                            </Link>
                            <Link to={`/about`}>
                                <FontAwesome name='info-circle' className="icon" />
                                About
                            </Link>
                            <Link to={`/logout`}>
                                <FontAwesome name='sign-out' className="icon" />
                                Sign out
                            </Link>
                        </div>

                    </div>

                </div>

            ) : (

                null

            )}



        </div>
        );
    }

}

const mapStateToProps = (state, props) => ({
  client: state.client
});

export default connect(mapStateToProps, {})(Sidebar);