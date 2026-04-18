 function urlFormator(file:any): string {


  const normalizedPath = file.path.replace(/\\/g, '/');
  const relative = normalizedPath.split('uploads')[1];

  return `${relative.startsWith('/') ? relative : '/' + relative}`;
}


export function getPublicUrl(file:any) {
    if(!file) return null
  if(!Array.isArray(file)){
    return urlFormator(file);
  }
  if(Array.isArray(file)){
    return file.map((f:any) => urlFormator(f))
  }
}


