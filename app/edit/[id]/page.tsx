"use client";
import { useState,useCallback,useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Tiptap from "@/components/Tiptap";
import axios from "axios";

export default function Edit({params}:{params:Promise<{id:string}>}) {
    const [inputtitle,setinputtitle] = useState<string>("");
    const [inputfile,setinputfile] = useState<any>([]);
    const [content,setcontent] = useState<string>("");
    const [findimagesdelete,setfindimagesdelete] = useState<any>([]);
    const {id} = use(params);

    //!load data

    useEffect(() => {
        const abortcontroller:any = new AbortController();

        const loaddata = async () => {
            try{
                const response:any = await axios.get(`/api/getposts/${id}`); 
                if (response.status === 200) {
                    setinputtitle(response.data.title);
                    setcontent(response.data.content);
                    setfindimagesdelete(response.data.images);
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

    //!send edit post

    const edit = useCallback( async () => {
        const abortcontroller:any = new AbortController();

        try {
            const newinputfile:any = inputfile.filter((e:any) => {
                if (content.includes(e.blob)) {
                    return(e);
                }
            });

            const newfindimagesdelete:any = findimagesdelete.filter((e:any) => {
                if (!content.includes(e.imagename)) {
                    return(e);
                }
            });

            const formdata:any = new FormData();
            formdata.append("inputtitle",inputtitle);
            formdata.append("content",content);
            newinputfile.forEach((file:any) => {
                formdata.append("images",file.file);
                formdata.append("blobs",file.blob);
            });
            newfindimagesdelete.forEach((imagename:any) => {
                formdata.append("finddelete",imagename.id);
            });

           const response:any = await axios.put(`/api/upload/${id}`,formdata,{headers:{'content-type':'multipart/form-data'},signal:abortcontroller.signal});
           if (response.status === 200) {
              //
           }
        }
        catch(err) {
            console.log(err);
        }

        return () => abortcontroller.abort();
    },[inputtitle,inputfile,content,findimagesdelete])

    //!

    return(
        <div className="m-[20px]">
            <h1 className="text-[40px] font-bold">Edit Post</h1>
            <h2 className="mt-[20px] font-bold">Input Title:</h2>
            <input onChange={(e:any) => setinputtitle(e.target.value)} value={inputtitle} type="text" className="border mt-[10px] pl-[10px] focus:outline-none"/>
            <Tiptap content={content} setcontent={setcontent} setinputfile={setinputfile}/>
            <button onClick={() => edit()} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[30px]">Edit Post</button>
        </div>
    );
}