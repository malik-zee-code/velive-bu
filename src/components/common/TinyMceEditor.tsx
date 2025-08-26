
'use client';
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMceEditorType } from 'tinymce';


interface TinyMceEditorProps {
    value: string;
    onEditorChange: (content: string) => void;
}

export const TinyMceEditor = ({ value, onEditorChange }: TinyMceEditorProps) => {
    const editorRef = useRef<TinyMceEditorType | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY; 

    if (!apiKey || apiKey === "YOUR_API_KEY") {
        console.warn("TinyMCE API key is not set. The editor may not function correctly. Please get a free key from tiny.cloud.");
    }
    
    return (
        <Editor
            apiKey={apiKey}
            onInit={(evt, editor) => editorRef.current = editor}
            value={value}
            onEditorChange={(newValue, editor) => onEditorChange(newValue)}
            init={{
                height: 500,
                menubar: true,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                skin: 'oxide',
                content_css: 'default',
            }}
        />
    );
};
