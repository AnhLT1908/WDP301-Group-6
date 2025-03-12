import React, { useState, useEffect } from "react";
import axios from "axios";

import House1_img from "../assets/images/house_1.jpeg";
import House2_img from "../assets/images/house_2.jpg";
import House3_img from "../assets/images/house_3.jpg";

const HouseList = () => {
  const [houseList, setHouseList] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(houseList[0]);

  console.log("House list: ", houseList)

  console.log("Selected house: ", selectedHouse)

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/v1/house/");
        console.log("House list response: ", response)
        setHouseList(response.data.houses);
      } catch (error) {
        console.error("Error fetching houses:", error);
      }
    };

    fetchHouses();
  }, []);

  const handleSelectHouse = (house) => {
    setSelectedHouse(house);
  };
  return (
    <div className="grid grid-cols-6 gap-4 p-8">
      {/* Column 1 (Button) */}
      <div className="col-span-1 flex flex-col gap-4 w-[50%]">
        <button className="bg-green-500 text-white w-full px-4 py-2 rounded">Back</button>
      </div>

      {/* Column 2 (Title, Subtitle, and Cards) */}
      <div className="mr-28 col-span-2 flex flex-col gap-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Hostel List</h1>
          <button className="bg-green-500 text-white w-[50%] px-4 py-2 rounded">Create new hostel</button>
        </div>
        <h2 className="text-2xl text-gray-500 font-semibold">Nhà trọ Tuấn Cường</h2>

        {houseList.length > 0 ? (
          houseList.map((house, index) => (
            <div
              key={index}
              className="relative flex flex-row items-center bg-white p-4 rounded-lg shadow-lg overflow-hidden h-48 hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={house.imageUrl || House1_img}
                alt={`House ${index + 1}`}
                className="absolute left-0 top-0 w-1/3 h-full object-cover"
              />
              <div className="flex flex-col justify-between ml-[36%] w-full h-[150px]">
                <h3 className="font-semibold">{house.name || `Nhà trọ ${index + 1}`}</h3>
                <p className="text-sm text-gray-700">{house.description || "Text | text | text"}</p>
                <button
                  className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                  onClick={() => handleSelectHouse(house)}
                >
                  View more
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading houses...</p>
        )}
      </div>

      {/* Column 3 (Map) */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="relative w-full h-full bg-gray-300 rounded-3xl shadow-xl">
          {selectedHouse ? (
            <iframe
              className="absolute w-full h-full rounded-3xl shadow-xl"
              src={`${selectedHouse.location[0].srcMap}`}
              title="Map"
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <p>Select a house to view its location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseList;
