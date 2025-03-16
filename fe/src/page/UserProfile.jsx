import React, { useState, useEffect, use } from "react";
import logo from "../assets/images/logo1_noText.png";
import Header from "../components/layout/Header";
import axios from "axios";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try{
         const userData = localStorage.getItem("user") 
         if(!userData){
          console.log("No user data found");
          return
         }
         setUser(JSON.parse(userData));


      }catch(err){
        console.error("Error fetching user data:", err)
      }
    }

    fetchUser();
  }, []);

  return (
    <div>
      <Header/>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div> {/* Avatar */}
            <div className="ml-4">
              <p className="text-lg font-medium">{user?.firstName + user?.lastName}</p>
              <p className="text-gray-600">{user?.accountType}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Information</h2>
          <p><strong>Identify Card:</strong> {user?.identityCard}</p> 
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone}</p>
          <p><strong>Gender:</strong> {user?.gender}</p>
        </div>

        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Address</h2>
          <p><strong>Name:</strong> User Name</p>
          <p><strong>Email:</strong> abc@gmail.com</p>
          <p><strong>Phone:</strong> 0123456789</p>
          <p><strong>Bio:</strong> Role</p>
        </div> */}
      </div>
    </div>
  );
}
