import React, { useState } from 'react'
import chatIcon from '../assets/chat.png'
import { MdRoom } from 'react-icons/md';
import toast from 'react-hot-toast';


const JoinCreateChat = () => {


  const [details, setDetails] = useState({
    roomId : '',
    username : ''
  });




  function handleFormInputChange(event){
    setDetails({
      ...details,
      [event.target.name] : event.target.value,
    })
  }


  function validateForm(){
    if(details.username.trim() === '' || details.roomId.trim() === ''){
      toast.error("Please fill all the fields");
      return false;
    }
  }

  function joinChat(){
    if(!validateForm()){
      return;
    }
    // proceed to join the chat
    alert(`Joining room ${details.roomId} as ${details.username}`);
  }

  function createRoom(){

  }

  return (
    <div className='min-h-screen flex items-center justify-center'>


        <div className=' p-8 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-600 shadow'>
          <div>
            <img src={chatIcon} className='w-25 mx-auto'/>
          </div>
            <h1 className='text-2xl font-semibold text-center margin'>Join Room Or Create Room</h1>
            <div className=''>
                <label htmlFor="name" className='block font-medium mb-2'>Your Name : </label>
                <input onChange={handleFormInputChange} value={details.username} name='username' placeholder='Enter your name ' type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
            </div>


            <div className=''>
                <label htmlFor="name" className='block font-medium mb-2'>Room Id : </label>
                <input onChange={handleFormInputChange} value={details.roomId} name='roomId' placeholder='Enter room id ' type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
            </div>

            <div>
                <button onClick={joinChat} className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'>Join Room</button>
                <button onClick={createRoom} className='w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'>Create  Room</button>
            </div>




        </div>


        
    </div>
  )
}

export default JoinCreateChat