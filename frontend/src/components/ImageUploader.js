import React, { useState } from 'react';

const ImageUploader = ({setImage}) => {
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ position: "absolute", top: 0, right: 0}}>
            <form>
                <input type="file" accept="image/*" onChange={handleImageChange} />
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
        </div>
    );
};

export default ImageUploader;