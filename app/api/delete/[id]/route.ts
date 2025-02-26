import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
const prisma:PrismaClient = new PrismaClient();
const supabaseUrl:string = process.env.SUPABASE_URL || "";
const supabaseKey:string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    try{
        const {id} = await params;

        const findpost = await prisma.post.findUnique({where:{id:Number(id)},include:{images:true}});
        
        if (findpost) {
            if (findpost.images.length > 0) {
                await Promise.all(findpost.images.map( async (e) => {
                    if (e.imagename) {
                        const deletefileimage = await supabase.storage.from("interstellar_image").remove([e.imagename]);
                        await prisma.image.delete({where:{id:Number(e.id)}});
                    }
                }));
            }

            await prisma.post.delete({where:{id:Number(id)}});
        }

        return(NextResponse.json({}));
    }
    catch(err) {
        return(NextResponse.json({err:err},{status:500}));
    }
}