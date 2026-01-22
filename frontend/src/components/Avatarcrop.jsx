import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "./avatarCrop.css";

// util pour générer l'image recadrée
const getCroppedImg = async (imageSrc, crop) => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
        image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
    });
};

export default function AvatarCrop({ image, onValidate, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleValidate = async () => {
        const croppedFile = await getCroppedImg(image, croppedAreaPixels);
        onValidate(croppedFile);
    };

    return (
        <div className="crop-overlay">
            <div className="crop-modal">
                <h3>Recadrer votre photo</h3>

                <div className="crop-container">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                />

                <div className="crop-actions">
                    <button onClick={onCancel}>Annuler</button>
                    <button onClick={handleValidate}>Valider</button>
                </div>
            </div>
        </div>
    );
}
