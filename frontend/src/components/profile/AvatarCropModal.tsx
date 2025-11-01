// "use client";
// import { useAppDispatch } from "@/hooks/reduxHooks";
// import { changeAvatar } from "@/redux/authSlice";
// import ProfilesService from "@/services/ProfilesService";
// import { useState } from "react";
// import Cropper from "react-easy-crop";

// export default function AvatarCropModal({ image, onClose, }: { image: string, onClose: () => void }) {
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const dispatch = useAppDispatch();
//     const handleSave = async () => {
//         const s3Url = await ProfilesService.uploadImage(image)
//         dispatch(changeAvatar(image))
//         onClose();
//     };

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//             <div className="bg-white rounded-2xl p-4 shadow-lg w-[400px]">
//                 <h2 className="text-lg font-semibold mb-3">Adjust your avatar</h2>

//                 <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
//                     <Cropper
//                         image={image}
//                         crop={crop}
//                         zoom={zoom}
//                         aspect={1}
//                         cropShape="round"
//                         showGrid={false}
//                         onCropChange={setCrop}
//                         onZoomChange={setZoom}
//                     />
//                 </div>

//                 <div className="flex justify-end mt-4 gap-2">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 bg-gray-200 rounded-md"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-md"
//                     >
//                         Save
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
