import React from "react";
import { Button } from "@material-tailwind/react";

const Footer = () => {
  return (
    <footer className=" mx-8 my-3 bg-black rounded-lg py-4 text-white">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-center">
        <Button
          color="blue-gray"
          size="sm"
          className="hover:bg-gray-200 hover:text-black hover:rounded-full"
        >
          About Us
        </Button>
        <Button
          color="blue-gray"
          size="sm"
          className="hover:bg-gray-200 hover:text-black hover:rounded-full"
        >
          License
        </Button>
        <Button
          color="blue-gray"
          size="sm"
          className="hover:bg-gray-200 hover:text-black hover:rounded-full"
        >
          Contribute
        </Button>
        <Button
          color="blue-gray"
          size="sm"
          className="hover:bg-gray-200 hover:text-black hover:rounded-full"
        >
          Contact Us
        </Button>
      </div>
      <hr className="my-8 border-blue-gray-50" />
      <Button color="blue-gray" size="sm" className="mx-auto block">
        &copy; 2023 Tableland Attestation Service
      </Button>
    </footer>
  );
};

export default Footer;