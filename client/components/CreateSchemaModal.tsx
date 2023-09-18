import React, { useState } from "react";
import { Card, Input, Typography, Tooltip } from "@material-tailwind/react";
import { FaInfoCircle } from "react-icons/fa";
import RegisterSchemaModal from "./RegisterSchemaModal";
import RegisterSubscriptionSchemaModal from "./RegisterSubscriptionSchemaModal";
import RegisterACSchemaModal from "./RegisterACSchemaModal";
// import 'react-tagsinput/react-tagsinput.css'
// import "@/styles/globals.css"
type RegisterSchemaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual address of your event data
};

const CreateSchemaModal: React.FC<RegisterSchemaModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [type, setType] = useState("Select schema type");

  const schemaTypes = ["Select schema type", "Standard", "Subscription", "Access-Control"];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <Card
        color="white"
        shadow={false}
        className="mb-4 p-4 border border-black rounded-xl"
      >
        <div className="mb-4">
          <Typography variant="h4" color="black">
            Select Schema Type
          </Typography>
        </div>
        <form className="mt-4">
          <div className="mb-1 ">
            <div className="mb-1 flex">
              <Tooltip
                placement="right-start"
                content="add a relevant name to your schema"
              >
                <label className="text-black font-medium">Schema Name</label>
              </Tooltip>

              <FaInfoCircle className="mt-1 ml-2" />
            </div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (!open) {
                  setOpen(!open);
                }
              }}
              className="attribute-select rounded-full px-4 py-2 border border-black mr-20"
            >
              {schemaTypes.map((type, typeIndex) => (
                <option key={typeIndex} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {type === "Subscription" && (
              <RegisterSubscriptionSchemaModal
                isOpen={open}
                onClose={function (): void {
                  setOpen(!open);
                  onClose()
                  setType("Select schema type")
                }}
                onCreate={function (schemaData: any): void {
                  setOpen(!open);
                }}
              />
            )}
            {type === "Standard" && (
              <RegisterSchemaModal
                isOpen={open}
                onClose={function (): void {
                  setOpen(!open);
                  onClose()
                  setType("Select schema type")
                }}
                onCreate={function (schemaData: any): void {
                  setOpen(!open);
                }}
              />
            )}
            {type === "Access-Control" && (
              <RegisterACSchemaModal
                isOpen={open}
                onClose={function (): void {
                  setOpen(!open);
                  onClose()
                  setType("Select schema type")
                }}
                onCreate={function (schemaData: any): void {
                  setOpen(!open);
                }}
              />
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateSchemaModal;
