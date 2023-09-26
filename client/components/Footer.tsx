import React from "react";
import { Button } from "@material-tailwind/react";

const Footer = () => {
  return (
    <footer className="bg-black py-4 mx-1px mt-20 border text-white max-w-full">
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
        Copyright &copy; 2023 Tableland Attestation Service, All rights
        reserved.
      </Button>
    </footer>
  );
};

export default Footer;
