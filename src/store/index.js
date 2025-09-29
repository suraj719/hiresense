import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import interviewReducer, { interviewMiddleware } from "./slices/interviewSlice";
import candidateReducer from "./slices/candidateSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["interview", "candidates"],
};

const rootReducer = combineReducers({
  interview: interviewReducer,
  candidates: candidateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(interviewMiddleware),
});

export const persistor = persistStore(store);
