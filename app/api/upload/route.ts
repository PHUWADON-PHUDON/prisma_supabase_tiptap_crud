import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
const prisma:PrismaClient = new PrismaClient();
const supabaseUrl:string = process.env.SUPABASE_URL || "";
const supabaseKey:string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface UploadPromiseType {
  imageurl:string;
  blob:string;
  filename:string;
}

export async function POST(req:NextRequest) {
  try{
    const formData:FormData = await req.formData();
    let content:string = formData.get("content") as string;
    let uploadpromise:UploadPromiseType[] = [];
    
    const generateUniqueFileName = () => {
      const now:Date = new Date();
      const dateStr:string = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
        now.getDate()
      ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
        now.getMinutes()
      ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const randomStr:string = Math.random().toString(36).substring(2, 10); // 8 ตัวอักษร random
      return `${dateStr}-${randomStr}`;
    }

    if (formData.getAll("images")) {
      const blobs:string[] = formData.getAll("blobs") as string[];

      uploadpromise = await Promise.all(formData.getAll("images").map( async (file,i:number) => {
        const filePath:string = `${generateUniqueFileName()}`;
        const uploadfile = await supabase.storage.from("interstellar_image").upload(filePath,file);
        const { data } = supabase.storage.from("interstellar_image").getPublicUrl(filePath);
        const imageurl:string = data.publicUrl;
        return({imageurl:imageurl,blob:blobs[i],filename:filePath});
      }));

      uploadpromise.forEach((e:UploadPromiseType) => {
        content = content.replace(e.blob,e.imageurl);
      });
    }

    const createpost = await prisma.post.create({data:{
      title:formData.get("inputtitle") as string,
      content:content
    }});

    if (uploadpromise.length > 0) {
      await Promise.all(uploadpromise.map( async (e:UploadPromiseType) => {
        await prisma.image.create({data:{
          imagename:e.filename,
          postid:createpost.id,
        }});
      }));
    }

    return(NextResponse.json({}));
  }
  catch(err) {
    return(NextResponse.json({err:err},{status:500}));
  }
}