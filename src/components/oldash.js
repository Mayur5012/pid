






// import React, { useEffect, useRef, useState } from "react";
// import { Stage, Layer, Line } from "react-konva";
// import { Edit, Play, Pause, AlertTriangle, Check } from "lucide-react";
// import Navbar from "./Navbar";

// function Dashboard() {
//   const [username, setUsername] = useState("");
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [lines, setLines] = useState([]);
//   const [currentLine, setCurrentLine] = useState([]);
//   const [rtspUrl, setRtspUrl] = useState("");
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [streamError, setStreamError] = useState(null);
//   const [streamId, setStreamId] = useState(null);
//   const [breaches, setBreaches] = useState([]);
//   const [isDrawingPerimeter, setIsDrawingPerimeter] = useState(false);
//   const [hasPerimeter, setHasPerimeter] = useState(false);

//   const [perimeter, setPerimeter] = useState([]);
//   const [currentPerimeter, setCurrentPerimeter] = useState([]);
//   const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

//   const videoRef = useRef(null);
//   const videoContainerRef = useRef(null);
//   const stageRef = useRef(null);
//   const socketRef = useRef(null);
//   const fetchUserInfo = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       window.location.href = "/login";
//       return;
//     }
  
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/user-info", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Error response from server:", errorData);
//         throw new Error('Unauthorized');
//       }
  
//       const data = await response.json();
//       if (data.success) {
//         setUsername(data.user.name);
//       } else {
//         alert(data.message);
//         window.location.href = "/login";
//       }
//     } catch (error) {
//       console.error("Error fetching user info:", error);
//       window.location.href = "/login";
//     }
//   };
  
  
//   const handleLogout = () => {
//     if (isPlaying) {
//       stopStream();
//     }
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   const fetchBreaches = async (streamId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `http://127.0.0.1:8000/api/breaches/${streamId}`,
//         {
//           headers: {
//             Authorization: token,
//           },
//         }
//       );
//       const data = await response.json();
//       setBreaches(
//         data.map((breach) => ({
//           ...breach,
//           id: breach.time,
//           time: new Date(breach.time).toLocaleString(),
//         }))
//       );
//     } catch (error) {
//       console.error("Error fetching breaches:", error);
//     }
//   };

//   const handleStreamToggle = async () => {
//     if (isPlaying) {
//       await stopStream();
//     } else {
//       await startStream();
//     }
//   };

//   const startStream = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:8000/start-stream", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token,
//         },
//         body: JSON.stringify({ rtsp_url: rtspUrl }),
//       });

//       const data = await response.json();
//       if (response.ok && data.streamId) {
//         setStreamId(data.streamId);
//         setIsPlaying(true);
//         setStreamError(null);
//         connectWebSocket(data.streamId);
//       } else {
//         setStreamError(data.detail || "Failed to start stream");
//       }
//     } catch (error) {
//       console.error("Failed to start stream:", error);
//       setStreamError("Failed to start stream");
//     }
//   };

//   const stopStream = async () => {
//     if (streamId) {
//       try {
//         const token = localStorage.getItem("token");
//         await fetch(`http://127.0.0.1:8000/stop-stream/${streamId}`, {
//           method: "POST",
//           headers: {
//             Authorization: token,
//           },
//         });
//       } catch (error) {
//         console.error("Failed to stop stream:", error);
//       }
//     }

//     if (socketRef.current) {
//       socketRef.current.close();
//     }
//     setStreamId(null);
//     setIsPlaying(false);
//     setHasPerimeter(false);
//   };

//   const handleDrawPerimeter = () => {
//     if (isDrawingPerimeter) {
//       // Cancel drawing
//       setCurrentPerimeter([]);
//       setIsDrawingPerimeter(false);
//     } else {
//       // Start drawing new perimeter
//       setPerimeter([]);
//       setIsDrawingPerimeter(true);
//       setHasPerimeter(false);
//     }
//   };

//   const sendPerimeterToBackend = async (points) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:8000/add-perimeter", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token,
//         },
//         body: JSON.stringify({
//           stream_id: streamId,
//           points: points,
//         }),
//       });

//       if (response.ok) {
//         setHasPerimeter(true);
//       }
//     } catch (error) {
//       console.error("Error saving perimeter:", error);
//     }
//   };

//   const connectWebSocket = (streamId) => {
//     if (socketRef.current) {
//       socketRef.current.close();
//     }
  
//     const token = localStorage.getItem("token");
//     socketRef.current = new WebSocket(
//       `ws://localhost:8000/stream/${streamId}?token=${token}`
//     );
//     socketRef.current.binaryType = "arraybuffer";
  
//     socketRef.current.onopen = () => {
//       console.log("WebSocket connection established");
//       setStreamError(null);
//     };
  
//     socketRef.current.onmessage = async (event) => {
//       try {
//         if (event.data instanceof ArrayBuffer) {
//           const blob = new Blob([event.data], { type: "image/jpeg" });
//           const imageUrl = URL.createObjectURL(blob);
  
//           if (videoRef.current) {
//             videoRef.current.src = imageUrl;
//             URL.revokeObjectURL(imageUrl);
//           }
//         } else {
//           // Handle JSON messages (breach notifications)
//           const message = JSON.parse(event.data);
//           if (message.type === "breach") {
//             // Fetch updated breaches when a new breach is detected
//             fetchBreaches(streamId);
//           }
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };
  
