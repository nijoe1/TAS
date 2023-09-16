import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Tooltip,
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

export function ProfileCard({ onDataFetch }: { onDataFetch: () => void }) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [onProgress, setOnProgress] = useState(-1);
  const { address } = useAccount();
  const [fetched, setFetched] = useState(false);
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
    let key = localStorage.getItem(`API_KEY_${address}`);
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
    console.log("Updated profile details:", profileDetails);
    await orbis.isConnected();
    const res = await orbis.updateProfile(profileDetails);
    toggleModal();
  };

  useEffect(() => {
    const fetch = async () => {
      await orbis.isConnected();

      let userDid = router.query.address;

      if (!userDid) {
        // If address is null, get it from local storage
        userDid = localStorage.getItem("userdid") || "";
        console.log(userDid);
      } else {
        userDid = `did:pkh:eip155:1:${userDid}`;
      }

      if (!userDid) {
        return; // Handle the case when userDid is still null
      }

      const { data, error } = await orbis.getProfile(userDid);

      if (data) {
        setUserProfile(data);
        setFetched(true);
        onDataFetch(); // Invoke the callback when data is fetched
      } else if (error) {
        console.error("Error fetching user profile: ", error);
      }
    };
    fetch();
  }, [onDataFetch]);

  return (
    <div>
      {" "}
      {fetched && (
        <Card className="w-96">
          <CardHeader floated={false} className="h-80">
            <img
              className="rounded-lg mt-2 mb-2"
              // @ts-ignore
              src={userProfile?.details?.profile?.pfp}
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
          <CardFooter className="flex justify-center  pt-1">
            <FaEdit onClick={toggleModal} />

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
                    <h2 className="text-xl text-center font-bold mb-4">
                      Update Profile
                    </h2>
                    <input
                      type="text"
                      name="username"
                      value={profileDetails.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      className="mx-auto text-center mb-2 p-2 border rounded flex flex-col items-centrer"
                    />
                    <input
                      type="text"
                      name="description"
                      value={profileDetails.description}
                      onChange={handleInputChange}
                      placeholder="Description"
                      className="mx-auto text-center mb-2 p-2 border rounded flex flex-col items-centrer"
                    />
                    <div className="flex flex-col items-center">
                      <label
                        htmlFor={"image upload"}
                        className="mx-auto text-center mb-2 p-2 mt-1flex flex-col items-centrer"
                      >
                        {"Profile Picture"}
                      </label>

                      {onProgress < 0 ? (
                        <input
                          className="text-center mb-2  flex  justify-center items-centrer"
                          type="file"
                          accept={"image/jpeg, image/png, image/gif"}
                          onChange={async (e) => {
                            if (e.target.files) {
                              handleSimpleFileUpload(e.target.files);
                            }
                          }}
                        />
                      ) : (
                        <div className="items-center text-center">
                          <Progress
                            className="text-white bg-black rounded-lg "
                            value={onProgress}
                            label="Completed"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <button
                        className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
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
