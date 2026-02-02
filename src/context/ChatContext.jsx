import { createContext, useContext, useState } from "react";
import { DiSafari } from "react-icons/di";

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

const useChatContext = () => useContext(ChatContext);
export default useChatContext;