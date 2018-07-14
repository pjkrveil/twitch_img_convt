var $parts = {
	file: undefined,
	select_btn: undefined,
	save_btn: undefined,
	canvas: undefined,
	img: undefined,
	radio: [undefined, undefined]
}

var FILE_NAME = "Image";
var SAVE_MODE = 0;
var LIMIT = {
	use: false,
	size: 2000
}

$(function(){
	if (!isSupport()) {
		$("<p> 브라우저에서 작동하지 않습니다. </p>").addClass("error-text").prependTo("body");
		return;
	}
	$parts.file = $("#file");
	$parts.select_btn = $("#select-btn");
	$parts.save_btn = $("#save-btn");
	$parts.canvas = $("#canvas");
	$parts.img = $("#result-image");
	$parts.radio[0] = $("#mode-convert");
	$parts.radio[1] = $("#mode-reinstate");
	setEventListener();
});

// note setEventListener ()

function setEventListener () {
	$parts.select_btn.on("click", function(){
		$parts.file.val("");
		selectFile();
	});
	$parts.file.on("change", function(){
		var _file = $parts.file[0].files[0];
		if (isImageFile(_file)) {
			FILE_NAME = _file.name.split(".");
			if (FILE_NAME.length > 1)
				FILE_NAME.pop();
			FILE_NAME.join("");
			runConvert(_file);
		}
		else{
			alert("이미지 파일이 없습니다.");
		}
	});
}

// note selectFile ()

function selectFile () {
	var _event = document.createEvent("MouseEvents"); //Adding Event Object
	_event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null); // Set the event
	$parts.file[0].dispatchEvent(_event);
}

// note saveFile ()
function saveFile () {
	var _dataURL = $parts.canvas[0].toDataURL(),
		_a = document.createElement("a");
	// Convert this for a save mode
	if (SAVE_MODE == 0) {
		var _blob = dataURLtoBlob(_dataURL);
		_a.href = getBlobURL(_blob);
	}
	else if (SAVE_MODE == 1) {
		_a.href = _dataURL;
	}
	_a.setAttribute("download", FILE_NAME+"_twi.png");
	var _event = document.createEvent("MouseEvents"); //Adding Event Object
	_event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null); // Set the event
	_a.dispatchEvent(_event);
}

// note isSupport ()
function isSupport () {
	if (!!window.File && !!window.FileReader && !!window.FileList && !!window.Blob && !!window.CanvasRenderingContext2D)
		return true;
	else
		return false;
}

// note isImageFile (file)
// If the file is img, then return True
function isImageFile(file){
	if (file.type.match(/image/))
		return true;
	else
		return false;
}

// note getConverterMode ()
function getConverterMode () {
	if ($parts.radio[0][0].checked)
		return 0;
	else if ($parts.radio[1][0].checked)
		return 1;
	else
		return 0;
}

// note getResultURL ()
function getResultURL () {
	var _dataURL = $parts.canvas[0].toDataURL();
	// Convert this for a save mode
	if (SAVE_MODE == 0) {
		var _blob = dataURLtoBlob(_dataURL);
		return getBlobURL(_blob);
	}
	else if (SAVE_MODE == 1) {
		return _dataURL;
	}
}

// note convertImageData (imageData)
function convertImageData (imageData, mode) {
	if (imageData == undefined || (mode != 0 && mode != 1)) return false;
	if (mode == 0) {
		if (imageData.data[3] > 252)
			imageData.data[3] = 252;
	}
	else if (mode == 1) {
		if (imageData.data[3] == 252)
			imageData.data[3] = 255;
	}
	return imageData;
}

// note dataURLtoBlob (dataURL)
// dataURLをBlobにして返す
// Ref: http://triplog.hatenablog.com/entry/2014/05/17/235900
// Ref: http://stackoverflow.com/questions/12168909/blob-from-dataurl
function dataURLtoBlob (dataURL) {
	var _byteString = atob(dataURL.split(",")[1]),
		_mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0],
		_ab = new ArrayBuffer(_byteString.length),
		_ia = new Uint8Array(_ab);
	for (var i=0; i < _byteString.length; i++) {
		_ia[i] = _byteString.charCodeAt(i);
	}

	return new Blob([_ia], {type: _mimeString});
}

// note getBlobURL (blob)
// BlobのURLを取得して返す
function getBlobURL (blob) {
	var _url = parent.URL || parent.webkitURL;
	if (_url == undefined) return;
	return _url.createObjectURL(blob);
}

// note runConvert (file)
function runConvert(file){
	var _reader = new FileReader();
	var _image = new Image();
	var _src;
	_reader.readAsDataURL(file);

	_reader.onload = function(e){
		_src = _reader.result;
		_image.onload = function(){
			var _w = _image.width,
				_h = _image.height,
				_canvas = $parts.canvas[0],
				_ctx = _canvas.getContext("2d");

			if(LIMIT.use && _w > LIMIT.size){
				var _p = LIMIT.size/_w;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			if(LIMIT.use && _h > LIMIT.size){
				var _p = LIMIT.size/_h;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			_canvas.width = _w;
			_canvas.height = _h;
			_ctx.drawImage(_image, 0, 0, _w, _h);
			_ctx.putImageData(
				convertImageData(_ctx.getImageData(0, 0, _w, _h), getConverterMode()), 0, 0);
			var _ResultURL = getResultURL();
			$parts.save_btn[0].href = _ResultURL;
			$parts.img[0].src = _ResultURL;
			$parts.img[0].alt = FILE_NAME;
			$parts.save_btn[0].setAttribute("download", FILE_NAME+"_twi_"+getConverterMode()+".png");
			$parts.save_btn.removeClass("inactive");
			setTimeout(function () {
				showNotice("변환이 완료되었습니다.", 2*1000);
			}, 300);

		}
		_image.src = _src;
	}
}

// note showNotice (text, show_time)
function showNotice (text, show_time) {
	var _$temp = $("<div class=\"notice\">"+text+"</div>");
	_$temp.appendTo($("body")).hide().fadeIn(200, function () {
		setTimeout(function () {
			_$temp.fadeOut(200, function () {
				_$temp.remove();
			});
		}, show_time);
	});
}



