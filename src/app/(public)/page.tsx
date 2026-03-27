import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function HomePage() {
  return (
    <div>
      <div className="flex justify-between items-center py-5 px-20 bg-primary">
        <h1 className="text-white text-2xl font-bold">T.W.P</h1>
        <Button
          variant="outline"
          className="text-bloack border-white hover:bg-white hover:text-primary"          
        >   
        <Link href="/login">Login</Link>
        </Button>
      </div>
      <div className="grid mt-20 lg:grid-cols-2 gap-5 h-[70vh] items-center px-20">
        <div className="cols-span-1">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-bold mb-5">
              Welcome to T.W.P - Your Ultimate Travel Companion!
            </h1>
            <p className="text-lg text-gray-600 mb-5">
              Discover the world with ease and confidence using T.W.P, your
              trusted travel companion. Whether you're a seasoned traveler or
              embarking on your first adventure, T.W.P is here to make your
              journey unforgettable.
            </p>
            <div>
              <Button className="bg-primary text-white hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
        <div className="cols-span-1 justify-end flex items-center">
          <div>
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/070/213/792/small/keychain-in-the-shape-of-a-house-with-the-word-rent-hanging-in-front-of-a-cozy-house-with-a-veranda-concept-of-home-rental-temporary-housing-real-estate-market-photo.jpg"
              alt="Travel Companion"
              className="h-96 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
