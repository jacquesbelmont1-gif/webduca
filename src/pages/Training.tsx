import { useEffect } from 'react';
import { useTrainingStore } from '../store/training';

export function Training() {
  const { videos, fetchVideos } = useTrainingStore();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="p-8">
      <h2 className="text-white text-xl font-semibold mb-6">Aulas Disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="rounded-lg overflow-hidden group cursor-pointer">
            <div className="relative aspect-video">
              <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1" />
                </div>
              </div>
            </div>
            <div className="bg-[#112840] p-4">
              <h3 className="text-white font-medium">{video.title}</h3>
              <p className="text-[#b5cbe2] text-sm mt-1">{video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}