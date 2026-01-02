import React from 'react'
import chatIcon from '../assets/chat.png'


const JoinCreateChat = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>


        <div className=' p-8 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-600 shadow'>
          <div>
            <img src={chatIcon} className='w-25 mx-auto'/>
          </div>
            <h1 className='text-2xl font-semibold text-center margin'>Join Room Or Create Room</h1>
            <div className=''>
                <label htmlFor="name" className='block font-medium mb-2'>Your Name : </label>
                <input type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
            </div>


            <div className=''>
                <label htmlFor="name" className='block font-medium mb-2'>Room Id : </label>
                <input type="text" id='name' className='w-full dark:bg-gray-200 px-4 py-2 border dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'/>
            </div>

            <div>
                <button className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'>Join Room</button>
                <button className='w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'>Create  Room</button>
            </div>




        </div>


        
    </div>
  )
}

export default JoinCreateChat