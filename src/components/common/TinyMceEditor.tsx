
'use client';
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMceEditorProps {
    value: string;
    onEditorChange: (content: string) => void;
}

export const TinyMceEditor = ({ value, onEditorChange }: TinyMceEditorProps) => {
    const editorRef = useRef(null);
    // This is your public API key from TinyMCE.
    // Replace with your own key in a real application.
    const apiKey = "YOUR_API_KEY"; 

    if (!apiKey || apiKey === "YOUR_API_KEY") {
        console.warn("TinyMCE API key is not set. The editor will run in read-only mode. Please get a free key from tiny.cloud.");
    }
    
    return (
        <Editor
            apiKey={apiKey}
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={value}
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
                skin: (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'oxide-dark' : 'oxide',
                content_css: (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'default',

            }}
        />
    );
};