//     socketRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       setStreamError("Connection error occurred");
//     };
  
//     socketRef.current.onclose = () => {
//       if (isPlaying) {
//         setStreamError("Connection lost. Attempting to reconnect...");
//         setTimeout(() => {
//           if (isPlaying) {
//             connectWebSocket(streamId);
//           }
//         }, 2000);
//       }
//     };
//   };

//   const handleMouseDown = (e) => {
//     if (!isDrawingPerimeter) return;
//     const pos = e.target.getStage().getPointerPosition();
//     setCurrentPerimeter([[pos.x, pos.y]]);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawingPerimeter || !currentPerimeter.length) return;
//     const pos = e.target.getStage().getPointerPosition();
//     setCurrentPerimeter([...currentPerimeter, [pos.x, pos.y]]);
//   };

//   const handleMouseUp = () => {
//     if (!currentPerimeter.length || !isDrawingPerimeter) return;

//     const finalPerimeter = [...currentPerimeter];
//     if (finalPerimeter.length > 2) {
//       finalPerimeter.push(finalPerimeter[0]); // Connect back to start
//     }

//     setPerimeter(finalPerimeter);
//     setCurrentPerimeter([]);
//     setIsDrawingPerimeter(false);

//     if (streamId) {
//       sendPerimeterToBackend(finalPerimeter);
//     }
//   };

//   useEffect(() => {
//     if (streamId) {
//       fetchBreaches(streamId);
//       const interval = setInterval(() => fetchBreaches(streamId), 5000);
//       return () => clearInterval(interval);
//     }
//   }, [streamId]);
//   useEffect(() => {
//     fetchUserInfo();

//     const handleResize = () => {
//       if (videoContainerRef.current && stageRef.current) {
//         const container = videoContainerRef.current;
//         const stage = stageRef.current;

//         // Set stage size to match container
//         stage.width(container.offsetWidth);
//         stage.height(container.offsetHeight);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     // Initial size setup
//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (isPlaying) {
//         stopStream();
//       }
//     };
//   }, []);

