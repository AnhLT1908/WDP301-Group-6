import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LodgerList() {
  const [accounts, setAccounts] = useState([]);
  const [rooms, setRooms] = useState({});

  useEffect(() => {
    try{
      const fetchAccounts = async () => {

        const resAccount = await axios.get("http://localhost:5000/api/v1/account/lodger-accout-list");

        const resRoom = await axios.get("http://localhost:5000/api/v1/room/");

        //if account.roomId === room._id
        if(Array.isArray(resRoom.data.data)){
          const filteredAccounts = resAccount.data.data.filter(account => resRoom.data.data.find(room => account.roomId === room._id));
          setAccounts(filteredAccounts);
        }

        const roomMap = resRoom.data.data.reduce((acc, room) => {
          acc[room._id] = room.name;
          return acc;
        }, {});

        setRooms(roomMap);
        console.log("Rooms:", rooms);
        
      }

      fetchAccounts()
    }catch(error){
      console.error("Error fetching lodger data:", error);
    }
  },[])

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Lodger List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr key={index} className="border-t">
                <td>{account.firstName + " " + account.lastName}</td>
                <td>{account.email}</td>
                <td>{account.phone}</td>
                <td>{account.gender}</td>
                <td>{rooms[account.roomId]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}