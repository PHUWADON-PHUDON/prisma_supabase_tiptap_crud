"use client";
import {useState,useEffect} from "react";
import Link from "next/link";
import axios from "axios";
import moment from "moment";

interface PostsType {
  id:number;
  title:string;
  content:string;
  createAt:string
}

export default function Home() {
  const [content,setcontent] = useState<PostsType[]>([]);
  const [waitdata,setwaitdata] = useState<boolean>(true);

  //!load data

  useEffect(() => {
    const abortcontroller:AbortController = new AbortController();

    const loaddata = async () => {
      try{
        setwaitdata(true);
        const response:any = await axios.get("/api/getposts",{signal:abortcontroller.signal});
        if (response.status === 200) {
          setcontent(response.data);
          setwaitdata(false);
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

  const deletePost = async (id:number) => {
    const abortcontroller:AbortController = new AbortController();

    const response:any = await axios.delete(`/api/delete/${id}`,{signal:abortcontroller.signal});
    if (response.status === 200) {
      
    }

    return () => abortcontroller.abort();
  }

  //!

  return (
    <div className="p-[20px]">
      <h1 className="text-[40px] font-bold">My Post</h1>
      {!waitdata ? 
        <table className="w-[100%] mt-[30px]">
          <thead>
            <tr>
              <th className="w-[33%]">Posts Name</th>
              <th className="w-[33%]">Option</th>
            </tr>
          </thead>
          <tbody>
            {content.length > 0 ? 
              (content.map((e:PostsType,i:number) => (
                <tr key={i} className="border-b">
                  <td className="text-center p-[20px_0]"><Link className="text-[#4e8cf1] font-bold underline" href={`/viewpost/${e.id}`}>{e.title}</Link></td>
                  <td className="text-center p-[20px_0]">
                    <Link href={`/edit/${e.id}`} className="mr-[10px] text-[#d0ca0b]">Edit</Link>
                    <button onClick={() => deletePost(e.id)} className="mr-[10px] text-[#e03106]">Delete</button>
                  </td>
                </tr>
              )))
              :
              <tr>
                <td colSpan={2} className="text-center p-[20px_0]">No Post!</td>
              </tr>
            }
          </tbody>
        </table>
        :
        <p className="mt-[50px] text-center">Loading...</p>
      }
      <Link href={"/createpost"} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[50px]">Create Post</Link>
    </div>
  );
}
