import { all, takeEvery, put } from "redux-saga/effects";

import { receivedRosterUpdate, receivedRosterInit } from "../../ducks/roster";

import { makeChannel } from "../_helpers";

function* sessionStarted(client) {
    console.log("About to get roster")
    let roster = yield client.getRoster()
    console.log("Got roster")
    console.log(roster)
    client.sendPresence()
  
    yield put(receivedRosterInit(roster.roster.items))
}

function* watchForSessionStart(client) {
    const channel = makeChannel(client, {
        "session:started": (emit, msg) => {
          emit(msg)
        }
    })

    yield takeEvery(channel, function* eachMessage(update) {
        yield sessionStarted(client)
    })
}

function* watchForRoster(client) {

  const channel = makeChannel(client, {
    "roster.update": (emit, msg) => {
      emit(msg)
    },
  })

  yield takeEvery(channel, function* eachMessage(update) {
    yield put(receivedRosterUpdate(update))
  })
}

export default function*(client) {
  yield all([watchForRoster(client), watchForSessionStart(client)])
}
