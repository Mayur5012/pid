import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { Edit, Play, Pause, AlertTriangle,RefreshCw, Check, Square as SquareIcon } from "lucide-react";
import Navbar from "./Navbar";
import { io } from "socket.io-client";
import ReportDownloadButton from "./Report";


function Dashboard() {
  const [username, setUsername] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState([]);
  const [rtspUrl, setRtspUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [streamId, setStreamId] = useState(null);
  const [breaches, setBreaches] = useState([]);
  const [isDrawingPerimeter, setIsDrawingPerimeter] = useState(false);
  const [perimeter, setPerimeter] = useState([]);
  const [currentPerimeter, setCurrentPerimeter] = useState([]);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  
  const [isUpdatingPerimeter, setIsUpdatingPerimeter] = useState(false);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const stageRef = useRef(null);
  const socketRef = useRef(null);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user-info", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsername(data.user.name);
      } else {
        alert(data.message);
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      window.location.href = "/login";
    }
  };

  const handleLogout = () => {
    if (isPlaying) {
      stopStream();
    }
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const startStream = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://127.0.0.1:8000/api/start-stream", { // Added /api prefix
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Added Bearer prefix
            },
            body: JSON.stringify({ rtsp_url: rtspUrl }),
        });

        const data = await response.json();
        if (response.ok && data.streamId) {
            setStreamId(data.streamId);
            setIsPlaying(true);
            setStreamError(null);
            socketRef.current = connectWebSocket(data.streamId);
        } else {
            setStreamError(data.detail || "Failed to start stream");
        }
    } catch (error) {
        console.error("Failed to start stream:", error);
        setStreamError("Failed to start stream. Please check the server connection.");
    }
};
const stopStream = async () => {
  const token = localStorage.getItem("token");
  if (streamId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stop-stream/${streamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop stream: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to stop stream:", error);
      setStreamError("Failed to stop stream: " + error.message);
    }
  }

  if (socketRef.current) {
    socketRef.current.disconnect();
  }
  setStreamId(null);
  setIsPlaying(false);
};

  const handleStreamToggle = () => {
    if (isPlaying) {
      stopStream();
    } else {
      startStream();
    }
  };

 const connectWebSocket = (streamId) => {
    const socket = io("http://127.0.0.1:8000", {
      path: "/socket.io",
      transports: ["websocket"],
      upgrade: false,
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });
    
    socket.on("connect", () => {
      console.log("Socket.IO connected");
      setStreamError(null);
    });

    socket.on(`stream-${streamId}`, (data) => {
      if (videoRef.current && data.image) {
        videoRef.current.src = `data:image/jpeg;base64,${data.image}`;
      }
    });

    socket.on(`breach-${streamId}`, (breachData) => {
      setBreaches((prev) => [{
        id: Date.now(),
        time: new Date(breachData.timestamp).toLocaleString(),
        objectType: breachData.object_type || "Person",
        status: breachData.status || "Alert",
        confidence: breachData.confidence.toFixed(2),
        photo: `data:image/jpeg;base64,${breachData.image}`
      }, ...prev.slice(0, 49)]); // Keep last 50 breaches
    });

    socket.on(`stream-error-${streamId}`, (error) => {
      console.error("Stream error:", error);
      setStreamError(error.message || "Stream error occurred");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setStreamError("Connection failed - please try again");
      stopStream();
    });

    return socket;
  };


