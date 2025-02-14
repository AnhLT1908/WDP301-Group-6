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

const HomePage = () => {
  const carouselImages = [carousel_img_1, carousel_img_2, carousel_img_3];

  return (
    <div className="font-sans">
      <Header />
      <main className="bg-white">
        <section className="grid grid-flow-col grid-rows-2 grid-cols-1">
          <div className="col-span-1">
            <Carousel images={carouselImages} />
          </div>
          <div className="flex justify-around">
            <Card
              title="Hostels"
              actions={
                <Button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  showIcon={true}
                >
                  View More
                </Button>
              }
              showIcon={true}
              icon={<House size={70} className="relative text-white" />}
            ></Card>
            <Card
              title="Rooms"
              actions={
                <Button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  showIcon={true}
                >
                  View More
                </Button>
              }
              showIcon={true}
              icon={<DoorOpen size={70} className="relative text-white" />}
            ></Card>
            <Card
              title="News"
              actions={
                <Button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  showIcon={true}
                >
                  View More
                </Button>
              }
              showIcon={true}
              icon={<Newspaper size={70} className="relative text-white" />}
            ></Card>
            <Card
              title="Reports"
              actions={
                <Button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  showIcon={true}
                >
                  View More
                </Button>
              }
              showIcon={true}
              icon={<FileWarning size={70} className="relative text-white" />}
            ></Card>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <div className="space-y-4 mt-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-xl font-semibold">
                How To Build A Magazine Layout With CSS Grid Areas
              </h4>
              <p className="text-gray-600">By Admin on 27 August, 2024</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
