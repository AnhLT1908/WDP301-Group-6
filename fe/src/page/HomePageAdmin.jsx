import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Card from "../components/ui/Card";
import Carousel from "../components/ui/Carousel";
import Button from "../components/form/Button";
import { HousePlus, ChartPie, ListPlus, UserCog } from "lucide-react";
import carousel_img_1 from "../../src/assets/images/carousel_images/carousel_img_1.jpg";
import carousel_img_2 from "../../src/assets/images/carousel_images/carousel_img_2.jpg";
import carousel_img_3 from "../../src/assets/images/carousel_images/carousel_img_3.jpg";
import news1 from "../../src/assets/images/news1.jpg";

const HomePageAdmin = () => {
  const carouselImages = [carousel_img_1, carousel_img_2, carousel_img_3];

  const featureCards = [
    {
      title: "Chuỗi nhà trọ",
      icon: <HousePlus size={70} className="relative text-white" />,
      link: "/admin/houses",
    },
    {
      title: "Dashboard",
      icon: <ChartPie size={70} className="relative text-white" />,
      link: "/admin/dashboard",
    },
    {
      title: "Tin tức",
      icon: <ListPlus size={70} className="relative text-white" />,
      link: "/admin/news",
    },
    {
      title: "Tài khoản",
      icon: <UserCog size={70} className="relative text-white" />,
      link: "/admin/account-list",
    },
  ];

  return (
    <div className="font-sans">
      <main className="bg-white">
        <section className="grid grid-flow-col grid-rows-1 grid-cols-1">
          <div className="col-span-1">
            <Carousel images={carouselImages} />
          </div>
        </section>

        <section className="grid grid-flow-col grid-rows-2 grid-cols-1">
          <div className="flex flex-col h-[150px]">
            <div className="relative inline-block mt-10 mb-10 ml-7">
              <div
                className="bg-[#0D9F4C] text-center text-white font-bold py-2 px-4 inline-block w-[220px]"
                style={{ clipPath: "polygon(20% 0, 100% 0, 77% 100%, 0 100%)" }}
              >
                Quản lý
              </div>
              <div className="absolute top-1/2 left-[200px] w-[1390px] border-t-2 border-gray-200"></div>
              <div className="absolute top-2/3 left-[190px] w-[1400px] border-t-2 border-gray-200"></div>
            </div>
            <div className="flex justify-around">
              {featureCards.map((card, index) => (
                <Card
                  key={index}
                  title={<span className="text-white">{card.title}</span>}
                  actions={
                    <div className="flex justify-center w-full">
                      <Link to={card.link}>
                        <Button
                          showIcon={true}
                          className="px-4 py-2 bg-white text-green-500 rounded hover:bg-[#FDEE2A]"
                        >
                          View More
                        </Button>
                      </Link>
                    </div>
                  }
                  showIcon={true}
                  icon={card.icon}
                  className="max-w-sm p-6 bg-green-500 border border-gray-200 rounded-lg shadow-sm"
                  contentClassName="grid grid-cols-2 items-center gap-4"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePageAdmin;
