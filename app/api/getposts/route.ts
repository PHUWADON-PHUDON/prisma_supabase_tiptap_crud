import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req:NextRequest) {
    try{
        const getposts = await prisma.post.findMany();

        return(NextResponse.json(getposts));
    }
    catch(err) {
        return(NextResponse.json({err:err},{status:500}));
    }
}