import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { QuestionForm } from '../components/QuestionForm';
import { QuestionsList } from '../components/QuestionsList';
import { useTrainingStore } from '../store/training';

export function Home() {
  const { videos, fetchVideos } = useTrainingStore();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const latestClasses = videos.slice(-3); // Pega as 3 últimas aulas

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div 
        className="h-64 lg:h-[400px] rounded-2xl bg-cover bg-center relative overflow-hidden group"
        style={{ backgroundImage: 'url(https://storage.googleapis.com/wisersp/storage/wsp-banners/flavio-live.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-white text-2xl lg:text-4xl font-bold mb-2">
            Bem-vindo ao WSP Platform
          </h1>
          <p className="text-white/80 text-sm lg:text-base">
            Sua plataforma completa de treinamento e desenvolvimento em vendas
          </p>
        </div>
      </div>

      <div className="bg-[#112840] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Últimas Aulas</h2>
          <button className="text-[#1079e2] flex items-center gap-2">
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestClasses.map(item => (
            <div key={item.id} className="bg-[#051524] rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#1079e2] text-white text-xs px-2 py-1 rounded">
                  #{item.id}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">{item.title}</h3>
                <p className="text-[#b5cbe2] text-sm mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <QuestionForm />
        <QuestionsList />
      </div>
    </div>
  );
}