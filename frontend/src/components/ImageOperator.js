import React, { useState, useRef } from 'react';

const ImageOperator = ({ upliftImage }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed!');
                return;
            }

            if (file.size > 1024 * 1024) {
                alert('File size should not exceed 1MB!');
                return;
            }
            upliftImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        upliftImage(null);
        setPreview(null);
        fileInputRef.current.value = null;
    };

    return (
        <div className='image-operator'>
            <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label> Describe a Picture </label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    ref={fileInputRef} 
                    style={{ marginTop: '5px' }}
                />
            </form>
            {preview && (
                <img
                    src={preview}
                    alt="Preview"
                    style={{ 
                        display: 'block', 
                        marginTop: '10px', 
                        maxWidth: '200px', 
                        maxHeight: '200px' 
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