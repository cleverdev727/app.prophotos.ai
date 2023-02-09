$(document).ready(function() {
  $('#upload').click(function() {
    $('#images').click();
  });

  $('#images').change(function() {
    imagesPreview(this, "div.preview-images");
  });

  $('button').click(function() {
    const files = $('#images')[0].files;
    if (!$('#check')[0].checked) {
      event.preventDefault();
      alert('Please check the note.');
    } else {
      if (files.length < 4) {
        event.preventDefault();
        alert('You must select atleast 4 image');
      } else {
        $('button').toggleClass('bg-[#65D299] bg-orange-600');
        $('button').html('Uploading...');
        // event.preventDefault();
        // $('#uploading').toggleClass('hidden');
        // $('#loading').toggleClass('hidden flex');
      }
    }
  });

  let imagesPreview = function(input, placeToInsertImagePreview) {
    if (input.files) {
      let filesAmount = input.files.length;
      for (i = 0; i < filesAmount; i++) {
        let reader = new FileReader();
        reader.onload = function(event) {
          $($.parseHTML("<img>"))
            .attr("src", event.target.result)
            .appendTo(placeToInsertImagePreview);
        };
        reader.readAsDataURL(input.files[i]);
      }
    }
  };
});