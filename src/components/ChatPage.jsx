import React, { useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md'




export const ChatPage = () => {
  const [messages, setMessages] = useState([
  { sender: 'Alice', content: 'Hello!' },
  { sender: 'Bob', content: 'Hi there!' },
  { sender: 'Alice', content: 'How are you?' }, 
  { sender: 'Bob', content: 'I am good, thanks! How about you?' },
  { sender: 'Alice', content: 'I am doing well, thank you!' },
  { sender: 'Bob', content: 'Great to hear!' },
  { sender: 'Alice', content: 'What are your plans for the weekend?' },
  { sender: 'Bob', content: 'I am thinking of going hiking. How about you?' },
  { sender: 'Alice', content: 'That sounds fun! I might join you.' },
  { sender: 'Bob', content: 'Awesome! Let\'s plan it out later.' },
  { sender: 'Alice', content: 'Sure thing!' },
  { sender: 'Bob', content: 'See you then!' },
  { sender: 'Alice', content: 'See you!' },
  { sender: 'Bob', content: 'Bye!' },
  { sender: 'Alice', content: 'Bye!' },
  { sender: 'Bob', content: 'Take care!' },
  { sender: 'Alice', content: 'You too!' },
  { sender: 'Bob', content: 'Talk to you later!' },
  { sender: 'Alice', content: 'Looking forward to it!' }, 
]);
const [input, setInput] = useState('');
const inputRef = useRef(null);
const chatBoxRef = useRef(null);
const [stompClient, setStompClient] = useState(null);
const [roomId, setRoomId] = useState(" "); 
const [currentUser, setCurrentUser] = useState("Alice");
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

