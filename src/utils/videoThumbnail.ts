import axios from 'axios';

/**
 * Função para extrair o ID de um vídeo do YouTube a partir da URL
 */
function extractYoutubeVideoId(url: string): string | null {
  // Formato padrão: https://www.youtube.com/watch?v=VIDEO_ID
  const regexWatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  // Formato de embed: https://www.youtube.com/embed/VIDEO_ID
  const regexEmbed = /youtube\.com\/embed\/([^?]+)/;
  // Formato encurtado: https://youtu.be/VIDEO_ID
  const regexShort = /youtu\.be\/([^?]+)/;
  
  const matchWatch = url.match(regexWatch);
  const matchEmbed = url.match(regexEmbed);
  const matchShort = url.match(regexShort);
  
  return matchWatch?.[1] || matchEmbed?.[1] || matchShort?.[1] || null;
}

/**
 * Função para extrair o ID de um vídeo do Vimeo a partir da URL
 */
function extractVimeoVideoId(url: string): string | null {
  // Formato padrão: https://vimeo.com/VIDEO_ID
  const regexStandard = /vimeo\.com\/(\d+)/;
  // Formato de embed: https://player.vimeo.com/video/VIDEO_ID
  const regexEmbed = /player\.vimeo\.com\/video\/(\d+)/;
  
  const matchStandard = url.match(regexStandard);
  const matchEmbed = url.match(regexEmbed);
  
  return matchStandard?.[1] || matchEmbed?.[1] || null;
}

/**
 * Função para extrair o ID de um vídeo do Loom a partir da URL
 */
function extractLoomVideoId(url: string): string | null {
  // Formato: https://www.loom.com/share/VIDEO_ID
  const regex = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  
  return match?.[1] || null;
}

// URL padrão para quando não for possível obter a thumbnail
const DEFAULT_THUMBNAIL = 'https://via.placeholder.com/640x360?text=Thumbnail+Indisponível';

/**
 * Obter a URL da thumbnail com base na plataforma e URL do vídeo
 * @returns Uma URL de thumbnail válida, ou uma imagem padrão caso não seja possível extrair
 */
export async function getVideoThumbnail(url: string, platform: string): Promise<string> {
  try {
    switch (platform) {
      case 'youtube': {
        const videoId = extractYoutubeVideoId(url);
        if (!videoId) return DEFAULT_THUMBNAIL;
        
        // YouTube oferece várias qualidades de thumbnail
        // maxresdefault (alta qualidade), hqdefault (média), mqdefault (baixa)
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      case 'vimeo': {
        const videoId = extractVimeoVideoId(url);
        if (!videoId) return DEFAULT_THUMBNAIL;
        
        // Para o Vimeo, precisamos fazer uma chamada à API
        try {
          const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
          const data = await response.json();
          
          if (data && data[0] && data[0].thumbnail_large) {
            return data[0].thumbnail_large;
          }
          
          return DEFAULT_THUMBNAIL;
        } catch (error) {
          console.error('Erro ao obter thumbnail do Vimeo:', error);
          return DEFAULT_THUMBNAIL;
        }
      }
      
      case 'loom': {
        const videoId = extractLoomVideoId(url);
        if (!videoId) return DEFAULT_THUMBNAIL;
        
        // O Loom não tem uma API pública para thumbnails
        // Geralmente usa um formato como:
        return `https://cdn.loom.com/sessions/thumbnails/${videoId}-with-play.jpg`;
      }
      
      default:
        return DEFAULT_THUMBNAIL;
    }
  } catch (error) {
    console.error('Erro ao obter thumbnail:', error);
    return DEFAULT_THUMBNAIL;
  }
}