"use client";
import { useState,useCallback } from "react";
import { useRouter } from "next/navigation";
import Tiptap from "@/components/Tiptap";
import axios from "axios";

export default function Createpost() {
    const [inputtitle,setinputtitle] = useState<string>("");
    const [inputfile,setinputfile] = useState<any>([]);
    const [content,setcontent] = useState<string>("<p>สวัสดี! เริ่มเขียนได้เลย</p>");
    const router = useRouter();

    const createPost = useCallback( async () => {
        const abortcontroller = new AbortController();

        try{
            if (inputtitle !== "") {
                const newinputfile = inputfile.filter((e:any) => {
                    if (content.includes(e.blob)) {
                        return(e);
                    }
                });

                const formdata = new FormData();
                formdata.append("inputtitle",inputtitle);
                formdata.append("content",content);
                newinputfile.forEach((file:any) => {
                    formdata.append("images",file.file);
                    formdata.append("blobs",file.blob);
                });

                const response = await axios.post("/api/upload",formdata,{headers:{'content-type':'multipart/form-data'},signal:abortcontroller.signal});
                if (response.status === 200) {
                    router.push("/");
                }
            }
            //console.log(inputfile);
        }
        catch(err) {
            console.log(err);
        }

        return () => abortcontroller.abort();
    },[inputtitle,content]);

    return(
        <div className="m-[20px]">
            <h1 className="text-[40px] font-bold">Create Post</h1>
            <h2 className="mt-[20px] font-bold">Input Title:</h2>
            <input onChange={(e:any) => setinputtitle(e.target.value)} type="text" className="border mt-[10px] pl-[10px] focus:outline-none"/>
            <Tiptap content={content} setcontent={setcontent} setinputfile={setinputfile}/>
            <button onClick={() => createPost()} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[30px]">Create Post</button>
        </div>
    );
}