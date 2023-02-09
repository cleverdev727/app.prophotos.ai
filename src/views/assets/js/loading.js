const socket = io.connect();
let reqId = null;
$.post(
  '/loading/' + id,
  function(res) {
    console.log(res);
    reqId = res;
    // location.href = '/gallery/' + res;
  }
);
socket.emit('test', 'test-val');
socket.on('created-all-prompt', function(tune_id) {
  console.log('prompt created');
  console.log(tune_id);
  if (tune_id == reqId) {
    location.href = '/gallery/' + reqId;
  }
});
socket.on('created-tune', function(msg) {
  console.log('tune created');
  console.log(msg);
});