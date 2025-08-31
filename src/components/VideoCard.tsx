import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { VideoData } from '../store/training';
import { Question } from '../store/questions';

interface VideoCardProps {
  video: VideoData;
  relatedQuestion?: Question;
  onEdit: () => void;
}

export function VideoCard({ video, relatedQuestion, onEdit }: VideoCardProps) {
  return (
    <Card className="h-100 shadow-sm">
      <div className="position-relative">
        {video.thumbnail_url ? (
          <Card.Img 
            variant="top" 
            src={video.thumbnail_url} 
            alt={video.title}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Thumbnail+Indisponível';
            }}
          />
        ) : (
          <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
            <i className="bi bi-camera-video fs-1 text-secondary"></i>
          </div>
        )}
        <span className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 m-2 rounded-pill small">
          {video.platform}
        </span>
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title>{video.title}</Card.Title>
        <Card.Text className="text-muted small mb-3" style={{ minHeight: '3rem', maxHeight: '3rem', overflow: 'hidden' }}>
          {video.description}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-light text-dark">
              {video.category}
            </span>
            <small className="text-muted">
              {new Date(video.createdAt).toLocaleDateString()}
            </small>
          </div>
          
          {relatedQuestion && (
            <div className="mb-3 p-2 border rounded bg-light">
              <small className="d-block text-muted mb-1">Pergunta relacionada:</small>
              <span className="small fw-semibold">{relatedQuestion.title}</span>
            </div>
          )}
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onEdit}
            >
              Editar
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 