// Update perimeter function to include api prefix
const sendPerimeterToBackend = async (points) => {
  const videoContainer = document.querySelector('.video-container'); // Or however you select your video container
  const containerWidth = videoContainer.clientWidth;
  const containerHeight = videoContainer.clientHeight;
  console.log(containerHeight, containerWidth)
  console.log(videoContainer)
  try {
      const response = await fetch('http://127.0.0.1:8000/api/add-perimeter', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
              stream_id: streamId,
              points: points,
              containerWidth: containerWidth,
              containerHeight: containerHeight
          }),
      });

      console.log("Sending streamId to backend:", streamId);

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save perimeter");
      }
  } catch (error) {
      console.error("Error saving perimeter:", error);
      setStreamError("Failed to save perimeter boundary");
  }
};
  // Update the useEffect hook to clean up the socket connection:
  useEffect(() => {
    fetchUserInfo();

    const handleResize = () => {
        if (videoContainerRef.current && stageRef.current) {
            const container = videoContainerRef.current;
            const stage = stageRef.current;
            stage.width(container.offsetWidth);
            stage.height(container.offsetHeight);
        }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
        window.removeEventListener("resize", handleResize);

        if (socketRef.current) {
            socketRef.current.off(`stream-${streamId}`);
            socketRef.current.off(`breach-${streamId}`);
            socketRef.current.disconnect();
        }

        if (isPlaying) {
            stopStream();
        }
    };
}, []);
  const handleMouseDown = (e) => {
    if (!isDrawingPerimeter) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPerimeter([[pos.x, pos.y]]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingPerimeter || !currentPerimeter.length) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPerimeter([...currentPerimeter, [pos.x, pos.y]]);
  };

  const handleMouseUp = () => {
    if (!currentPerimeter.length || !isDrawingPerimeter) return;

    const finalPerimeter = [...currentPerimeter];
    if (finalPerimeter.length > 2) {
      finalPerimeter.push(finalPerimeter[0]); // Connect back to start
    }

    setPerimeter(finalPerimeter);
    setCurrentPerimeter([]);
    setIsDrawingPerimeter(false);

    if (streamId) {
      sendPerimeterToBackend(finalPerimeter);
    }
  };

  const handleDrawPerimeter = () => {
    setIsDrawingPerimeter(!isDrawingPerimeter);
    if (!isDrawingPerimeter) {
      setPerimeter([]);
      setCurrentPerimeter([]);
    }
  };


  return (
    <>
      <Navbar username={username} onLogout={handleLogout} />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Container */}
          <div className="w-full lg:w-[60%] bg-white rounded-lg shadow-md">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">PERIMETER BREACH DETECTION</h2>
                <div className="flex gap-2">
                <button
                    className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                      isDrawingPerimeter || isUpdatingPerimeter
                        ? "bg-blue-500 text-white"
                        : "bg-blue-100 text-blue-600"
                    } hover:bg-blue-200`}
                    onClick={handleDrawPerimeter}
                  >
                    {isUpdatingPerimeter ? (
                      <RefreshCw className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                    <span>
                      {isUpdatingPerimeter
                        ? "Update Perimeter"
                        : isDrawingPerimeter
                        ? "Drawing Perimeter"
                        : "Add Perimeter"}
                    </span>
                  </button>
                  
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter RTSP URL"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                />
                <button
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md transition-colors
                    ${
                      isPlaying
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } ${!rtspUrl && "opacity-50 cursor-not-allowed"}`}
                  onClick={handleStreamToggle}
                  disabled={!rtspUrl}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isPlaying ? "Stop" : "Start"}</span>
                </button>
              </div>

              {streamError && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  {streamError}
                </div>
              )}

              <div
                ref={videoContainerRef}
                className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gray-900 rounded-lg overflow-hidden"
              >
                <img
                  ref={videoRef}
                  className="video-container absolute top-0 left-0 w-full h-full object-contain"
                  alt="Live Stream"
                />
                <Stage
                  ref={stageRef}
                  className="absolute top-0 left-0 w-full h-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <Layer>
                    {perimeter.length > 0 && (
                      <Line
                        points={perimeter.flat()}
                        stroke="yellow"
                        strokeWidth={2}
                        closed={true}
                        fill="rgba(255, 255, 0, 0.1)"
                      />
                    )}
                    {currentPerimeter.length > 0 && (
                      <Line
                        points={currentPerimeter.flat()}
                        stroke="yellow"
                        strokeWidth={2}
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          {/* Breach Logs */}
          <div className="w-full lg:w-[40%] bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Breach Logs</h2>
              {streamId && (
  <ReportDownloadButton streamId={streamId} />
)}
              <div className="overflow-y-auto max-h-[70vh]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500">
                        Time
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500">
                        Object
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500">
                        Image
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {breaches.map((breach) => (
                      <tr key={breach.id} className="border-t">
                        <td className="py-2 text-sm text-gray-600">
                          {breach.time}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {breach.objectType}
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              breach.status === "Alert"
                                ? "bg-red-200 text-red-600"
                                : "bg-green-200 text-green-600"
                            }`}
                          >
                            {breach.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <img
                            src={breach.photo}
                            alt="Breach"
                            className="w-20 h-16 object-cover rounded cursor-pointer"
                            onClick={() => window.open(breach.photo, "_blank")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

