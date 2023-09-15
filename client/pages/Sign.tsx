import React from 'react';
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Sign from '@/components/AttestOffChain';
interface SignProps {
  version: string;
  schema: `0x${string}`;
  recipient: `0x${string}`;
  time: number;
  expirationTime: number;
  revocable: boolean;
  refUID: `0x${string}`;
  AttestationData: `0x${string}`;
}
const dummyProps: SignProps = {
  version: `1`,
  schema: `0x081554371ac057b8e3ed10dc628cc3fa0faf4773d73d4da66d9db4c8df98e2ab`,
  recipient: `0x8A293A85FCc865107f4F6c09170C4A6FaB7E65F6`,
  time: 1,
  expirationTime: 0, // Change to hex representation
  revocable: true,
  refUID: `0x081554371ac057b8e3ed10dc628cc3fa0faf4773d73d4da66d9db4c8df98e2ab`,
  AttestationData: `0x081554371ac057b8e3ed10dc628cc3fa0faf4773d73d4da66d9db4c8df98e2ab`,
};

const TestComponent = () => {
  return (
    <div>
      <Navbar />
      <Sign {...dummyProps} />
      <Footer />
    </div>
  );
};

export default TestComponent;