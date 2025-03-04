import React from "react";
import logo from "../../assets/images/logo1_noText.png";
import { MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0D9F4C] py-8 mt-6">
      <div className=" mx-auto px-6 flex  items-start justify-around">
        {/* Website logo and name */}
        <div className="flex flex-col items-center text-[#FDEE2A] text-lg font-semibold mb-3">
          <img src={logo} alt="logo" className="w-[90px] h-[70px]" />
          <span>Nhà Trọ Tuấn Cường 1</span>
        </div>

        {/* Navigation Links on one row */}
        <div className="flex flex-col mb-3 items-center">
          <div className="flex space-x-6 mb-3 ">
            <a
              href="#"
              className=" font-medium text-[#FDEE2A] hover:text-yellow-50"
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="font-medium text-[#FDEE2A] hover:text-yellow-50"
            >
              Về chúng tôi
            </a>
            <a
              href="#"
              className="font-medium text-[#FDEE2A] hover:text-yellow-50"
            >
              Tin tức
            </a>
          </div>
          <div className="flex flex-col text-[#FDEE2A]">
            <div className="flex justify-center hover:text-yellow-50">
              <Phone color="#fdee2a" className="mr-2 mb-4"/>
              <a href="tel:+84979070540">Liên hệ 1: +84 97-907-0540</a>
            </div>
            <div className="flex justify-center hover:text-yellow-50">
              <Phone color="#fdee2a" className="mr-2"/>
              <a href="tel:+84342266206">Liên hệ 2: +84 34-226-6206</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-[#FDEE2A]">
          <div className="flex mb-6">
            <MapPin color="#fdee2a" />
            <span>Cơ sở 1: Cụm 6, thôn 3, Thạch Hòa, Thạch Thất, Hà Nội</span>
          </div>
          <div className="flex">
            <MapPin color="#fdee2a" />
            <span>Cơ sở 2: Số 70, thôn 3, Thạch Hoà, Thạch Thất, Hà Nội</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
