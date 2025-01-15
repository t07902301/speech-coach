import React, { useState, useRef } from 'react';

const ImageOperator = ({ setImage }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log("loading image");
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                console.log("image loaded");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setImage(null);
        setPreview(null);
        fileInputRef.current.value = null;
        console.log("image deleted");
    };

    return (
        <div style={{ position: "absolute", top: 0, right: 0 }}>
            <form>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    ref={fileInputRef} 
                />
            </form>
            {preview && (
                <img
                    src={preview}
                    alt="Preview"
                    style={{ 
                        display: 'block', 
                        marginTop: '10px', 
                        maxWidth: '100px', 
                        maxHeight: '100px' 
                    }}
                />
            )}
            {preview && (
                <button 
                    style={{ 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        padding: '5px 10px', 
                        textAlign: 'center', 
                        textDecoration: 'none', 
                        display: 'inline-block', 
                        fontSize: '12px', 
                        margin: '4px 2px', 
                        cursor: 'pointer', 
                        border: 'none', 
                        borderRadius: '4px' 
                    }} 
                    onClick={handleDeleteImage}
                >
                    Delete Image
                </button>
            )}
        </div>
    );
};

export default ImageOperator;