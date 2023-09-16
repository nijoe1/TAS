"use client";
import Lottie from "lottie-react";
import blocks from "./animation.json";

export default function Animation() {
  return (
    <div className="w-1/5 mx-20" >
      <Lottie animationData={blocks} />
    </div>
  );
}
