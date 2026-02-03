import React, { useState } from 'react'
import chatIcon from '../assets/chat.png'
import { MdRoom } from 'react-icons/md';
import toast from 'react-hot-toast';
import { createRoomAPI} from '../services/RoomServices';
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router';
import { joinRoomAPI } from '../services/RoomServices';


const JoinCreateChat = () => {


  const [detail, setDetail] = useState({
    roomId : '',
    username : '',
  });

  const {roomId, username, connected, setRoomId, setCurrentUser, setConnected} = useChatContext();
  const navigate = useNavigate();



  function handleFormInputChange(event){
    setDetail({
      ...detail,
      [event.target.name] : event.target.value,
    });
  }


  function validateForm(){
    if(detail.username === " " || detail.roomId === " "){
      toast.error("Please fill all the fields");
      return false;
    }
    return true;
  }

  async function joinChat(){
    if(validateForm()){
      //logic to join chat
      try{
      const room = await joinRoomAPI(detail.roomId);
      toast.success("Joined room successfully");
      setCurrentUser(detail.username);
      setRoomId(room.roomId);
      setConnected(true);
      navigate('/chat');
      }catch(error){
        console.log("Error joining room: ", error);
        if(error.status == 404){
          toast.error("Room not found");
        }else{
          toast.error("Error joining room");
        }
      }
    }
  }

  async function createRoom(){
    if(validateForm()){
      console.log("Creating Room");
      console.log(detail);
      // Call API to create room on backend
      try{
        const response = await createRoomAPI(detail.roomId);
        console.log("Room created successfully: ", response);
        toast.success("Room created successfully");
        //join the room
        setCurrentUser(detail.username);
        setRoomId(response.roomId);
        setConnected(true);
        // forward to chat page...
        navigate('/chat');

      } catch(error){
        console.log("Error creating room: ", error);
        if(error.status == 400){
          toast.error("Room already exists");
        }else{
          toast.error("Error creating room"); 
        } 
    }
    }
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
                <input onChange={handleFormInputChange} value={detail.username} name='username' placeholder='Enter your name ' type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
            </div>


            <div className=''>
                <label htmlFor="name" className='block font-medium mb-2'>Room Id : </label>
                <input onChange={handleFormInputChange} value={detail.roomId} name='roomId' placeholder='Enter room id ' type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
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