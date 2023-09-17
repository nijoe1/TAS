import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import ChatModal from "@/components/ChatModal";
import { getEncryptedJson } from "@/lib/tas";
import { getFileTypeFromAccept } from "@/lib/utils";
import { PiChatDotsFill } from "react-icons/pi";
import TimeCreated from "./TimeCreated";
import FileViewer from "./FileViewer";
import { GrUserWorker } from "react-icons/gr";
import router from "next/router";
import EthereumAddress from "./EthereumAddress";
type SubscriptionItemProps = {
  itemData: {
    data: string;
    address: `0x${string}`;
    context: string;
    from: `0x${string}`;
    age: number;
    type: string;
  };
};

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ itemData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [fileType, setFileType] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openFeedbackModal = () => {
    setModalIsOpen(true);
  };

  const closeFeedbackModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  useEffect(() => {
    const fetch = async () => {
      let res = await getEncryptedJson(
        "string jsonCID",
        itemData.data as `0x${string}`,
        itemData.address as `0x${string}`
      );
      setFileBlob(res.fileblob);
      // @ts-ignore
      setFileType(getFileTypeFromAccept(res.json.file.type));
      setName(res.json.name);
      setDescription(res.json.description);
    };

    fetch();
  }, []);

  return (
    <Card className="mt-6 w-96">
      <CardBody>
        <div>
          <div className="flex flex-col items-center">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              attestationUID
            </Typography>
            <EthereumAddress link={`/attestation?uid=${itemData.context}&type=${itemData.type}`} address={itemData.context} />
          </div>

          <Typography variant="h5" color="blue-gray" className="mb-2">
            {name}
          </Typography>
          <Typography>{description}</Typography>
        </div>
        <div className="mt-4">
          {fileBlob && fileType ? (
            <FileViewer
              fileBlob={fileBlob}
              fileType={fileType}
              fileUri={null}
            />
          ) : (
            <p>Loading file...</p>
          )}
        </div>
      </CardBody>
      <div className="flex-grow"></div>
      <CardFooter className="pt-0">
        <div className="flex flex-wrap itens-center justify-between mt-4">
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Creator:</Typography>
            <div className="flex flex-wrap items-center">
              <GrUserWorker
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard?address=${itemData.from}`)
                }
                title={`Go to ${itemData.from}'s dashboard`}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Age:</Typography>
            <TimeCreated createdAt={itemData.age} />
          </div>
        </div>

        <div className="flex  itens-center justify-between mt-4 mx-auto">
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Type:</Typography>
            <Typography>{itemData.type}</Typography>
          </div>
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Comments:</Typography>
            <PiChatDotsFill
              className="bolder"
              onClick={() => {
                openFeedbackModal();
              }}
            />{" "}
          </div>
          <ChatModal
            context={`${itemData.context}/comments`}
            isOpen={modalIsOpen}
            closeModal={closeFeedbackModal}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionItem;
