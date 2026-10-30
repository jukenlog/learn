document.querySelectorAll('.video-thumb img').forEach(img=>{img.addEventListener('error',()=>{img.hidden=true;img.parentElement.classList.add('thumb-error')})});
