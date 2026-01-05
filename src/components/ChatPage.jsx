import React, { useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md'



const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const inputRef = useRef(null);
const chatBoxRef = useRef(null);
const [stompClient, setStompClient] = useState(null);
const [roomId, setRoomId] = useState(" ");


export const ChatPage = () => {
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


      <main className='py-20 h-screen overflow-auto w-2/3 dark:bg-slate-700 mx-auto '>
        <div className=''>
          {
            messages.map((message, index) => {
              <div key={index} >

              </div>
            })
          }
        </div>
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

