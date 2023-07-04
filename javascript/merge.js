const merger = {
	popup:null,
	
	wrapper:null,
	
	bg:null,
	fg:null,
	w:0,
	h:0,
	
	svg:null,
	brush:null,
	
	canvas:null,
	ctx:null,
	bgData:null,
	fgData:null,
	
	link:null,
	
	scale:1,
	
	mouseButton:0,
};

function merger_onButtonClick() {
	merger.bg = document.querySelector('#local_repainter_original_image img');
	if(!merger.bg) return;
	merger.fg = document.querySelector('#local_repainter_mask_image img');
	if(!merger.fg) return;
	
	document.addEventListener('mouseup', merger_onMouseUp);

	document.addEventListener('contextmenu', function(ev){
		if(ev.target != merger.brush) return;
		ev.preventDefault();
	});
	
	merger_buildPopup();
	merger.popup.style.display = 'block';
	
	merger_refresh();
}

function merger_buildPopup() {
	if(merger.popup) return;
	
	merger.popup = document.createElement('div');
	merger.popup.classList.add('local_repainter_popup');
	document.body.appendChild(merger.popup);
	
	merger_buildWrapper();
	merger.popup.appendChild(merger.wrapper);
	merger.popup.appendChild(merger_createMenu());
}

function merger_buildWrapper() {
	merger.wrapper = document.createElement('div');
	merger.wrapper.classList.add('local_repainter_wrapper');
	
	merger_buildCanvas();
	merger_buildSvg();
	
	merger.wrapper.appendChild(merger.canvas);
	merger.wrapper.appendChild(merger.svg);
}

function merger_createMenu() {
	let menu = document.createElement('div');
	menu.classList.add('local_repainter_menu');
	
	let closeIcon = document.createElement('span');
	closeIcon.textContent = '×';
	closeIcon.addEventListener('click', merger_onCloseClick);
	menu.appendChild(closeIcon);
	
	let saveIcon = document.createElement('span');
	saveIcon.textContent = '🖫';
	saveIcon.addEventListener('click', merger_onSaveClick);
	menu.appendChild(saveIcon);
	
	return menu;
}

function merger_buildCanvas() {
	if(merger.canvas) return;
	
	merger.canvas = document.createElement('canvas');
	merger.canvas.classList.add('local_repainter_canvas');
	merger.ctx = merger.canvas.getContext('2d');
}
function merger_buildSvg() {
	if(merger.svg) return;
	
	merger.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	merger.svg.classList.add('local_repainter_svg');
	merger.svg.addEventListener('mousedown', merger_onMouseDown);
	merger.svg.addEventListener('mousemove', merger_onMouseMove);
	
	merger.brush = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	merger.brush.setAttribute('fill', 'rgba(0,0,0,0.5)');
	merger.brush.setAttribute('stroke', 'rgba(255,255,255,0.5)');
	merger.brush.setAttribute('stroke-width', '2');
	
	merger.svg.appendChild(merger.brush);
}

function merger_refresh() {
	let w = merger.bg.naturalWidth;
	let h = merger.bg.naturalHeight;
	
	merger.w = w;
	merger.h = h;
	
	merger.scale = Math.min(merger.wrapper.clientWidth/w, merger.wrapper.clientHeight/h);
	
	merger.canvas.setAttribute('width', w);
	merger.canvas.setAttribute('height', h);
	merger.canvas.style.transform = `scale(${merger.scale}) translate(-50%, -50%)`;
	
	merger.svg.setAttribute('width', w);
	merger.svg.setAttribute('height', h);
	merger.svg.style.transform = `scale(${merger.scale}) translate(-50%, -50%)`;
	
	let l = Math.ceil(Math.min(w,h)*0.1);
	merger.brush.setAttribute('x', Math.round((w-l)/2));
	merger.brush.setAttribute('y', Math.round((h-l)/2));
	merger.brush.setAttribute('width', l);
	merger.brush.setAttribute('height', l);
	
	merger.ctx.drawImage(merger.bg, 0, 0);
	merger.bgData = merger.ctx.getImageData(0, 0, w, h);
	merger.ctx.drawImage(merger.fg, 0, 0);
	merger.fgData = merger.ctx.getImageData(0, 0, w, h);
}


function merger_onMouseUp(ev) {
	merger_updateCanvas(merger.mouseButton);
	merger.mouseButton = 0;
}

function merger_onMouseDown(ev) {
	if((ev.buttons&1) > 0) {
		merger.mouseButton = 1;
	} else if((ev.buttons&2) > 0) {
		merger.mouseButton = 2;
	} else {
		merger.mouseButton = 0;
	}
}

function merger_onMouseMove(ev) {
	merger_setCenter(ev.offsetX, ev.offsetY);
	merger_updateCanvas(merger.mouseButton);
}

function merger_setCenter(x, y) {
	merger.brush.setAttribute('x', x - merger.brush.getAttribute('width')/2);
	merger.brush.setAttribute('y', y - merger.brush.getAttribute('height')/2);
}

function merger_updateCanvas(b) {
	if(b==0) return;
	
	let x = merger.brush.getAttribute('x');
	let y = merger.brush.getAttribute('y');
	let w = merger.brush.getAttribute('width');
	let h = merger.brush.getAttribute('height');
	
	let data = b==1 ? merger.bgData : merger.fgData;
	
	merger.ctx.putImageData(data, 0, 0, x, y, w, h);
}


function merger_onSaveClick() {
	let url = merger.canvas.toDataURL('image/png');
	
	merger.link ||= document.createElement('a');
	merger.link.setAttribute('href', url.replace('image/png', 'image/octet-stream'));
	merger.link.setAttribute('download', 'local-repainter-merged.png');
	
	merger.link.click();
}
function merger_onCloseClick() {
	if(merger.popup) {
		merger.popup.style.display = 'none';
	}
}
