import { createContext, useContext } from "react";

const ProfileContext = createContext(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('asta trb sa fie folosita in ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children, value }) => {
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};