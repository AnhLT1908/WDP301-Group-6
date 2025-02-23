import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Card from "../components/ui/Card";
import Carousel from "../components/ui/Carousel";
import Button from "../components/form/Button";
import { House, DoorOpen, Newspaper, FileWarning } from "lucide-react";
import carousel_img_1 from "../../src/assets/images/carousel_images/carousel_img_1.jpg";
import carousel_img_2 from "../../src/assets/images/carousel_images/carousel_img_2.jpg";
import carousel_img_3 from "../../src/assets/images/carousel_images/carousel_img_3.jpg";
import news1 from "../../src/assets/images/news1.jpg";

const HomePage = () => {
  const carouselImages = [carousel_img_1, carousel_img_2, carousel_img_3];
  
  const newsItems = [
    {
      title: "Nhà trọ nâng cấp xây thêm khu vực",
      image: news1,
      date: "20 JANUARY, 2025",
      readTime: "20 MINS",
    },
    {
      title: "Fortnite Ratings Are Skyrocketing",
      date: "27 AUGUST, 2024",
      readTime: "15 MINS",
    },
    {
      title: "Everything You Need To Know About",
      date: "27 AUGUST, 2024",
      readTime: "25 MINS",
    },
    {
      title: "We Can’t Wait To Try This Gaming Area",
      date: "27 AUGUST, 2024",
      readTime: "18 MINS",
    },
  ];

  const featureCards = [
    {
      title: "Khu nhà trọ",
      icon: <House size={70} className="relative text-white" />,
    },
    {
      title: "Phòng trọ",
      icon: <DoorOpen size={70} className="relative text-white" />,
    },
    {
      title: "Tin tức",
      icon: <Newspaper size={70} className="relative text-white" />,
    },
    {
      title: "Báo cáo",
      icon: <FileWarning size={70} className="relative text-white" />,
    }
  ];

  return (
    <div className="font-sans">
      <Header />
      <main className="bg-white">
        <section className="grid grid-flow-col grid-rows-1 grid-cols-1">
          <div className="col-span-1">
            <Carousel images={carouselImages} />
          </div>
        </section>

        <section className="grid grid-flow-col grid-rows-2 grid-cols-1">
          <div className="flex flex-col h-[150px]">
            <div className="relative inline-block mt-10 mb-10 ml-20">
              <div
                className="bg-[#0D9F4C] text-center text-white font-bold py-2 px-4 inline-block w-[220px]"
                style={{ clipPath: "polygon(20% 0, 100% 0, 77% 100%, 0 100%)" }}
              >
                Tính năng
              </div>
              <div className="absolute top-1/2 left-[200px] w-[1570px] border-t-2 border-gray-200"></div>
              <div className="absolute top-2/3 left-[190px] w-[1580px] border-t-2 border-gray-200"></div>
            </div>
            <div className="flex justify-around">
              {featureCards.map((card, index) => (
                <Card
                  key={index}
                  title={card.title}
                  actions={
                    <Button showIcon={true} className="px-4 py-2 bg-green-500 text-white rounded">
                      View More
                    </Button>
                  }
                  showIcon={true}
                  icon={card.icon}
                  className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
                  contentClassName="grid grid-cols-2 items-center gap-4"
                />
              ))}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="relative inline-block mt-10 mb-10 ml-20">
            <div
              className="bg-[#0D9F4C] text-center text-white font-bold py-2 px-4 inline-block w-[220px]"
              style={{ clipPath: "polygon(20% 0, 100% 0, 77% 100%, 0 100%)" }}
            >
              Tin tức mới nhất
            </div>
            <div className="absolute top-1/2 left-[200px] w-[1570px] border-t-2 border-gray-200"></div>
            <div className="absolute top-2/3 left-[190px] w-[1580px] border-t-2 border-gray-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-6">
            <div className="flex items-center justify-center mr-[70px]">
              <Card
                title={newsItems[0].title}
                img={newsItems[0].image}
                cardImgClassName="w-[700px] h-[400px] object-fill rounded-lg"
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                children={`By Admin on ${newsItems[0].date} | ${newsItems[0].readTime}`}
                actions={
                  <Button className="px-4 py-2 bg-green-500 text-white rounded">
                    Read More
                  </Button>
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {newsItems.slice(1).map((item, index) => (
                <Card
                  key={index}
                  title={item.title}
                  className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-3 mr-[30px]"
                  children={`By Admin on ${item.date} | ${item.readTime}`}
                  actions={
                    <Button className="px-4 py-2 bg-green-500 text-white rounded">
                      Read More
                    </Button>
                  }
                  img={news1}
                  cardImgClassName="w-[150px] h-[150px] mr-[30px] rounded-lg"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
