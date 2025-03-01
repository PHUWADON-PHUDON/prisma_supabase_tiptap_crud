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
  const [waitdelete,setwaitdelete] = useState<boolean>(true);

  //!load data

  const loaddata = async () => {
    const abortcontroller:AbortController = new AbortController();

    try{
      setwaitdata(true);
      const response = await axios.get("/api/getposts",{signal:abortcontroller.signal});
      if (response.status === 200) {
        setcontent(response.data);
        setwaitdata(false);
      }
    }
    catch(err) {
      console.log(err);
    }

    return () => abortcontroller.abort();
  }

  useEffect(() => {
    loaddata();
  },[]);

  //!

  //!delete post

  const deletePost = async (id:number,title:string) => {
    const abortcontroller:AbortController = new AbortController();

    const confirmdelete:boolean = confirm(`Delete ${title}`);

    if (confirmdelete) {
      try{
        setwaitdelete(false)
        const response = await axios.delete(`/api/delete/${id}`,{signal:abortcontroller.signal});
        if (response.status === 200) {
          loaddata();
          setwaitdelete(true);
        }
      }
      catch(err) {
        console.log(err);
      }
    }

    return () => abortcontroller.abort();
  }

  //!

  return (
    <div className="p-[20px]">
      <h1 className="text-[40px] font-bold">My Post</h1>
      {!waitdata ? 
        <>
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
                  <td className="text-center p-[20px_0]"><Link prefetch={false} className="text-[#4e8cf1] font-bold underline" href={`/viewpost/${e.id}`}>{e.title}</Link></td>
                  <td className="text-center p-[20px_0]">
                    <Link prefetch={false} href={`/edit/${e.id}`} className="mr-[10px] text-[#d0ca0b]">Edit</Link>
                    <button onClick={() => deletePost(e.id,e.title)} className="mr-[10px] text-[#e03106]">Delete</button>
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
        {waitdelete ? 
          <Link href={"/createpost"} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[50px]">Create Post</Link>
          :
          <p className="inline-block p-[10px_1.5rem] mt-[50px]">Loading...</p>
        }
        </>
        :
        <p className="mt-[50px] text-center">Loading...</p>
      }
    </div>
  );
}
