import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
const prisma:PrismaClient = new PrismaClient();
const supabaseUrl:string = process.env.SUPABASE_URL || "";
const supabaseKey:string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface UploadPromiseType {
    imageurl:string;
    blob:string;
    filename:string;
}

interface FindImageType {
    id: number;
    imagename: string | null;
    postid: number;
    createAt: Date;
}

export async function PUT(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    try{
        const formdata:FormData = await req.formData();
        const {id} = await params;
        const finddelete:string[] = formdata.getAll("finddelete") as string[];
        const images:File[] = formdata.getAll("images") as File [];
        const blobs:string[] = formdata.getAll("blobs") as string[];
        const inputtitle:string = formdata.get("inputtitle") as string;
        let content:string= formdata.get("content") as string;
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
        
        if (finddelete.length > 0) {
           await Promise.all(finddelete.map( async (e:string) => {
                const findimage:FindImageType = await prisma.image.findUnique({where:{id:Number(e)}}) as FindImageType;
                if (findimage.imagename) {
                    const deletefileimage = await supabase.storage.from("interstellar_image").remove([findimage.imagename]);
                    await prisma.image.delete({where:{id:Number(e)}});
                }
            }));
        }

        if (images.length > 0) {
            uploadpromise = await Promise.all(images.map( async (file:File,i:number) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const compressedBuffer = await sharp(buffer).jpeg({ quality: 50 }).toBuffer();
                const compressedFile = new File([compressedBuffer], file.name, { type: "image/jpeg" });

                const filePath:string = `${generateUniqueFileName()}`;
                const uploadfile = await supabase.storage.from("interstellar_image").upload(filePath,compressedFile);
                const { data } = supabase.storage.from("interstellar_image").getPublicUrl(filePath);
                const imageurl:string = data.publicUrl;
                return({imageurl:imageurl,blob:blobs[i],filename:filePath});
            }));

            uploadpromise.forEach((e:UploadPromiseType) => {
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
            await Promise.all(uploadpromise.map( async (e:UploadPromiseType) => {
              await prisma.image.create({data:{
                imagename:e.filename,
                postid:Number(createpost.id),
              }});
            }));
        }

        return(NextResponse.json({}));
    }
    catch(err) {
        return(NextResponse.json({err:err},{status:500}));
    }
}