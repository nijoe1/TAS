import { Progress } from "@material-tailwind/react";
 
export function ProgressBar(value:any) {
  return <Progress value={value} label="Completed" />;
}