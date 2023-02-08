$(document).ready(function() {
  $.post(
    '/loading/' + id,
    function(res) {
      console.log(res);
      location.href = '/gallery/' + res;
    }
  );
});