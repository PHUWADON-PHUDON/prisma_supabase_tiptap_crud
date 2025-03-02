"use client";
import { useState,useEffect } from "react";
import { use } from "react";
import axios from "axios";

export default function Viewpost({params}:{params:Promise<{id:string}>}) {
    const [content,setcontent] = useState<string>("");
    const {id} = use(params);

    //!loaddata

    useEffect(() => {
        const abortcontroller:AbortController = new AbortController();
        
        const loaddata = async () => {
            try{
                const response = await axios.get(`/api/getposts/${id}`,{signal:abortcontroller.signal});
                if (response.status === 200) {
                    setcontent(response.data.content);
                }
            }
            catch(err) {
                console.log(err);
            }
        }

        loaddata();

        return () => abortcontroller.abort();
    },[])

    //!

    return(
        <div className="p-[20px]">
            {content ? 
                <div className="contentview" dangerouslySetInnerHTML={{ __html: content }} />
                :
                <p className="text-center">Loading...</p>
            }
        </div>
    );
}