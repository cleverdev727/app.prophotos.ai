$(document).ready(function() {
  let content = '';
  imgs.forEach(img => {
    content += '<div class="bg-[#D8D8D8] aspect-square"><a href="'+ img +'" target="_blank"><img src="'+ img +'" /></a></div>'
  });
  $('#gallery').html(content);
});