"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
const Tiptap = dynamic(() => import('@/components/Tiptap'), {ssr:false,loading: () => <p className="mt-[50px] text-center">Loading...</p>});

interface ImageFileType {
    file:File;
    blob:string;
}

interface Image {
    id: number;
    imagename:string;
    postid:number;
    createAt:string;
}

export default function Edit({params}:{params:Promise<{id:string}>}) {
    const [inputtitle,setinputtitle] = useState<string>("");
    const [inputfile,setinputfile] = useState<ImageFileType[]>([]);
    const [content,setcontent] = useState<string>("");
    const [findimagesdelete,setfindimagesdelete] = useState<Image[]>([]);
    const [waitedit,setwaitedit] = useState<boolean>(false);
    const [isload,setisload] = useState<boolean>(false);
    const router = useRouter();
    const {id} = use(params);

    //!load data

    useEffect(() => {
        const abortcontroller:AbortController = new AbortController();

        const loaddata = async () => {
            try{
                const response = await axios.get(`/api/getposts/${id}`); 
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

    const edit = async () => {
        const abortcontroller:AbortController = new AbortController();

        try {
            const newinputfile:ImageFileType[] = inputfile.filter((e:ImageFileType) => {
                if (content.includes(e.blob)) {
                    return(e);
                }
            });

            const newfindimagesdelete:Image[] = findimagesdelete.filter((e:Image) => {
                if (!content.includes(e.imagename)) {
                    return(e);
                }
            });

            const formdata:FormData = new FormData();
            formdata.append("inputtitle",inputtitle);
            formdata.append("content",content);
            newinputfile.forEach((file:ImageFileType) => {
                formdata.append("images",file.file);
                formdata.append("blobs",file.blob);
            });
            newfindimagesdelete.forEach((imagename:Image) => {
                formdata.append("finddelete",imagename.id.toString());
            });

            setwaitedit(true);

           const response = await axios.put(`/api/upload/${id}`,formdata,{headers:{'content-type':'multipart/form-data'},signal:abortcontroller.signal});
           if (response.status === 200) {
            router.push("/");
           }
        }
        catch(err) {
            console.log(err);
        }

        return () => abortcontroller.abort();
    }

    //!

    return(
        <div className="m-[20px]">
            <h1 className="text-[40px] font-bold">Edit Post</h1>
            <h2 className="mt-[20px] font-bold">Input Title:</h2>
            <input onChange={(e:React.ChangeEvent<HTMLInputElement>) => setinputtitle(e.target.value)} value={inputtitle} type="text" className="border mt-[10px] pl-[10px] focus:outline-none"/>
            {content ? 
                <>
                <Tiptap content={content} setcontent={setcontent} setinputfile={setinputfile} setisload={setisload}/>
                {waitedit ? 
                    <p className="inline-block p-[10px_1.5rem] mt-[30px]">Loading...</p>
                    :
                    (isload ? <button onClick={() => edit()} className="bg-[#4e8cf1] text-[#fff] inline-block p-[10px_1.5rem] font-bold rounded-[8px] mt-[30px]">Edit Post</button>:"")
                }
                </>
                :
                <p className="mt-[50px] text-center">Loading...</p>
            }
        </div>
    );
}