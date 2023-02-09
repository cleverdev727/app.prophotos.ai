$(document).ready(function() {
  let content = '';
  const rows = JSON.parse(data);
  rows.forEach(row => {
    row.images.forEach(img => {
      content += '<div class="bg-[#D8D8D8] aspect-square"><a href="'+ img +'" target="_blank"><img src="'+ img +'" /></a></div>'
    });
  });
  $('#gallery').html(content);
});