var express = require(‘express’);
var port = process.env.PORT || 3000;
var app = express();
if(process.env.IS_DEBUG == ‘TRUE’){
app.use(express.static(__dirname + ‘/app’));
}
else{
app.use(express.static(__dirname + ‘/dist’));
}
app.listen(port);
