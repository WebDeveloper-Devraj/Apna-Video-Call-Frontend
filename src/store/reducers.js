import { combineReducers } from "@reduxjs/toolkit";
import meetSlice from "./slices/meetSlice";
import authSlice from "./slices/authSlice";
import flashMessageSlice from "./slices/flashMessage";

const rootReducer = combineReducers({
  meet: meetSlice.reducer,
  auth: authSlice.reducer,
  flashMessage: flashMessageSlice.reducer,
});

export default rootReducer;
