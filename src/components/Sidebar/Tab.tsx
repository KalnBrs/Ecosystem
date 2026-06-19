import Image from "next/image"

export interface TabProps {
  text: string,
  image: string,
  width: number,
  height: number
}

export default function Tab({text, image, width, height}: TabProps) {
  return (
    <div> 
      <a href="/inbox" className="flex flex-row"> <Image src={image} alt={`${text} image`} width={width} height={height} /> {text}</a>
    </div>
  )
}