"use client"
import Lottie from "lottie-react";
import blocks from "./blocks.json";

const style = {
    height: 300,
  };
  
export default function Loading() {
  return (
    <div className="w-full mt-62">
        
        <Lottie animationData={blocks} style={style} />  
    </div>
  )
}