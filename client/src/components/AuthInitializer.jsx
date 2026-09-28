import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setInitialized,
  setUser,
  clearUser,
} from "../redux/slices/authSlice";

import { getCurrentUser } from "../services/authServices";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();

        dispatch(setUser(user));
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error,
        );

        dispatch(clearUser());
      } finally {
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;