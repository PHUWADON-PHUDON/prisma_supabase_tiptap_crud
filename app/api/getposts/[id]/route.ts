import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma:PrismaClient = new PrismaClient();

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    try{
        const {id} = await params;

        const getposts = await prisma.post.findUnique({
            where:{id:Number(id)},
            include:{images:true}
        });

        return(NextResponse.json(getposts));
    }
    catch(err) {
        return(NextResponse.json({err:err},{status:500}));
    }
}