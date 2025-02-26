"use client";
import { useEffect,useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit';
import Image from "@tiptap/extension-image";

interface ImageItem {
    file:File;
    blob:string;
}

interface ContentType {
    content:string;
    setcontent:React.Dispatch<React.SetStateAction<string>>;
    setinputfile:React.Dispatch<React.SetStateAction<ImageItem[]>>;
    setisload:React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Tiptap({content,setcontent,setinputfile,setisload = () => null}:ContentType) {

    //!init editor and check load

    const editor = useEditor({
        extensions: [StarterKit,Image.configure({HTMLAttributes:{loading:"lazy"}})],
        content:content,
        onUpdate:({editor}) => setcontent(editor.getHTML())
    });

    useEffect(() => {
        if (editor) {
            setisload(true);
        }
    },[editor])

    //!

    //!add image and create blob

    const addImage = useCallback( async (event:React.ChangeEvent<HTMLInputElement>) => {
        const file:File = event.target.files![0];

        if (file) {
            if (!editor) return null;

            try{
                const clienturl:string = URL.createObjectURL(file);
                editor.chain().focus().setImage({ src: clienturl }).run();
                setinputfile((prev) => [...prev,{file:file,blob:clienturl}]);
            }
            catch(err) {
                console.log(err);
            }
        }
    },[editor]);

    //!

    //!check editor

    if (!editor) return null;

    //!

    return(
        <div className="mt-[20px]">
            <div className="flex gap-[10px]">
                <button 
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className='bg-gray-100 font-bold p-[5px_20px]'
                    style={editor.isActive("bold") ? {backgroundColor:"#000",color:"#fff"}:{}}
                >B</button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className='bg-gray-100 font-bold p-[5px_20px] italic'
                    style={editor.isActive("italic") ? {backgroundColor:"#000",color:"#fff"}:{}}
                >I</button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    disabled={!editor.can().chain().focus().toggleBulletList().run()}
                    className='bg-gray-100 font-bold p-[5px_20px]'
                    style={editor.isActive("bulletList") ? {backgroundColor:"#000",color:"#fff"}:{}}
                >BL</button>
                <input type="file" onChange={addImage} />
            </div>
            <EditorContent className='border p-[20px] mt-[10px]' editor={editor} />
        </div>
    );
}