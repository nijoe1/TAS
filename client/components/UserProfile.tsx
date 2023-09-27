import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Progress,
} from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { uploadFile, getIpfsGatewayUri } from "@/lib/lighthouse";
import { useAccount } from "wagmi";
import { FaEdit } from "react-icons/fa";
const orbis = new Orbis();

export function ProfileCard({
  onDataFetch,
  onUpdate,
}: {
  onDataFetch: (isUser: boolean, isConnected:boolean) => void;
  onUpdate: (success: boolean) => void;
}) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [onProgress, setOnProgress] = useState(-1);
  const { address } = useAccount();
  const [fetched, setFetched] = useState(false);
  const [update, setUpdate] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    pfp: "",
    username: "",
    description: "",
  });

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSimpleFileUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);
    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key, setOnProgress);
    setOnProgress(100);
    setProfileDetails((prev) => ({
      ...prev,
      ["pfp"]: getIpfsGatewayUri(CID.Hash),
    }));
  };

  const handleUpdateProfile = async () => {
    // Update profile details here
    await orbis.isConnected();
    const res = await orbis.updateProfile(profileDetails);
    if (res === 200) {
      onUpdate(true);
      toggleModal();
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await orbis.isConnected();
      let temp;
      let userDid = router.query.address;
      if (!userDid) {
        setUpdate(true);
        temp = true;
      } else if (userDid == address?.toLowerCase()) {
        setUpdate(false);
        temp = false;
      } else {
        setUpdate(false);
        temp = false;
      }
      let user;
      if (!userDid) {
        // If address is null, get it from local storage
        user = localStorage.getItem("userdid") || "";
      } else {
        user = `did:pkh:eip155:1:${userDid}`;
      }

      if (user) {
        const { data, error } = await orbis.getProfile(user);

        if (data) {
          setUserProfile(data);
          setFetched(true);
          onDataFetch(temp, user==""?false:true); // Invoke the callback when data is fetched
        } else if (error) {
          console.error("Error fetching user profile: ", error);
        }
      }
    };
    fetch();
  }, [router, isModalOpen]);

  return (
    <div>
      {" "}
      {fetched && (
        <Card className="w-96">
          <CardHeader
            floated={false}
            className="h-80 flex flex-col items-center"
          >
            <img
              className="rounded-lg mt-2 mb-2"
              // @ts-ignore
              src={userProfile?.details?.profile?.pfp}
              height={"60%"}
              width={"60%"}
              alt="profile-picture"
            />
          </CardHeader>
          <CardBody className="text-center mt-3">
            <Typography variant="h4" color="blue-gray" className="mb-2">
              {/* @ts-ignore */}
              {userProfile?.details?.profile?.username}
            </Typography>
            <Typography color="blue-gray" className="font-medium" textGradient>
              {/* @ts-ignore */}
              {userProfile?.details?.profile?.description}
            </Typography>
          </CardBody>
          <CardFooter className="flex justify-center  pt-3">
            {update && (
              <div className="flex flex-wrap gap-1">
                <p className="cursor-pointer" onClick={toggleModal}>
                  edit profile:
                </p>
                <FaEdit className="cursor-pointer mt-1" onClick={toggleModal} />
              </div>
            )}

            <div>
              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg items-center ">
                    <span
                      className="float-right text-2xl cursor-pointer"
                      onClick={toggleModal}
                    >
                      &times;
                    </span>
                    <div className="flex flex-col items-center">
                      <h2 className="text-xl text-center font-bold mb-4">
                        Update Profile
                      </h2>
                      <label
                        htmlFor={"image upload"}
                        className="mx-auto text-center mb-2 p-2 mt-1flex flex-col items-centrer"
                      >
                        {"username"}
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileDetails.username}
                        onChange={handleInputChange}
                        placeholder={`${profileDetails.username}`}
                        className="mx-auto text-center mb-2 p-2 border rounded flex flex-col items-centrer"
                      />
                      <label
                        htmlFor={"image upload"}
                        className="mx-auto text-center mb-2 p-2 mt-1flex flex-col items-centrer"
                      >
                        {"description"}
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={profileDetails.description}
                        onChange={handleInputChange}
                        placeholder={`${profileDetails.description}`}
                        className="mx-auto text-center mb-2 p-2 border rounded flex flex-col items-centrer"
                      />
                      <label
                        htmlFor={"image upload"}
                        className="mx-auto text-center mb-2 p-2 mt-1flex flex-col items-centrer"
                      >
                        {"pfp"}
                      </label>

                      <input
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        type="file"
                        accept={"image/jpeg, image/png, image/gif"}
                        onChange={async (e) => {
                          if (e.target.files) {
                            handleSimpleFileUpload(e.target.files);
                          }
                        }}
                      />

                      {onProgress > 0 && (
                        <div className="items-center text-center">
                          <Progress
                            className="text-white bg-black rounded-lg"
                            value={onProgress}
                            label="Completed"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <button
                        className="bg-black text-white rounded-md px-6 py-2 hover:bg-white hover:text-black border border-black"
                        onClick={handleUpdateProfile}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
