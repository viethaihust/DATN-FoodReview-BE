export default function extractResourceType(url: string): 'image' | 'video' {
  if (url.includes('/image/')) {
    return 'image';
  } else if (url.includes('/video/')) {
    return 'video';
  } else {
    throw new Error('Unknown resource type in URL');
  }
}
