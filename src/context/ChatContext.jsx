import { createContext, useContext, useState } from "react";

const ChatContext  = createContext();

export const ChatProvider = ({children}) => {
    const [roomId, setRoomId] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [connected, setConnected] = useState(false);


    return ( 
        <ChatContext.Provider value={{roomId, setRoomId, connected,  currentUser, setCurrentUser, setConnected}}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => useContext(ChatContext);
