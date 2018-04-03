import { makeConstant } from "./_helpers";

const constant = makeConstant("jchat/roster");

export const ROSTER_INIT = constant("ROSTER_INIT");
export const ROSTER_UPDATE = constant("ROSTER_UPDATE");

export const receivedRosterInit = roster => ({
  type: ROSTER_INIT,
  roster: roster
});

export const receivedRosterUpdate = roster => ({
  type: ROSTER_UPDATE,
  payload: roster
});

const initialState = {}

// reducer
export default (state = initialState, action) => {
  switch (action.type) {

    case ROSTER_INIT: {
        console.log(action.roster)
        return action.roster
    }

    case ROSTER_UPDATE: {
        console.log(action.payload)
        return state
    }

    default:
      return state
  }
};
