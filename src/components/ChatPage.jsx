import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md'
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';



export const ChatPage = () => {

  const {roomId, currentUser, connected} = useChatContext();
  const navigate = useNavigate();
  useEffect(() => {
    if(!connected){
      navigate('/');
    }
  },[connected, roomId, currentUser]);



  const [messages, setMessages] = useState([
  { sender: 'Alice', content: 'Hello!' },
  { sender: 'Bob', content: 'Hi there!' },
  { sender: 'Alice', content: 'How are you?' }, 
  { sender: 'Bob', content: 'I am good, thanks! How about you?' }
]);
const [input, setInput] = useState('');
const inputRef = useRef(null);
const chatBoxRef = useRef(null);
const [stompClient, setStompClient] = useState(null);

useEffect(() => {
  const connectWebSocket = () => {
  const sock = new SockJS(`${baseURL}/chat`);
  const client = Stomp.over(sock);
  client.connect({}, () => {
    setStompClient(client);
    toast.success('Connected to chat server');
    client.subscribe(`/topic/room/${roomId}`, (message) => {
      console.log(message);
      const newMessage  = JSON.parse(message.body);
      setMessages((prev) => [...prev, newMessage] );
    }
    );
  });
  };
  if(connected){
    connectWebSocket();
  }
},[roomId]);




  return (
    <div className="">
      {/* this is a header */}
      <header className="dark:border-gray-700  fixed w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center">
        {/* room name container */}
        <div>
          <h1 className="text-xl font-semibold">
            Room : <span>Family Group</span>
          </h1>
        </div>
        {/* username container */}

        <div>
          <h1 className="text-xl font-semibold">
            User : <span>Harsh</span>
          </h1>
        </div>
        {/* button: leave room */}
        <div>
          <button
            className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full"
          >
            Leave Room
          </button>
        </div>
      </header>


      <main className='py-20 px-1 h-screen overflow-auto w-2/3 dark:bg-slate-700 mx-auto '>
  {
    messages.map((message, index) => {
      return(
        <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`my-2 p-3 rounded-lg max-w-lg ${message.sender === currentUser ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
            
            <div className='flex flex-row gap-2'>
              <img src="https://avatar.iran.liara.run/public/22" alt="" className='h-10 w-10'/>
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-bold'>{message.sender}</p>
                <p>{message.content}</p>
              </div>
            </div>
            
          </div>
        </div>
      )
    })
  }
</main>

      
      {/* input message container */}
      <div className=" fixed bottom-4 w-full h-16 ">
        <div className="h-full  pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
          <input            
            type="text"
            placeholder="Type your message here..."
            className=" w-full  dark:border-gray-600 b dark:bg-gray-800  px-5 py-2 rounded-full h-full focus:outline-none  "
          />

          <div className="flex gap-1">
            <button className="dark:bg-purple-600 h-10 w-10  flex   justify-center items-center rounded-full">
              <MdAttachFile  size={20} />
            </button>
            <button
              className="dark:bg-green-600 h-10 w-10  flex   justify-center items-center rounded-full"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

