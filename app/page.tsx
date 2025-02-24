"use client";
import { useState,useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const [content,setcontent] = useState<any>([]);

  //!load data

  useEffect(() => {
    const abortcontroller:any = new AbortController();

    const loaddata = async () => {
      try{
        const response:any = await axios.get("/api/getposts",{signal:abortcontroller.signal});
        if (response.status === 200) {
          setcontent(response.data);
        }
      }
      catch(err) {
        console.log(err);
      }
    }

    loaddata();

    return () => abortcontroller.abort();
  },[]);

  //!

  //!delete post

  const deletePost = useCallback( async (id:number) => {
    const abortcontroller:any = new AbortController();

    const response:any = await axios.delete(`/api/delete/${id}`,{signal:abortcontroller.signal});
    if (response.status === 200) {
      
    }

    return () => abortcontroller.abort();
  },[])

  //!

  return (
    <div className="p-[20px]">
      <h1 className="text-[40px] font-bold">My Post</h1>
      <table className="w-[100%] mt-[30px]">
        <thead>
          <tr>
            <th className="w-[33%]">Posts Name</th>
            <th className="w-[33%]">Create At</th>
            <th className="w-[33%]">Option</th>
          </tr>
        </thead>
        <tbody>
          {content.map((e:any,i:number) => (
            <tr key={i} className="border-b">
              <td className="text-center p-[20px_0]"><Link href={`/viewpost/${e.id}`}>{e.title}</Link></td>
              <td className="text-center p-[20px_0]">{e.createAt}</td>
              <td className="text-center p-[20px_0]">
                <Link href={`/edit/${e.id}`} className="mr-[10px] text-[#d0ca0b]">Edit</Link>
                <button onClick={() => deletePost(e.id)} className="mr-[10px] text-[#e03106]">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={"/createpost"} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[50px]">Create Post</Link>
    </div>
  );
}
