import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
const prisma:any = new PrismaClient();
const supabaseUrl:string = process.env.SUPABASE_URL || "";
const supabaseKey:string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase:any = createClient(supabaseUrl, supabaseKey);

export async function PUT(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    try{
        const formdata:any = await req.formData();
        const {id} = await params;
        const finddelete:any = formdata.getAll("finddelete");
        const images:any = formdata.getAll("images");
        const blobs:any = formdata.getAll("blobs");
        const inputtitle:string = formdata.get("inputtitle")
        let content:string = formdata.get("content");
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
        
        if (finddelete.length > 0) {
            console.log(finddelete)
            const deleteimages = await Promise.all(finddelete.map( async (e:any) => {
                const findimage = await prisma.image.findUnique({where:{id:Number(e)}});
                const deletefileimage = await supabase.storage.from("interstellar_image").remove(findimage.imagename);
                await prisma.image.delete({where:{id:Number(e)}});
            }));
        }

        if (images.length > 0) {
            uploadpromise = await Promise.all(images.map( async (file:any,i:number) => {
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

        const createpost = await prisma.post.update({
            where:{id:Number(id)},
            data:{
                title:inputtitle,
                content:content
            }
        });

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