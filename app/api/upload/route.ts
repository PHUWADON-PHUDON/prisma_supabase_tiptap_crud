import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
const prisma:any = new PrismaClient();
const supabaseUrl:string = process.env.SUPABASE_URL || "";
const supabaseKey:string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase:any = createClient(supabaseUrl, supabaseKey);

export async function POST(req:NextRequest) {
  try{
    const formData:any = await req.formData();
    let content:string = formData.get("content");
    let uploadpromise:any = [];
    
    const generateUniqueFileName = () => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
        now.getDate()
      ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
        now.getMinutes()
      ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const randomStr = Math.random().toString(36).substring(2, 10); // 8 ตัวอักษร random
      return `${dateStr}-${randomStr}`;
    }

    if (formData.getAll("images")) {
      const blobs:any = formData.getAll("blobs");

      uploadpromise = await Promise.all(formData.getAll("images").map( async (file:any,i:number) => {
        const filePath:string = `${generateUniqueFileName()}`;
        const uploadfile:any = await supabase.storage.from("interstellar_image").upload(filePath,file);
        const { data } = supabase.storage.from("interstellar_image").getPublicUrl(filePath);
        const imageurl:string = data.publicUrl;
        return({imageurl:imageurl,blob:blobs[i],filename:filePath});
      }));

      uploadpromise.forEach((e:any) => {
        content = content.replace(e.blob,e.imageurl);
      });
    }

    const createpost = await prisma.post.create({data:{
      title:formData.get("inputtitle"),
      content:content
    }});

    if (uploadpromise.length > 0) {
      const createimages = await Promise.all(uploadpromise.map( async (e:any) => {
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