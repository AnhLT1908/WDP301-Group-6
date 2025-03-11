import React from "react";
import House1_img from "../assets/images/house_1.jpeg"; // Example path
import House2_img from "../assets/images/house_2.jpg"; // Example path
import House3_img from "../assets/images/house_3.jpg"; // Example path


const HouseList = () => {
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

        {/* Card 1 */}
        <div className="relative flex flex-row items-center bg-white p-4 rounded-lg shadow-lg overflow-hidden h-48 
        hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <img
            src={House1_img}
            alt="House 1"
            className="absolute left-0 top-0 w-1/3 h-full object-cover"
          />
          <div className="flex flex-col justify-between ml-[36%] w-full h-[150px]">
            <h3 className="font-semibold">Nhà trọ Tuấn Cường</h3>
            <p className="text-sm text-gray-700">Text | text | text</p>
            <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
            View more
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative flex flex-row items-center bg-white p-4 rounded-lg shadow-lg overflow-hidden h-48 
        hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <img
            src={House2_img}
            alt="House 2"
            className="absolute left-0 top-0 w-1/3 h-full object-cover"
          />
          <div className="flex flex-col justify-between ml-[36%] w-full h-[150px]">
            <h3 className="font-semibold">Nhà trọ Tuấn Cường 2</h3>
            <p className="text-sm text-gray-700">Text | text | text</p>
            <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
              View more
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative flex flex-row items-center bg-white p-4 rounded-lg shadow-lg overflow-hidden h-48 
        hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <img
            src={House3_img}
            alt="House 1"
            className="absolute left-0 top-0 w-1/3 h-full object-cover"
          />
          <div className="flex flex-col justify-between ml-[36%] w-full h-[150px]">
            <h3 className="font-semibold">Nhà trọ Tuấn Cường 3</h3>
            <p className="text-sm text-gray-700">Text | text | text</p>
            <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
            View more
            </button>
          </div>
        </div>
      </div>

      {/* Column 3 (Map) */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="relative w-full h-full bg-gray-300 rounded-3xl shadow-xl">
          <iframe
            className="absolute w-full h-full rounded-3xl shadow-xl"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.485369317021!2d105.85444421429557!3d21.028511993383205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9d4fbd96a3%3A0x60b982c28bca69b0!2zSGFuaSBMw6AgWmnhu4duLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1678947959624!5m2!1sen!2shttps://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.0393492752137!2d105.4669733153587!3d21.118077385931853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135a2e8c8ed0327%3A0x0!2zNzAgVGjDoXQgMywgVGjDoWNoIFPDoXQsIFRoYWNoIFRo4bqj!5e0!3m2!1sen!2s!4v1678984576220!5m2!1sen!2shttps://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7965672503356!2d105.51782577608803!3d21.000790280641546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345b0206053f5f%3A0x2bb48a98e38fc06b!2zTmjDoCBUcuG7jSBUdeG6pW4gQ8aw4budbmc!5e0!3m2!1svi!2s!4v1741723932315!5m2!1svi!2s"
            title="Map"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default HouseList;