//   return (
//     <>
//       <Navbar username={username} onLogout={handleLogout} />
//       <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
//         <div className="flex flex-col lg:flex-row gap-6">
//           {/* Video Container */}
//           <div className="w-full lg:w-[60%] bg-white rounded-lg shadow-md">
//             <div className="p-6 flex flex-col gap-4">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold">Live Feed</h2>
//                 <div className="flex gap-2">
//                   <button
//                     className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//                       isDrawingPerimeter
//                         ? "bg-blue-500 text-white"
//                         : "bg-blue-100 text-blue-600"
//                     } hover:bg-blue-200`}
//                     onClick={handleDrawPerimeter}
//                   >
//                     <Edit className="w-4 h-4" />
//                     <span>
//                       {hasPerimeter ? "Update Perimeter" : "Add Perimeter"}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <input
//                   type="text"
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter RTSP URL"
//                   value={rtspUrl}
//                   onChange={(e) => setRtspUrl(e.target.value)}
//                 />
//                 <button
//                   className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md transition-colors
//           ${
//             isPlaying
//               ? "bg-red-500 hover:bg-red-600 text-white"
//               : "bg-blue-500 hover:bg-blue-600 text-white"
//           } ${!rtspUrl && "opacity-50 cursor-not-allowed"}`}
//                   onClick={handleStreamToggle}
//                   disabled={!rtspUrl}
//                 >
//                   {isPlaying ? (
//                     <Pause className="w-4 h-4" />
//                   ) : (
//                     <Play className="w-4 h-4" />
//                   )}
//                   <span>{isPlaying ? "Stop" : "Start"}</span>
//                 </button>
//               </div>

//               {streamError && (
//                 <div className="p-4 bg-red-100 text-red-700 rounded-md">
//                   {streamError}
//                 </div>
//               )}

//               <div
//                 ref={videoContainerRef}
//                 className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gray-900 rounded-lg overflow-hidden"
//               >
//                 <img
//                   ref={videoRef}
//                   className="absolute top-0 left-0 w-full h-full object-contain"
//                   alt="Live Stream"
//                 />
//                 <Stage
//                   ref={stageRef}
//                   className="absolute top-0 left-0 w-full h-full"
//                   onMouseDown={handleMouseDown}
//                   onMouseMove={handleMouseMove}
//                   onMouseUp={handleMouseUp}
//                 >
//                   <Layer>
//                     {perimeter.length > 0 && (
//                       <Line
//                         points={perimeter.flat()}
//                         stroke="yellow"
//                         strokeWidth={2}
//                         closed={true}
//                         fill="rgba(255, 255, 0, 0.1)"
//                       />
//                     )}
//                     {currentPerimeter.length > 0 && (
//                       <Line
//                         points={currentPerimeter.flat()}
//                         stroke="yellow"
//                         strokeWidth={2}
//                       />
//                     )}
//                   </Layer>
//                 </Stage>
//               </div>
//             </div>
//           </div>

//           {/* Breach Logs */}
//           <div className="w-full lg:w-[40%] bg-white rounded-lg shadow-md">
//             <div className="p-6">
//               <h2 className="text-lg font-semibold mb-4">Breach Logs</h2>
//               <div className="overflow-y-auto max-h-[70vh]">
//               <table className="w-full">
//               <thead>
//                 <tr>
//                   <th className="text-left text-sm font-medium text-gray-500">Time</th>
//                   <th className="text-left text-sm font-medium text-gray-500">Objects</th>
//                   <th className="text-left text-sm font-medium text-gray-500">Status</th>
//                   <th className="text-left text-sm font-medium text-gray-500">Image</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {breaches.map((breach) => (
//                   <tr key={breach.id} className="border-t">
//                     <td className="py-2 text-sm text-gray-600">{breach.time}</td>
//                     <td className="py-2 text-sm text-gray-600">
//                       {Array.isArray(breach.objectTypes) 
//                         ? breach.objectTypes.join(", ")
//                         : breach.objectType}
//                     </td>
//                     <td className="py-2">
//                       <span
//                         className={`text-xs px-2 py-1 rounded-full ${
//                           breach.status === "Alert"
//                             ? "bg-red-200 text-red-600"
//                             : "bg-green-200 text-green-600"
//                         }`}
//                       >
//                         {breach.status}
//                       </span>
//                     </td>
//                     <td className="py-2">
//                       <img
//                         src={`/breaches/${breach.photo}`}
//                         alt="Breach"
//                         className="w-20 h-16 object-cover rounded cursor-pointer"
//                         onClick={() => window.open(`/breaches/${breach.photo}`, "_blank")}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Dashboard;
