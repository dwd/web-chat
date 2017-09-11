import { combineReducers } from "redux";

import bookmarks from '../ducks/bookmarks';
import client from '../ducks/client';
import local from '../ducks/local';
import rooms from '../ducks/rooms';
import messages from '../ducks/messages';
import presence from '../ducks/presence';
import user from '../ducks/user';

export default combineReducers({
  bookmarks,
  client,
  local,
  rooms,
  messages,
  presence,
  user
});
