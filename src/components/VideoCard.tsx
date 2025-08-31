import React from 'react';
import { Edit } from 'lucide-react';
import { VideoData } from '../store/training';
import { Question } from '../store/questions';

interface VideoCardProps {
  video: VideoData;
  relatedQuestion?: Question;
  onEdit: () => void;
}

export function VideoCard({ video, relatedQuestion, onEdit }: VideoCardProps) {
  return (
    <div className="bg-[#112840] rounded-lg overflow-hidden h-full flex flex-col">
      <div className="relative">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-[#051524] flex items-center justify-center">
            <span className="text-[#b5cbe2]">Sem thumbnail</span>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-[#1079e2] text-white px-2 py-1 rounded-full text-xs">
          {video.platform}
        </span>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-white font-medium mb-2">{video.title}</h3>
        <p className="text-[#b5cbe2] text-sm mb-4 flex-1 line-clamp-3">
          {video.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-1 bg-[#1079e2]/20 text-[#1079e2] rounded text-xs">
              {video.category}
            </span>
            <span className="text-[#b5cbe2] text-xs">
              {new Date(video.createdAt || video.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {relatedQuestion && (
            <div className="mb-4 p-3 border border-[#051524] rounded bg-[#051524]">
              <p className="text-[#b5cbe2] text-xs mb-1">Pergunta relacionada:</p>
              <p className="text-white text-sm font-medium">{relatedQuestion.title}</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 bg-[#1079e2] text-white px-4 py-2 rounded-lg hover:bg-[#1079e2]/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 