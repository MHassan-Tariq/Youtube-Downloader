import axios from "axios";
import React, { useState } from "react";
import logo from "./assets/ytlogo.svg";

const App = () => {
  const [urlValue, setUrlValue] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
        const response = await axios.get(
          `${apiUrl}/download?url=${urlValue}`
        );
        setData(response.data);
    } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.error || "Something went wrong. Please check the URL and try again.";
        setError(errorMessage);
    } finally {
        setLoading(false);
        setUrlValue("");
    }
  };

  return (
    <div className="bg-white flex flex-col justify-center items-center min-h-screen text-black font-sans">
      <div className="flex flex-col justify-center items-center mb-8">
        <div className="mb-4">
          <img className="w-16 h-16 grayscale" src={logo} alt="logo" />
        </div>
        <div className="text-3xl font-bold tracking-tight">
          <h1>
            H/J Developments <span className="font-light text-gray-600">Youtube Downloader</span>
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full max-w-md px-4 gap-2">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleDownload();
            }}
            className={`w-full outline-none p-3 bg-white border-2 ${error ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-200 transition-all placeholder-gray-400`}
          />
        </div>
        <div className="bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors shadow-lg">
          <button className="w-full h-full px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDownload} disabled={loading}>
            {loading ? '...' : 'Download'}
          </button>
        </div>
      </div>
      
      {error && (
          <div className="mt-4 w-full max-w-md px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
          </div>
      )}

      <div className="mt-10 w-full max-w-2xl px-4">
        {data !== null ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-full mb-6">
              <h2 className="text-2xl font-bold text-center text-gray-800">{data.data.title}</h2>
            </div>
            <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-2xl mb-8 border border-gray-200">
              <iframe
                className="w-full h-full"
                src={`${data.data.url}`}
                title="video"
                allowFullScreen
              />
            </div>
            <div className="w-full">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Available Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Audio Column */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">A</span>
                    Audio
                  </h4>
                  <div className="flex flex-col gap-2">
                    {data?.data.info.filter(f => !f.hasVideo).map((formatName, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg group hover:border-black transition-all">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">
                            {formatName.mimeType.split(";")[0]}
                          </span>
                          <span className="text-xs text-gray-500">
                             Audio Only
                          </span>
                        </div>
                        <a
                          href={formatName.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                           <span>Download</span>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-3 3m0 0l3 3m-3-3h7.5M8.25 12.75L12 3" />
                           </svg>
                        </a>
                      </div>
                    ))}
                    {data?.data.info.filter(f => !f.hasVideo).length === 0 && (
                      <p className="text-gray-400 italic text-sm">No audio formats available</p>
                    )}
                  </div>
                </div>

                {/* Video Column */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">V</span>
                    Video
                  </h4>
                  <div className="flex flex-col gap-2">
                    {data?.data.info.filter(f => f.hasVideo).map((formatName, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg group hover:border-black transition-all">
                         <div className="flex flex-col">
                          <span className="font-medium text-black">
                             {formatName.height}p
                          </span>
                           <span className="text-xs text-gray-500">
                            {formatName.mimeType.split(";")[0]}
                          </span>
                        </div>
                        <a
                          href={formatName.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                           <span>Download</span>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-3 3m0 0l3 3m-3-3h7.5M8.25 12.75L12 3" />
                           </svg>
                        </a>
                      </div>
                    ))}
                    {data?.data.info.filter(f => f.hasVideo).length === 0 && (
                      <p className="text-gray-400 italic text-sm">No video formats available</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center mt-10 text-sm">
            Ready to download your favorite videos
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
